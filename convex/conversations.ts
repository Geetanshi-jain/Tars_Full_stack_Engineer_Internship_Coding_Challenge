import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// start a direct conversation or get existing one
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

        // check if direct conversation already exists (either way)
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
            .first();

        if (existing) return existing._id;

        // create new direct conversation
        return await ctx.db.insert("conversations", {
            type: "direct",
            participantOne: currentUser._id,
            participantTwo: args.participantTwoId,
        });
    },
});

// create a group conversation
export const createGroup = mutation({
    args: {
        groupName: v.string(),
        memberIds: v.array(v.id("users")),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!currentUser) throw new Error("User not found");

        // Include creator in members
        const members = [currentUser._id, ...args.memberIds.filter(id => id !== currentUser._id)];

        return await ctx.db.insert("conversations", {
            type: "group",
            groupName: args.groupName,
            members,
            createdBy: currentUser._id,
        });
    },
});

// fetch my conversations (direct + group)
export const getMyConversations = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) return [];

        const allConvs = await ctx.db.query("conversations").collect();

        // Filter conversations where user is a participant
        const myConvs = allConvs.filter((c) => {
            if (c.type === "group") {
                return c.members?.includes(user._id);
            }
            return c.participantOne === user._id || c.participantTwo === user._id;
        });

        const detailedConvs = await Promise.all(
            myConvs.map(async (c) => {
                // get last message
                const lastMessage = await ctx.db
                    .query("messages")
                    .withIndex("by_conversation", (q) => q.eq("conversationId", c._id))
                    .order("desc")
                    .first();

                const lastMessageText = lastMessage?.isDeleted
                    ? "This message was deleted"
                    : (lastMessage?.content || "No messages yet");

                if (c.type === "group") {
                    const memberProfiles = await Promise.all(
                        (c.members || []).map((id) => ctx.db.get(id))
                    );
                    return {
                        ...c,
                        otherUser: null,
                        lastMessage: lastMessageText,
                        lastMessageTime: lastMessage?._creationTime || c._creationTime,
                        unreadCount: 0,
                        memberCount: (c.members || []).length,
                        memberProfiles: memberProfiles.filter(Boolean),
                    };
                }

                // Direct conversation
                const isParticipantOne = c.participantOne === user._id;
                const otherUserId = isParticipantOne ? c.participantTwo : c.participantOne;
                const myReadTime = isParticipantOne ? c.participantOneReadTime : c.participantTwoReadTime;

                const otherUser = otherUserId ? await ctx.db.get(otherUserId) : null;

                const allMessages = await ctx.db
                    .query("messages")
                    .withIndex("by_conversation", (q) => q.eq("conversationId", c._id))
                    .collect();

                const unreadCount = allMessages.filter(
                    (m) => m.senderId !== user._id && (!myReadTime || m._creationTime > myReadTime)
                ).length;

                return {
                    ...c,
                    otherUser,
                    lastMessage: lastMessageText,
                    lastMessageTime: lastMessage?._creationTime || c._creationTime,
                    unreadCount,
                    memberCount: 2,
                    memberProfiles: [],
                };
            })
        );

        return detailedConvs;
    },
});
