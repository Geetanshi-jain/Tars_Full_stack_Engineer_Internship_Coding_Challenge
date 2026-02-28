import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    image: v.string(),
    clerkId: v.string(),
    isOnline: v.optional(v.boolean()),
    lastSeen: v.optional(v.number()),
  }).index("by_clerkId", ["clerkId"]),

  conversations: defineTable({
    // direct or group
    type: v.optional(v.union(v.literal("direct"), v.literal("group"))),
    // direct chat
    participantOne: v.optional(v.id("users")),
    participantTwo: v.optional(v.id("users")),
    participantOneReadTime: v.optional(v.number()),
    participantTwoReadTime: v.optional(v.number()),
    // group chat
    groupName: v.optional(v.string()),
    members: v.optional(v.array(v.id("users"))),
    createdBy: v.optional(v.id("users")),
  }),

  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    content: v.string(),
    isDeleted: v.optional(v.boolean()),
  }).index("by_conversation", ["conversationId"]),

  reactions: defineTable({
    messageId: v.id("messages"),
    userId: v.id("users"),
    emoji: v.string(),
  })
    .index("by_message", ["messageId"])
    .index("by_message_user_emoji", ["messageId", "userId", "emoji"]),

  typing: defineTable({
    conversationId: v.id("conversations"),
    userId: v.id("users"),
    updatedAt: v.number(),
  })
    .index("by_conversation", ["conversationId"])
    .index("by_user_and_conversation", ["userId", "conversationId"]),
});
