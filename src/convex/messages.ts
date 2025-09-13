import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { internalQuery } from "./_generated/server";

export const listByChat = query({
  args: { chatId: v.id("chats") },
  handler: async (ctx, args) => {
    // Optional: auth gate to ensure owner matches
    const chat = await ctx.db.get(args.chatId);
    const userId = await getAuthUserId(ctx);
    if (!chat || chat.ownerId !== userId) return [];
    const msgs = await ctx.db
      .query("messages")
      .withIndex("by_chatId", (q) => q.eq("chatId", args.chatId))
      .order("asc")
      .collect();
    return msgs;
  },
});

export const addMessage = mutation({
  args: {
    chatId: v.id("chats"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");
    const chat = await ctx.db.get(args.chatId as Id<"chats">);
    if (!chat || chat.ownerId !== userId) throw new Error("Forbidden");
    await ctx.db.insert("messages", {
      chatId: args.chatId,
      role: args.role,
      content: args.content,
    });
    return null;
  },
});

// Internal query to load messages for a chat (used by actions)
export const internalListByChat = internalQuery({
  args: { chatId: v.id("chats") },
  handler: async (ctx, args) => {
    const chat = await ctx.db.get(args.chatId);
    if (!chat) return [];
    const msgs = await ctx.db
      .query("messages")
      .withIndex("by_chatId", (q) => q.eq("chatId", args.chatId))
      .order("asc")
      .collect();
    return msgs;
  },
});