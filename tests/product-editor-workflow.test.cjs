const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
// Pure workflow modules have only type imports; compile them without loading Next or a browser.
function load(name) {
  const module = { exports: {} };
  const source = fs.readFileSync(path.join(__dirname, '../modules/product', name), 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  new Function('module', 'exports', compiled)(module, module.exports);
  return module.exports;
}
const { saveEditor, validateEditor } = load('editor-workflow.ts');
const { initialForm, newJournal } = load('editor.types.ts');
const stock = { quantity: 10, availableQuantity: 10, reservedQuantity: 0, lowStockThreshold: 5 };
function fixture() {
  const form = initialForm(); form.name = 'Cotton shirt'; form.primaryCategoryId = '1'; form.categoryIds = [1];
  Object.assign(form.variants[0], { sku: 'SHIRT', price: '12.50', stock: '10' });
  form.images = [{ key: 'photo', url: 'blob:photo', file: {}, altText: 'Shirt', isPrimary: true, attributeValueIds: [] }];
  return form;
}
function operations() {
  const calls = [];
  const api = {};
  for (const name of ['createProduct', 'updateProduct', 'createVariant', 'updateVariant', 'deleteVariant', 'getInventory', 'initializeInventory', 'uploadImage', 'updateImage', 'deleteImage', 'setStatus']) {
    api[name] = async (...args) => { calls.push([name, ...args]); return name === 'getInventory' ? null : name === 'initializeInventory' ? stock : { id: name === 'createProduct' ? 123 : 456 }; };
  }
  return { api, calls };
}
test('name-only draft is valid but cannot publish', () => {
  const form = initialForm(); form.name = 'Draft';
  assert.deepEqual(validateEditor(form, [], 'DRAFT'), {});
  assert.ok(validateEditor(form, [], 'ACTIVE').variants);
  assert.ok(validateEditor(form, [], 'ACTIVE').images);
});
test('entered incomplete rows, missing required options and duplicate combinations are rejected', () => {
  const form = fixture(); form.variants[0].price = '';
  const attributes = [{ id: 2, name: 'Size', isRequired: true, values: [{ id: 20, value: 'M' }] }];
  const errors = validateEditor(form, attributes, 'DRAFT');
  assert.ok(errors['variant-initial-price']); assert.ok(errors['variant-initial-attribute-2']);
  form.variants[0].price = '12.50'; form.variants[0].selections = { 2: 20 };
  form.variants.push({ ...form.variants[0], key: 'second', sku: 'OTHER' });
  assert.ok(validateEditor(form, attributes, 'ACTIVE')['variant-second-attributes']);
});
test('creation starts private, initializes stock and publishes only after photos', async () => {
  const { api, calls } = operations(); const journal = newJournal(); const checkpoints = [];
  await saveEditor(fixture(), 'ACTIVE', journal, undefined, api, () => {}, () => checkpoints.push(structuredClone(journal)));
  assert.deepEqual(calls.map(call => call[0]), ['createProduct', 'createVariant', 'getInventory', 'initializeInventory', 'uploadImage', 'setStatus']);
  assert.equal(calls[0][1].status, 'DRAFT');
  assert.equal(checkpoints[0].productId, 123); assert.equal(journal.status, 'ACTIVE');
});
test('retry after rejected photo skips successful creation, variants and stock', async () => {
  const { api, calls } = operations(); const journal = newJournal(); const form = fixture();
  const upload = api.uploadImage; let attempts = 0;
  api.uploadImage = async (...args) => { if (++attempts === 1) throw { status: 400 }; return upload(...args); };
  await assert.rejects(saveEditor(form, 'ACTIVE', journal, undefined, api, () => {}, () => {}));
  assert.equal(journal.status, 'DRAFT'); assert.ok(!calls.some(call => call[0] === 'setStatus'));
  await saveEditor(form, 'ACTIVE', journal, undefined, api, () => {}, () => {});
  for (const name of ['createProduct', 'createVariant', 'initializeInventory']) assert.equal(calls.filter(call => call[0] === name).length, 1);
});
test('a repeated successful save is idempotent within the editor', async () => {
  const { api, calls } = operations(); const journal = newJournal(); const form = fixture();
  await saveEditor(form, 'ACTIVE', journal, undefined, api, () => {}, () => {});
  const count = calls.length;
  await saveEditor(form, 'ACTIVE', journal, undefined, api, () => {}, () => {});
  assert.equal(calls.length, count);
});
test('unconfirmed create is blocked from automatic replay', async () => {
  const { api } = operations(); const journal = newJournal(); let creates = 0;
  api.createProduct = async () => { creates++; throw { status: 'FETCH_ERROR' }; };
  await assert.rejects(saveEditor(fixture(), 'ACTIVE', journal, undefined, api, () => {}, () => {}));
  assert.equal(journal.needsReview, true);
  await assert.rejects(saveEditor(fixture(), 'ACTIVE', journal, undefined, api, () => {}, () => {}));
  assert.equal(creates, 1);
});
test('inventory response loss is reconciled without adding stock twice', async () => {
  const { api } = operations(); const journal = newJournal(); let reads = 0; let initializes = 0;
  api.getInventory = async () => ++reads === 1 ? null : stock;
  api.initializeInventory = async () => { initializes++; throw { status: 'FETCH_ERROR' }; };
  await saveEditor(fixture(), 'ACTIVE', journal, undefined, api, () => {}, () => {});
  assert.equal(initializes, 1); assert.deepEqual(journal.stock.initial, stock);
});
test('stock lookup permission failure stops publishing instead of initializing blindly', async () => {
  const { api, calls } = operations(); const journal = newJournal();
  api.getInventory = async () => { throw { status: 403 }; };
  await assert.rejects(saveEditor(fixture(), 'ACTIVE', journal, undefined, api, () => {}, () => {}));
  assert.ok(!calls.some(call => ['initializeInventory', 'setStatus'].includes(call[0])));
});
test('existing secondary categories and explicit hidden status survive a save', async () => {
  const { api, calls } = operations(); const journal = newJournal(); const form = fixture();
  journal.productId = 12; journal.status = 'ACTIVE'; form.categoryIds = [1, 2];
  await saveEditor(form, 'INACTIVE', journal, undefined, api, () => {}, () => {});
  assert.deepEqual(calls[0][2].categories.map(category => category.categoryId), [1, 2]);
  assert.deepEqual(calls.at(-1), ['setStatus', 12, 'INACTIVE']);
});
test('persisted deletions are sent once and cover is saved last', async () => {
  const { api, calls } = operations(); const journal = newJournal(); const form = fixture(); journal.productId = 12;
  form.images.push({ key: 'second', url: 'blob:second', file: {}, altText: 'Back', isPrimary: false, attributeValueIds: [] });
  const initial = { variants: [{ id: 98 }], images: [{ id: 99 }] };
  await saveEditor(form, 'DRAFT', journal, initial, api, () => {}, () => {});
  await saveEditor(form, 'DRAFT', journal, initial, api, () => {}, () => {});
  assert.equal(calls.filter(call => call[0] === 'deleteVariant').length, 1);
  assert.equal(calls.filter(call => call[0] === 'deleteImage').length, 1);
  assert.equal(calls.filter(call => call[0] === 'uploadImage').at(-1)[2].isPrimary, true);
});
