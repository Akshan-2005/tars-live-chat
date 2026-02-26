"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export default function ConversationsList({
  activeId,
  onSelect,
}: {
  activeId?: Id<"conversations">;
  onSelect: (id: Id<"conversations">) => void;
}) {
  const { user } = useUser();

  const conversations = useQuery(
    api.conversations.getUserConversations,
    user ? { userId: user.id } : "skip"
  );

  if (!conversations) return null;

  return (
    <div className="space-y-1">
      {conversations.map((c) => {
        const isOnline =
          c.otherUserLastSeen &&
          Date.now() - c.otherUserLastSeen < 30000;

        return (
          <div
            key={c._id}
            onClick={() => onSelect(c._id)}
            className={`flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition
              ${activeId === c._id
                ? "bg-gray-200 dark:bg-gray-800"
                : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
          >
            {/* Avatar */}
            <div className="relative">
              <img
                src={c.otherUserImage}
                alt={c.otherUserName}
                className="w-10 h-10 rounded-full object-cover"
              />

              {isOnline && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full" />
              )}
            </div>

            {/* Name + message */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <span className="font-semibold truncate text-gray-900 dark:text-gray-100">
                  {c.otherUserName}
                </span>

                {c.lastMessageTime && (
                  <span className="text-xs text-gray-500">
                    {new Date(c.lastMessageTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                )}
              </div>

              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500 truncate">
                  {c.lastMessage || "Start conversation"}
                </p>

                {c.unreadCount > 0 && (
                  <span className="ml-2 bg-green-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                    {c.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}