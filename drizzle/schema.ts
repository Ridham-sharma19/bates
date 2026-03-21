import { pgTable, index, foreignKey, uuid, varchar, text, integer, timestamp, unique, boolean, primaryKey } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const videos = pgTable("videos", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	uploaderId: uuid("uploader_id").notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	videoUrl: text("video_url").notNull(),
	thumbnailUrl: text("thumbnail_url"),
	views: integer().default(0).notNull(),
	duration: integer(),
	status: varchar({ length: 20 }).default('pending'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("uploader_idx").using("btree", table.uploaderId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.uploaderId],
			foreignColumns: [users.id],
			name: "videos_uploader_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const refreshTokens = pgTable("refresh_tokens", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	token: text().notNull(),
	userAgent: text("user_agent"),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("token_idx").using("btree", table.token.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "refresh_tokens_user_id_users_id_fk"
		}).onDelete("cascade"),
	unique("refresh_tokens_token_unique").on(table.token),
]);

export const comments = pgTable("comments", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	videoId: uuid("video_id").notNull(),
	userId: uuid("user_id").notNull(),
	content: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.videoId],
			foreignColumns: [videos.id],
			name: "comments_video_id_videos_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "comments_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	email: varchar({ length: 255 }).notNull(),
	username: varchar({ length: 100 }),
	password: text(),
	googleId: varchar("google_id", { length: 255 }),
	avatar: text(),
	isVerified: boolean("is_verified").default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("users_email_unique").on(table.email),
]);

export const authTokens = pgTable("auth_tokens", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	token: text().notNull(),
	type: varchar({ length: 20 }).notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "auth_tokens_user_id_users_id_fk"
		}).onDelete("cascade"),
	unique("auth_tokens_token_unique").on(table.token),
]);

export const tags = pgTable("tags", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 50 }).notNull(),
}, (table) => [
	unique("tags_name_unique").on(table.name),
]);

export const videoToTags = pgTable("video_to_tags", {
	videoId: uuid("video_id").notNull(),
	tagId: uuid("tag_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.videoId],
			foreignColumns: [videos.id],
			name: "video_to_tags_video_id_videos_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.tagId],
			foreignColumns: [tags.id],
			name: "video_to_tags_tag_id_tags_id_fk"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.videoId, table.tagId], name: "video_to_tags_video_id_tag_id_pk"}),
]);

export const videoLikes = pgTable("video_likes", {
	userId: uuid("user_id").notNull(),
	videoId: uuid("video_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "video_likes_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.videoId],
			foreignColumns: [videos.id],
			name: "video_likes_video_id_videos_id_fk"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.userId, table.videoId], name: "video_likes_user_id_video_id_pk"}),
]);
