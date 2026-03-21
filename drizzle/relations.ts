import { relations } from "drizzle-orm/relations";
import { users, videos, refreshTokens, comments, authTokens, videoToTags, tags, videoLikes } from "./schema";

export const videosRelations = relations(videos, ({one, many}) => ({
	user: one(users, {
		fields: [videos.uploaderId],
		references: [users.id]
	}),
	comments: many(comments),
	videoToTags: many(videoToTags),
	videoLikes: many(videoLikes),
}));

export const usersRelations = relations(users, ({many}) => ({
	videos: many(videos),
	refreshTokens: many(refreshTokens),
	comments: many(comments),
	authTokens: many(authTokens),
	videoLikes: many(videoLikes),
}));

export const refreshTokensRelations = relations(refreshTokens, ({one}) => ({
	user: one(users, {
		fields: [refreshTokens.userId],
		references: [users.id]
	}),
}));

export const commentsRelations = relations(comments, ({one}) => ({
	video: one(videos, {
		fields: [comments.videoId],
		references: [videos.id]
	}),
	user: one(users, {
		fields: [comments.userId],
		references: [users.id]
	}),
}));

export const authTokensRelations = relations(authTokens, ({one}) => ({
	user: one(users, {
		fields: [authTokens.userId],
		references: [users.id]
	}),
}));

export const videoToTagsRelations = relations(videoToTags, ({one}) => ({
	video: one(videos, {
		fields: [videoToTags.videoId],
		references: [videos.id]
	}),
	tag: one(tags, {
		fields: [videoToTags.tagId],
		references: [tags.id]
	}),
}));

export const tagsRelations = relations(tags, ({many}) => ({
	videoToTags: many(videoToTags),
}));

export const videoLikesRelations = relations(videoLikes, ({one}) => ({
	user: one(users, {
		fields: [videoLikes.userId],
		references: [users.id]
	}),
	video: one(videos, {
		fields: [videoLikes.videoId],
		references: [videos.id]
	}),
}));