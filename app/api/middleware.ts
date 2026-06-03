import { initTRPC } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

const requireAdmin = t.middleware(({ ctx, next }) => {
  if (!ctx.isAdmin) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Admin session required" });
  }

  return next({ ctx });
});

export const createRouter = t.router;
export const publicQuery = t.procedure;
export const protectedQuery = t.procedure.use(requireAdmin);
