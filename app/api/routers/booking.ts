import { z } from "zod";
import { createRouter, protectedQuery, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { tattooBookings } from "@db/schema";
import { eq } from "drizzle-orm";

export const bookingRouter = createRouter({
  list: protectedQuery.query(async () => {
    const db = getDb();
    return db.select().from(tattooBookings).orderBy(tattooBookings.createdAt);
  }),

  create: publicQuery
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
        phone: z.string().optional(),
        description: z.string().min(1),
        size: z.string().optional(),
        placement: z.string().optional(),
        preferredDates: z.string().optional(),
        referenceImages: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(tattooBookings).values(input);
      return { success: true };
    }),

  updateStatus: protectedQuery
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["pending", "confirmed", "cancelled"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(tattooBookings)
        .set({ status: input.status })
        .where(eq(tattooBookings.id, input.id));
      return { success: true };
    }),

  addNotes: protectedQuery
    .input(z.object({ id: z.number(), notes: z.string() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(tattooBookings)
        .set({ notes: input.notes })
        .where(eq(tattooBookings.id, input.id));
      return { success: true };
    }),
});
