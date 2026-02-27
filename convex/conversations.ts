import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// start a conversation or get existing one
export const startConversation = mutation({
    args: {
        participantTwoId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!currentUser) throw new Error("User not found");

        // check if conversation already exists (either way)
        const existing = await ctx.db
            .query("conversations")
            .filter((q) =>
                q.or(
                    q.and(
                        q.eq(q.field("participantOne"), currentUser._id),
                        q.eq(q.field("participantTwo"), args.participantTwoId)
                    ),
                    q.and(
                        q.eq(q.field("participantOne"), args.participantTwoId),
                        q.eq(q.field("participantTwo"), currentUser._id)
                    )
                )
            )
            .unique();

        if (existing) return existing._id;

        // create new
        return await ctx.db.insert("conversations", {
            participantOne: currentUser._id,
            participantTwo: args.participantTwoId,
        });
    },
});

// fetch my conversations
export const getMyConversations = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) return [];

        const convs = await ctx.db
            .query("conversations")
            .filter((q) =>
                q.or(
                    q.eq(q.field("participantOne"), user._id),
                    q.eq(q.field("participantTwo"), user._id)
                )
            )
            .collect();

        // fetch the "other" user details for each conversation
        const detailedConvs = await Promise.all(
            convs.map(async (c) => {
                const otherUserId =
                    c.participantOne === user._id ? c.participantTwo : c.participantOne;
                const otherUser = await ctx.db.get(otherUserId);

                // get last message
                const lastMessage = await ctx.db
                    .query("messages")
                    .withIndex("by_conversation", (q) => q.eq("conversationId", c._id))
                    .order("desc")
                    .first();

                return {
                    ...c,
                    otherUser,
                    lastMessage: lastMessage?.content || "No messages yet",
                    lastMessageTime: lastMessage?._creationTime || c._creationTime,
                };
            })
        );

        return detailedConvs;
    },
});
