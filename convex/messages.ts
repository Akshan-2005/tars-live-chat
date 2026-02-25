import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const sendMessage = mutation({
    args: {
        conversationId: v.id("conversations"),
        senderId: v.string(),
        text: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("messages", {
            conversationId: args.conversationId,
            senderId: args.senderId,
            text: args.text,
            createdAt: Date.now(),
        });

        await ctx.db.patch(args.conversationId, {
            lastMessage: args.text,
            lastMessageTime: Date.now(),
            typing: undefined,
            typingAt: undefined,
        });
    }
})

export const getUnreadCount = query({
    args: {
        conversationId: v.id("conversations"),
        userId: v.string(),
        lastRead: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const lastRead = args.lastRead;
        if (lastRead === undefined) return 0;

        const messages = await ctx.db
            .query("messages")
            .withIndex("by_conversation", (q) =>
                q.eq("conversationId", args.conversationId)
            )
            .collect();

        return messages.filter(
            (m) =>
                m.createdAt > lastRead &&
                m.senderId !== args.userId
        ).length;
    },
});

export const getMessages = query({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("messages")
            .withIndex("by_conversation", (q) =>
                q.eq("conversationId", args.conversationId)
            )
            .collect();
    },
});