import { getAuthUserId } from "@convex-dev/auth/server";
import { query, QueryCtx } from "./_generated/server";
import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get the current signed in user. Returns null if the user is not signed in.
 * Usage: const signedInUser = await ctx.runQuery(api.authHelpers.currentUser);
 * THIS FUNCTION IS READ-ONLY. DO NOT MODIFY.
 */
export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);

    if (user === null) {
      return null;
    }

    return user;
  },
});

/**
 * Use this function internally to get the current user data. Remember to handle the null user case.
 * @param ctx
 * @returns
 */
export const getCurrentUser = async (ctx: QueryCtx) => {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    return null;
  }
  return await ctx.db.get(userId);
};

// Add: Update current user profile with onboarding fields (partial update allowed)
export const updateProfile = mutation({
  args: {
    firstName: v.optional(v.string()),
    middleName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    dob: v.optional(v.string()),
    gender: v.optional(v.string()),
    location: v.optional(v.string()),
    currency: v.optional(v.string()),
    timezone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }
    // Only patch provided fields (shallow merge)
    await ctx.db.patch(userId, { ...args });
    return null;
  },
});