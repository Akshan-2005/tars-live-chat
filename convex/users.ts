import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createUser = mutation({
    args: {
        clerkId: v.string(),
        name: v.string(),
        email: v.string(),
        image: v.string(),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("users")
            .withIndex("by_clerkId", q => q.eq("clerkId", args.clerkId))
            .unique();

        if (!existing) {
            await ctx.db.insert("users", args);
        }
    },
})

export const getUsers = query({
    args: { clerkId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("users")
            .filter(q => q.neq(q.field("clerkId"), args.clerkId))
            .collect();
    },
})

export const updatePresence = mutation({
    args: { clerkId: v.string() },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", q => q.eq("clerkId", args.clerkId))
            .unique();

        if (!user) return;

        await ctx.db.patch(user._id, {
            lastSeen: Date.now(),
        });
    },
})

export const savePlayerId = mutation({
    args: { playerId: v.string() },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return;

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", q => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) return;

        await ctx.db.patch(user._id, {
            playerId: args.playerId,
        });
    },
});