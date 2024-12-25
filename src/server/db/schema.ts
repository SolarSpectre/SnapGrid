// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql, relations } from "drizzle-orm";
import {
  index,
  integer,
  pgTable,
  pgTableCreator,
  primaryKey,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createImgTable = pgTableCreator((name) => `gallery_${name}`);
export const createAlbumTable = pgTableCreator((name) => `gallery_${name}`);

export const users = createAlbumTable(
  "user",
  {
    id: varchar("id", { length: 256 }).primaryKey(), // Clerk user ID
    email: varchar("email", { length: 256 }).notNull(),
    firstName: varchar("firstName", { length: 256 }),
    lastName: varchar("lastName", { length: 256 }),
    imageUrl: varchar("imageUrl", { length: 1024 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  }
);
export const images = createImgTable(
  "image",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    name: varchar("name", { length: 256 }).notNull(),
    url: varchar("url", { length: 1024 }).notNull(),
    userId: varchar("userId", { length: 256 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),
  },
  (example) => ({
    nameIndex: index("name_idx").on(example.name),
  }),
);
export const album = createAlbumTable(
  "album",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    name: varchar("name", { length: 256 }).notNull(),
    description: varchar("description", { length: 1024 }).notNull(),
    userId: varchar("userId", { length: 256 }).notNull(),
    colaborators: varchar("colaborators", { length: 256 })
    .array()
    .notNull()
    .default(sql`ARRAY[]::varchar[]`),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),
  },
  (example) => ({
    nameIndex: index("Al_name_idx").on(example.name),
  }),
);

export const albumImage = pgTable(
  "album_image",
  {
    albumId: integer("album_id").references(() => album.id, {
      onDelete: "cascade",
    }),
    imageId: integer("image_id").references(() => images.id, {
      onDelete: "cascade",
    }),
    userId: varchar("userId", { length: 256 }).notNull(),
  },
  (table) => ({
    primaryKey: primaryKey({ columns: [table.albumId, table.imageId] }),
  }),
);
export const friend = createAlbumTable(
  "friend",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    userId: varchar("userId", { length: 256 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    friendId: varchar("friendId", { length: 256 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: varchar("status", { length: 20 }).notNull().default("pending"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  }
);

export const friendRelations = relations(friend, ({ one }) => ({
  user: one(users, {
    fields: [friend.userId],
    references: [users.id],
  }),
  friendUser: one(users, {
    fields: [friend.friendId],
    references: [users.id],
  }),
}));
export const albumRelations = relations(album, ({ many }) => ({
  images: many(albumImage),
}));

export const imagenRelations = relations(images, ({ many }) => ({
  albums: many(albumImage),
}));

export const albumImagenRelations = relations(albumImage, ({ one }) => ({
  album: one(album, { fields: [albumImage.albumId], references: [album.id] }),
  imagen: one(images, {
    fields: [albumImage.imageId],
    references: [images.id],
  }),
}));
