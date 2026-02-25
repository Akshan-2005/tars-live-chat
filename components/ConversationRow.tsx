"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";

export default function ConversationRow({
    convo,
    active,
    onSelect,
}: {
    convo: any;
    active: boolean;
    onSelect: (id: Id<"conversations">) => void;
}) {
    const { user } = useUser();

    const unreadCount = useQuery(
        api.messages.getUnreadCount,
        user
            ? {
                conversationId: convo._id,
                userId: user.id,
                lastRead: convo.lastRead?.timestamp,
            }
            : "skip"
    );

    return (
        <div
            onClick={() => onSelect(convo._id)}
            className={`flex items-center justify-between p-3 rounded-lg cursor-pointer ${active ? "bg-gray-200" : "hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
        >
            <span className="font-medium truncate">
                {convo.lastMessage || "No messages yet"}
            </span>

            {(unreadCount ?? 0) > 0 && (
                <span className="min-w-5 h-5 flex items-center justify-center bg-green-500 text-white text-xs rounded-full px-1.5">
                    {unreadCount ?? 0}
                </span>
            )}
        </div>
    );
}