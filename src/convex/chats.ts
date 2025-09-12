import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listMyChats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];
    const chats = await ctx.db
      .query("chats")
      .withIndex("by_ownerId", (q) => q.eq("ownerId", userId))
      .order("desc")
      .collect();
    return chats;
  },
});

export const createChat = mutation({
  args: {
    title: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");
    const id = await ctx.db.insert("chats", {
      ownerId: userId,
      title: args.title ?? "New Chat",
    });
    return id;
  },
});
