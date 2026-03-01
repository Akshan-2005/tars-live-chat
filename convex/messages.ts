import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { api } from "./_generated/api"

export const sendMessage = mutation({
    args: {
        conversationId: v.id("conversations"),
        senderId: v.string(),
        text: v.string(),
    },

    handler: async (ctx, args) => {
        const now = Date.now();

        // Save message
        await ctx.db.insert("messages", {
            conversationId: args.conversationId,
            senderId: args.senderId,
            text: args.text,
            createdAt: now,
        });

        // Update conversation
        await ctx.db.patch(args.conversationId, {
            lastMessage: args.text,
            lastMessageTime: now,
        });

        // get conversation
        const conversation = await ctx.db.get(args.conversationId);
        if (!conversation) return;

        // find receiver (the other member)
        const receiverClerkId = conversation.members.find(
            (id) => id !== args.senderId
        );

        const senderUser = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) =>
                q.eq("clerkId", args.senderId)
            )
            .unique();

        const receiver = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) =>
                q.eq("clerkId", receiverClerkId!)
            )
            .unique();

        if (!senderUser || !receiver) return;

        const isOnline =
            receiver.lastSeen &&
            Date.now() - receiver.lastSeen < 30000;

        // 🔔 send push notification if offline
        if (!isOnline && receiver.playerId) {
            await ctx.scheduler.runAfter(
                0,
                api.notifications.sendPush,
                {
                    playerId: receiver.playerId,
                    senderName: senderUser.name,
                }
            );
        }
    },
});

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