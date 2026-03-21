import {
  pgTable,
  uuid,
  integer,
  primaryKey,
  varchar,
  timestamp,
  boolean,
  text,
  index
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  username: varchar("username", { length: 100 }),
  password: text("password"),
  googleId: varchar("google_id", { length: 255 }), 
  avatar: text("avatar"),
  isVerified: boolean("is_verified").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});


export const refreshTokens = pgTable("refresh_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(), 
  userAgent: text("user_agent"), 
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
}, (table) => ({
  tokenIdx: index("token_idx").on(table.token),
}));


export const authTokens = pgTable("auth_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  type: varchar("type", { length: 20 }).notNull(), 
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
export const videos = pgTable("videos", {
  id: uuid("id").defaultRandom().primaryKey(),
  uploaderId: uuid("uploader_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  videoUrl: text("video_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),

  views: integer("views").default(0).notNull(),
  duration: integer("duration"), // Duration in seconds
  processingStatus: varchar("status", { length: 20 }).default("pending"),
  
  createdAt: timestamp("created_at").defaultNow().notNull()
}, (table) => ({
  uploaderIdx: index("uploader_idx").on(table.uploaderId),
}));

export const videoLikes = pgTable("video_likes", {
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  videoId: uuid("video_id")
    .notNull()
    .references(() => videos.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull()
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.videoId] }),
}));


export const comments = pgTable("comments", {
  id: uuid("id").defaultRandom().primaryKey(),
  videoId: uuid("video_id")
    .notNull()
    .references(() => videos.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const tags = pgTable("tags", {
  id: uuid("id").defaultRandom().primaryKey(),
  tagname: varchar("name", { length: 50 }).notNull().unique(), 
});


export const videoToTags = pgTable("video_to_tags", {
  videoId: uuid("video_id")
    .notNull()
    .references(() => videos.id, { onDelete: "cascade" }),
  tagId: uuid("tag_id")
    .notNull()
    .references(() => tags.id, { onDelete: "cascade" }),
}, (table) => ({
  
  pk: primaryKey({ columns: [table.videoId, table.tagId] }),
}));