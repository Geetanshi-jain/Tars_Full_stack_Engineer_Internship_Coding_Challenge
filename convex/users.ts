import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// create or update user
export const storeUser = mutation({
    args: {
        name: v.string(),
        email: v.string(),
        image: v.string(),
        clerkId: v.string(),
    },
    handler: async (ctx, args) => {
        const existingUser = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
            .unique();

        if (existingUser) {
            await ctx.db.patch(existingUser._id, {
                name: args.name,
                image: args.image,
            });
            return existingUser._id;
        }

        return await ctx.db.insert("users", {
            name: args.name,
            email: args.email,
            image: args.image,
            clerkId: args.clerkId,
        });
    },
});

export const getUsers = query({
    handler: async (ctx) => {
        return await ctx.db.query("users").collect();
    },
});

export const currentUser = query({
    args: { clerkId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
            .unique();
    },
});
