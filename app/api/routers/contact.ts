import { z } from "zod";
import { createRouter, protectedQuery, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { contactMessages } from "@db/schema";
import { eq } from "drizzle-orm";

export const contactRouter = createRouter({
  list: protectedQuery.query(async () => {
    const db = getDb();
    return db.select().from(contactMessages).orderBy(contactMessages.createdAt);
  }),

  create: publicQuery
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
        subject: z.string().min(1),
        message: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(contactMessages).values(input);
      return { success: true };
    }),

  markRead: protectedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(contactMessages)
        .set({ read: "read" })
        .where(eq(contactMessages.id, input.id));
      return { success: true };
    }),
});
