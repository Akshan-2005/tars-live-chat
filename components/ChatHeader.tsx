"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export default function ChatHeader({
    conversationId,
}: {
    conversationId: Id<"conversations">;
}) {
    const { user } = useUser();

    const data = useQuery(
        api.conversations.getConversationHeader,
        user && conversationId
            ? { conversationId, userId: user.id }
            : "skip"
    );

    if (!data) return null;

    const isOnline =
        data.lastSeen && Date.now() - data.lastSeen < 30000;

    return (
        <div className="flex items-center gap-3">
            <img
                src={data.image}
                className="w-9 h-9 rounded-full object-cover"
            />

            <div>
                <p className="font-semibold text-sm">{data.name}</p>
                <p className="text-xs text-gray-500">
                    {isOnline ? "Online" : "Last seen recently"}
                </p>
            </div>
        </div>
    );
}