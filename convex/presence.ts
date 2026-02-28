import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const heartbeat = mutation({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return;

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) return;

        await ctx.db.patch(user._id, {
            isOnline: true,
            lastSeen: Date.now(),
        });
    },
});

export const getOnlineUsers = query({
    handler: async (ctx) => {
        const users = await ctx.db.query("users").collect();
        const threshold = Date.now() - 30000; // 30 seconds
        return users.filter((u) => u.isOnline && u.lastSeen && u.lastSeen > threshold);
    },
});
