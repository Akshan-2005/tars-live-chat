"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import ConversationRow from "./ConversationRow";

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

    if (!conversations.length) return null;

    return (
        <div className="space-y-1">
            {conversations.map((c) => (
                <ConversationRow
                    key={c._id}
                    convo={c}
                    active={activeId === c._id}
                    onSelect={onSelect}
                />
            ))}
        </div>
    );
}