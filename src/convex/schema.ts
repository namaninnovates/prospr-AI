import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove

      // Add profile fields for onboarding
      firstName: v.optional(v.string()),
      middleName: v.optional(v.string()),
      lastName: v.optional(v.string()),
      dob: v.optional(v.string()), // ISO date string
      gender: v.optional(v.string()), // keep string for flexibility
      location: v.optional(v.string()),
      currency: v.optional(v.string()),
      timezone: v.optional(v.string()),
    }).index("email", ["email"]), // index for the email. do not remove or modify

    chats: defineTable({
      ownerId: v.id("users"),
      title: v.string(),
      // Add ordering and brief fields
      position: v.number(),
      brief: v.optional(v.string()),
    })
      .index("by_ownerId", ["ownerId"])
      // New index to sort by position for a given owner
      .index("by_ownerId_and_position", ["ownerId", "position"]),

    messages: defineTable({
      chatId: v.id("chats"),
      role: v.union(v.literal("user"), v.literal("assistant")),
      content: v.string(),
    }).index("by_chatId", ["chatId"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;