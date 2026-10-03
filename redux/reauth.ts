import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query/react";

type Query = BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>;
const publicAuth = new Set(["/auth/login", "/auth/register", "/auth/refresh", "/auth/logout", "/auth/forgot-password", "/auth/reset-password", "/auth/verify-email"]);

/** One refresh per Redux store; late 401s retry against the newer cookie. */
export function withReauth(raw: Query): Query {
  const sessions = new WeakMap<object, { generation: number; refresh?: Promise<Awaited<ReturnType<Query>>> }>();
  return async (args, api, extra) => {
    const url = (typeof args === "string" ? args : args.url).split("?")[0];
    if (publicAuth.has(url)) return raw(args, api, extra);
    let session = sessions.get(api.dispatch);
    if (!session) { session = { generation: 0 }; sessions.set(api.dispatch, session); }
    // New requests wait for rotation instead of knowingly using an old cookie.
    const pending = session.refresh;
    if (pending) { const refreshed = await pending; if (refreshed.error) return refreshed; }
    const generation = session.generation;
    let result = await raw(args, api, extra);
    if (result.error?.status !== 401) return result;
    if (generation === session.generation) {
      if (!session.refresh) {
        const current = session;
        current.refresh = (async () => {
          const refresh = await raw({ url: "/auth/refresh", method: "POST" }, api, extra);
          if (!refresh.error) current.generation++;
          else if (refresh.error.status === 401) api.dispatch({ type: "auth/clearSession" });
          return refresh;
        })().finally(() => { current.refresh = undefined; });
      }
      const refreshed = await session.refresh!;
      // Network/5xx errors are recoverable, not evidence of a logged-out session.
      if (refreshed.error) return refreshed;
    }
    result = await raw(args, api, extra);
    if (result.error?.status === 401) api.dispatch({ type: "auth/clearSession" });
    return result;
  };
}
