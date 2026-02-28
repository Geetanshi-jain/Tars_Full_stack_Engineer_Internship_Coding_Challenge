import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const toggleReaction = mutation({
    args: { messageId: v.id("messages"), emoji: v.string() },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) throw new Error("User not found");

        const existing = await ctx.db
            .query("reactions")
            .withIndex("by_message_user_emoji", (q) =>
                q.eq("messageId", args.messageId).eq("userId", user._id).eq("emoji", args.emoji)
            )
            .unique();

        if (existing) {
            await ctx.db.delete(existing._id);
        } else {
            await ctx.db.insert("reactions", {
                messageId: args.messageId,
                userId: user._id,
                emoji: args.emoji,
            });
        }
    },
});

export const getReactions = query({
    args: { messageId: v.id("messages") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        const allReactions = await ctx.db
            .query("reactions")
            .withIndex("by_message", (q) => q.eq("messageId", args.messageId))
            .collect();

        let currentUserId: string | null = null;
        if (identity) {
            const user = await ctx.db
                .query("users")
                .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
                .unique();
            if (user) currentUserId = user._id;
        }

        // Group by emoji with counts and if current user reacted
        const grouped: Record<string, { count: number; reacted: boolean }> = {};
        for (const r of allReactions) {
            if (!grouped[r.emoji]) {
                grouped[r.emoji] = { count: 0, reacted: false };
            }
            grouped[r.emoji].count++;
            if (currentUserId && r.userId === currentUserId) {
                grouped[r.emoji].reacted = true;
            }
        }
        // Return as array to avoid Convex rejecting non-ASCII emoji as field names
        return Object.entries(grouped).map(([emoji, { count, reacted }]) => ({
            emoji,
            count,
            reacted,
        }));
    },
});
