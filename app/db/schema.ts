import {
  mysqlTable,
  serial,
  varchar,
  text,
  timestamp,
  mysqlEnum,
} from "drizzle-orm/mysql-core";

// Contact form submissions from Written Word page
export const contactMessages = mysqlTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  message: text("message").notNull(),
  read: mysqlEnum("read", ["unread", "read"]).notNull().default("unread"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Tattoo booking requests from Velvet Ink page
export const tattooBookings = mysqlTable("tattoo_bookings", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  description: text("description").notNull(),
  size: varchar("size", { length: 255 }),
  placement: varchar("placement", { length: 255 }),
  preferredDates: text("preferred_dates"),
  referenceImages: text("reference_images"),
  status: mysqlEnum("status", ["pending", "confirmed", "cancelled"]).notNull().default("pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Commission art requests from Shop page
export const commissionRequests = mysqlTable("commission_requests", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  commissionType: varchar("commission_type", { length: 255 }).notNull(),
  description: text("description").notNull(),
  size: varchar("size", { length: 255 }),
  budget: varchar("budget", { length: 100 }),
  referenceImages: text("reference_images"),
  status: mysqlEnum("status", ["pending", "in_progress", "completed", "declined"]).notNull().default("pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
