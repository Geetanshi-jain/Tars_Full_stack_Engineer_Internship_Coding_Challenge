import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const setTyping = mutation({
    args: { conversationId: v.id("conversations"), isTyping: v.boolean() },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return;

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) return;

        const existing = await ctx.db
            .query("typing")
            .withIndex("by_user_and_conversation", (q) =>
                q.eq("userId", user._id).eq("conversationId", args.conversationId)
            )
            .unique();

        if (args.isTyping) {
            if (existing) {
                await ctx.db.patch(existing._id, { updatedAt: Date.now() });
            } else {
                await ctx.db.insert("typing", {
                    conversationId: args.conversationId,
                    userId: user._id,
                    updatedAt: Date.now(),
                });
            }
        } else {
            if (existing) {
                await ctx.db.delete(existing._id);
            }
        }
    },
});

export const getTypingUsers = query({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, args) => {
        const typingRecords = await ctx.db
            .query("typing")
            .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
            .collect();

        const threshold = Date.now() - 3000; // Typing times out after 3 seconds
        const activeTypingRecords = typingRecords.filter((t) => t.updatedAt > threshold);

        const users = await Promise.all(
            activeTypingRecords.map((t) => ctx.db.get(t.userId))
        );

        return users.filter(Boolean);
    },
});
