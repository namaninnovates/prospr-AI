import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const listMyChats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];
    const chats = await ctx.db
      .query("chats")
      .withIndex("by_ownerId_and_position", (q) => q.eq("ownerId", userId))
      .order("asc")
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

    const existing = await ctx.db
      .query("chats")
      .withIndex("by_ownerId", (q) => q.eq("ownerId", userId))
      .collect();

    const nextPosition = existing.length > 0
      ? Math.max(...existing.map((c) => c.position ?? 0)) + 1
      : 1;

    const id = await ctx.db.insert("chats", {
      ownerId: userId,
      title: args.title ?? "New Chat",
      position: nextPosition,
      brief: undefined,
    });
    return id;
  },
});

export const renameChat = mutation({
  args: {
    chatId: v.id("chats"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");
    const chat = await ctx.db.get(args.chatId);
    if (!chat || chat.ownerId !== userId) throw new Error("Forbidden");
    await ctx.db.patch(args.chatId, { title: args.title });
    return null;
  },
});

export const moveChat = mutation({
  args: {
    chatId: v.id("chats"),
    direction: v.union(v.literal("up"), v.literal("down")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");

    const chats = await ctx.db
      .query("chats")
      .withIndex("by_ownerId_and_position", (q) => q.eq("ownerId", userId))
      .order("asc")
      .collect();

    const idx = chats.findIndex((c) => c._id === args.chatId);
    if (idx === -1) throw new Error("Chat not found");
    if (args.direction === "up" && idx === 0) return null;
    if (args.direction === "down" && idx === chats.length - 1) return null;

    const swapWithIndex = args.direction === "up" ? idx - 1 : idx + 1;
    const current = chats[idx];
    const swapWith = chats[swapWithIndex];

    await ctx.db.patch(current._id, { position: swapWith.position });
    await ctx.db.patch(swapWith._id, { position: current.position });

    return null;
  },
});

export const reorderChats = mutation({
  args: {
    orderedIds: v.array(v.id("chats")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");

    // Load user's chats to verify ownership and current positions
    const myChats = await ctx.db
      .query("chats")
      .withIndex("by_ownerId_and_position", (q) => q.eq("ownerId", userId))
      .order("asc")
      .collect();

    const myIdsSet = new Set(myChats.map((c) => c._id));
    // Only allow reordering of the user's own chats
    const filtered = args.orderedIds.filter((id) => myIdsSet.has(id));

    // Assign positions sequentially based on provided order
    // Start at 1 for readability
    let pos = 1;
    for (const id of filtered) {
      await ctx.db.patch(id as Id<"chats">, { position: pos });
      pos += 1;
    }
    return null;
  },
});

export const internalSetBrief = internalMutation({
  args: {
    chatId: v.id("chats"),
    brief: v.string(),
  },
  handler: async (ctx, args) => {
    const chat = await ctx.db.get(args.chatId);
    if (!chat) throw new Error("Chat not found");
    await ctx.db.patch(args.chatId, { brief: args.brief });
    return null;
  },
});