import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { commissionRequests } from "@db/schema";
import { eq } from "drizzle-orm";

export const commissionRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(commissionRequests).orderBy(commissionRequests.createdAt);
  }),

  create: publicQuery
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
        commissionType: z.string().min(1),
        description: z.string().min(1),
        size: z.string().optional(),
        budget: z.string().optional(),
        referenceImages: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(commissionRequests).values(input);
      return { success: true };
    }),

  updateStatus: publicQuery
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["pending", "in_progress", "completed", "declined"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(commissionRequests)
        .set({ status: input.status })
        .where(eq(commissionRequests.id, input.id));
      return { success: true };
    }),

  addNotes: publicQuery
    .input(z.object({ id: z.number(), notes: z.string() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(commissionRequests)
        .set({ notes: input.notes })
        .where(eq(commissionRequests.id, input.id));
      return { success: true };
    }),
});
