import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { verifyAdminSession } from "./lib/auth";

export type TrpcContext = {
  req: Request;
  resHeaders: Headers;
  isAdmin: boolean;
};

export async function createContext(
  opts: FetchCreateContextFnOptions,
): Promise<TrpcContext> {
  return {
    req: opts.req,
    resHeaders: opts.resHeaders,
    isAdmin: verifyAdminSession(opts.req.headers.get("cookie")),
  };
}
