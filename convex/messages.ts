import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const sendMessage = mutation({
    args: {
        conversationId: v.id("conversations"),
        content: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) throw new Error("User not found");

        const msgId = await ctx.db.insert("messages", {
            conversationId: args.conversationId,
            senderId: user._id,
            content: args.content,
        });

        const message = await ctx.db.get(msgId);

        // Update read receipt for the sender (direct chat only)
        const conversation = await ctx.db.get(args.conversationId);
        if (conversation && conversation.type !== "group") {
            const isParticipantOne = conversation.participantOne === user._id;
            await ctx.db.patch(args.conversationId, {
                [isParticipantOne ? "participantOneReadTime" : "participantTwoReadTime"]: message?._creationTime || Date.now()
            });
        }
    },
});

export const getMessages = query({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("messages")
            .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
            .collect();
    },
});

export const markAsRead = mutation({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return;

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) return;

        const conversation = await ctx.db.get(args.conversationId);
        if (!conversation) return;

        // Only handle read receipts for direct messages
        if (conversation.type === "group") return;

        const isParticipantOne = conversation.participantOne === user._id;

        await ctx.db.patch(args.conversationId, {
            [isParticipantOne ? "participantOneReadTime" : "participantTwoReadTime"]: Date.now()
        });
    }
});

export const deleteMessage = mutation({
    args: { messageId: v.id("messages") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) throw new Error("User not found");

        const message = await ctx.db.get(args.messageId);
        if (!message) throw new Error("Message not found");
        if (message.senderId !== user._id) throw new Error("Cannot delete someone else's message");

        // Soft delete — keep the record, just mark as deleted
        await ctx.db.patch(args.messageId, { isDeleted: true });
    }
});
