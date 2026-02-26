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
        // get conversations where user is a member
        const conversations = await ctx.db.query("conversations").collect();

        const userConversations = conversations.filter(c =>
            c.members.includes(args.userId)
        );

        const results = [];

        for (const convo of conversations) {
            // find the other user
            const otherUserId = convo.members.find(id => id !== args.userId);
            if (!otherUserId) continue;

            const otherUser = await ctx.db
                .query("users")
                .withIndex("by_clerkId", q => q.eq("clerkId", otherUserId))
                .unique();

            if (!otherUser) continue;

            // get last message
            const lastMessage = await ctx.db
                .query("messages")
                .withIndex("by_conversation", q =>
                    q.eq("conversationId", convo._id)
                )
                .order("desc")
                .first();

            // unread count
            let unreadCount = 0;

            if (lastMessage && lastMessage.senderId !== args.userId) {
                if (!convo.lastRead || convo.lastRead.userId !== args.userId) {
                    unreadCount = 1;
                } else if (lastMessage.createdAt > convo.lastRead.timestamp) {
                    unreadCount = 1;
                }
            }

            results.push({
                _id: convo._id,
                otherUserName: otherUser.name,
                otherUserImage: otherUser.image,
                otherUserLastSeen: otherUser.lastSeen,
                lastMessage: lastMessage?.text,
                lastMessageTime: lastMessage?.createdAt,
                unreadCount,
            });
        }

        // sort by latest message
        return results.sort(
            (a, b) => (b.lastMessageTime ?? 0) - (a.lastMessageTime ?? 0)
        );
    },
});

export const setTyping = mutation({
    args: {
        conversationId: v.id("conversations"),
        userId: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.conversationId, {
            typing: args.userId,
            typingAt: Date.now(),
        });
    },
});

export const getConversation = query({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.conversationId);
    },
});

export const markAsRead = mutation({
    args: {
        conversationId: v.id("conversations"),
        userId: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.conversationId, {
            lastRead: {
                userId: args.userId,
                timestamp: Date.now(),
            },
        });
    },
});

export const getConversationHeader = query({
    args: { conversationId: v.id("conversations"), userId: v.string() },

    handler: async (ctx, args) => {
        const convo = await ctx.db.get(args.conversationId);
        if (!convo) return null;

        const otherUserId = convo.members.find(id => id !== args.userId);
        if (!otherUserId) return null;

        const otherUser = await ctx.db
            .query("users")
            .withIndex("by_clerkId", q => q.eq("clerkId", otherUserId))
            .unique();

        if (!otherUser) return null;

        return {
            name: otherUser.name,
            image: otherUser.image,
            lastSeen: otherUser.lastSeen,
        };
    },
});