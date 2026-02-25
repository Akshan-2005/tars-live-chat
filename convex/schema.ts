import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    users: defineTable({
        clerkId: v.string(),
        name: v.string(),
        email: v.string(),
        image: v.string(),
        lastSeen: v.optional(v.number()),
    }).index("by_clerkId", ["clerkId"]),

    conversations: defineTable({
        members: v.array(v.string()),
        lastMessage: v.optional(v.string()),
        lastMessageTime: v.optional(v.number()),
        typing: v.optional(v.string()),
        typingAt: v.optional(v.number()),
        lastRead: v.optional(v.object({
            userId: v.string(),
            timestamp: v.number(),
        })),
    }),

    messages: defineTable({
        conversationId: v.id("conversations"),
        senderId: v.string(),
        text: v.string(),
        createdAt: v.number(),
    }).index("by_conversation", ["conversationId"]),
});