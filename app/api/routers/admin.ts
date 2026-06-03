import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createRouter, protectedQuery, publicQuery } from "../middleware";
import {
  createAdminSession,
  serializeAdminLogoutCookie,
  serializeAdminSessionCookie,
  verifyAdminPassword,
} from "../lib/auth";
import { listEvents, recordEvent } from "../lib/monitoring";

export const adminRouter = createRouter({
  session: publicQuery.query(({ ctx }) => ({
    authenticated: ctx.isAdmin,
  })),

  login: publicQuery
    .input(z.object({ password: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      let valid = false;
      try {
        valid = verifyAdminPassword(input.password);
      } catch (error) {
        await recordEvent("auth_error", "Admin password is not configured", {
          path: "/api/trpc/admin.login",
          details: { error: error instanceof Error ? error.message : String(error) },
        });
      }

      if (!valid) {
        await recordEvent("auth_error", "Failed admin login attempt", {
          path: "/api/trpc/admin.login",
        });
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid admin credentials" });
      }

      ctx.resHeaders.append("Set-Cookie", serializeAdminSessionCookie(createAdminSession()));
      return { success: true };
    }),

  logout: publicQuery.mutation(({ ctx }) => {
    ctx.resHeaders.append("Set-Cookie", serializeAdminLogoutCookie());
    return { success: true };
  }),

  monitoring: protectedQuery.query(async () => ({
    health: {
      status: "ok",
      checkedAt: new Date().toISOString(),
    },
    events: await listEvents(25),
  })),
});
