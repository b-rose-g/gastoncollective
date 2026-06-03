/**
 * Central API router — register all tRPC sub-routers here.
 *
 * Each router exported here becomes available on the tRPC client as:
 *   trpc.{routerName}.{procedureName}.useQuery() / useMutation()
 *
 * Add your routers alongside the examples below.
 */

import { createRouter } from "./middleware";
import { contactRouter } from "./routers/contact";
import { bookingRouter } from "./routers/booking";
import { commissionRouter } from "./routers/commission";

export const appRouter = createRouter({
  contact: contactRouter,
  booking: bookingRouter,
  commission: commissionRouter,
});

export type AppRouter = typeof appRouter;
