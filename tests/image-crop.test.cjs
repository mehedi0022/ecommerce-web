const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const ts=require('typescript');
const m={exports:{}};
new Function('module','exports',ts.transpileModule(fs.readFileSync('components/media/image-crop.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText)(m,m.exports);
const {imageFilename,cropImage,IMAGE_PRESETS}=m.exports;
test('title wins, original name is fallback, timestamp and extension are retained',()=>{
assert.equal(imageFilename('DSC.jpg','Cotton Shirt','webp',123),'cotton-shirt-123.webp');
assert.equal(imageFilename('Summer Photo.png','  ','png',123),'summer-photo-123.png');
assert.equal(imageFilename('photo.jpg','বাংলা নাম','webp',123),'বাংলা-নাম-123.webp');
assert.equal(imageFilename('../../photo.jpg','../ unsafe / title','webp',123),'unsafe-title-123.webp');
});
test('all presets export exact dimensions even from smaller crops',async()=>{
global.Image=class{async decode(){}};
for(const [kind,size] of Object.entries(IMAGE_PRESETS)){
let drawn;
const canvas={width:0,height:0,getContext:()=>({drawImage(...args){drawn=args}}),toBlob(cb,type){cb(new Blob(['image'],{type}))}};
global.document={createElement:()=>canvas};
const file=await cropImage('data:',{x:0,y:0,width:80,height:80},'original.jpg','Test Title',size);
assert.equal(canvas.width,size.width,kind);assert.equal(canvas.height,size.height,kind);
assert.deepEqual(drawn.slice(-2),[size.width,size.height]);
assert.match(file.name,/^test-title-\d+\.webp$/);assert.equal(file.type,'image/webp');
}
delete global.Image;delete global.document;
});
