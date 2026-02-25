import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

export const getOrCreateConversation = mutation({
    args: { userA: v.string(), userB: v.string() },
    handler: async (ctx, args) => {
        const members = [args.userA, args.userB].sort();

        const existing = await ctx.db
            .query("conversations")
            .collect();

        const found = existing.find(
            (c) =>
                c.members.length === 2 &&
                c.members.sort().join() === members.join()
        );

        if (found) return found._id;

        return await ctx.db.insert("conversations", {
            members,
        });
    },
});

export const getUserConversations = query({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        const conversations = await ctx.db
            .query("conversations")
            .collect();

        return conversations.filter((c) =>
            c.members.includes(args.userId)
        );
    },
});

export const setTyping = mutation({
    args: {
        conversationId: v.id("conversations"),
        userId: v.string(),
    }, 
    handler: async (ctx, args)=> {
        await ctx.db.patch(args.conversationId, {
            typing: args.userId,
            typingAt: Date.now(),
        });
    },
});

export const getConversation = query({
    args: {conversationId: v.id("conversations")},
    handler: async (ctx,args)=> {
        return await ctx.db.get(args.conversationId);
    },
});

export const markAsRead = mutation({
    args: {
        conversationId: v.id("conversations"),
        userId: v.string(),
    },
    handler: async (ctx, args)=> {
        await ctx.db.patch(args.conversationId, {
            lastRead: {
                userId: args.userId,
                timestamp: Date.now(),
            },
        });
    },
});