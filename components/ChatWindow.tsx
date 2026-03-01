"use client";

import { useUser } from "@clerk/nextjs";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useRef, useEffect } from "react";
import { formatMessageTime } from "@/lib/formatTime";

export default function ChatWindow({
    conversationId
}: {
    conversationId: Id<"conversations">;
}) {
    const { user } = useUser();
    const [text, setText] = useState("");

    const messages = useQuery(
        api.messages.getMessages,
        conversationId ? { conversationId } : "skip"
    );

    const convo = useQuery(
        api.conversations.getConversation,
        conversationId ? { conversationId } : "skip"
    )

    const sendMessage = useMutation(api.messages.sendMessage);
    const setTyping = useMutation(api.conversations.setTyping);
    const typingTimeout = useRef<NodeJS.Timeout | null>(null);
    const bottomRef = useRef<HTMLDivElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const hasLoadedInitially = useRef(false);

    const [showNewButton, setShowNewButton] = useState(false);

    function isNearBottom() {
        const el = containerRef.current;
        if (!el) return true;

        return el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    }

    useEffect(() => {
        if (!messages) return;

        // First load → always scroll to bottom
        if (!hasLoadedInitially.current) {
            bottomRef.current?.scrollIntoView({ behavior: "auto" });
            hasLoadedInitially.current = true;
            return;
        }

        // After initial load → only scroll if user is near bottom
        if (isNearBottom()) {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
            setShowNewButton(false);
        } else {
            setShowNewButton(true);
        }
    }, [messages]);

    useEffect(() => {
        hasLoadedInitially.current = false;
    }, [conversationId]);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const onScroll = () => {
            if (isNearBottom()) {
                setShowNewButton(false);
            }
        };

        el.addEventListener("scroll", onScroll);
        return () => el.removeEventListener("scroll", onScroll);
    }, []);

    async function send() {
        if (!text.trim() || !user) return;

        await sendMessage({
            conversationId,
            senderId: user.id,
            text,
        });

        setText("");
    }

    return (
        <div className="flex flex-col flex-1 min-h-0">
            {/* messages */}
            <div
                ref={containerRef}
                className="flex flex-col flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50 dark:bg-gray-950"
            >
                {messages?.length === 0 && (
                    <p className="text-gray-400 dark:text-gray-500 text-sm">No messages yet</p>
                )}

                {messages?.map((m) => {
                    const isMine = m.senderId === user?.id;
                    console.log("clerk:", user?.id);
                    console.log("sender:", m.senderId);

                    return (
                        <div
                            key={m._id}
                            className={`flex w-full items-end ${isMine ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={` inline-block max-w-[75%] px-3 py-2 rounded-2xl text-sm wrap-break-word ${isMine
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-200 dark:bg-gray-700 dark:text-gray-100"
                                    }`}
                            >
                                <p>{m.text}</p>

                                <span
                                    className={`block text-[10px] mt-1 ${isMine ? "text-blue-100" : "text-gray-500 dark:text-gray-400"
                                        }`}
                                >
                                    {formatMessageTime(m.createdAt)}
                                </span>
                            </div>
                        </div>
                    )
                })}
                <div ref={bottomRef} />
            </div>

            {/*typing indicator*/}
            {
                convo?.typing &&
                convo.typing !== user?.id &&
                Date.now() - (convo.typingAt || 0) < 2000 && (
                    <div className="flex items-center gap-1 px-4 pb-2">
                        <span className="typing-dot w-2.5 h-2.5 sm:w-2 sm:h-2 bg-gray-400 dark:bg-gray-500 rounded-full"></span>
                        <span className="typing-dot w-2.5 h-2.5 sm:w-2 sm:h-2 bg-gray-400 dark:bg-gray-500 rounded-full"></span>
                        <span className="typing-dot w-2.5 h-2.5 sm:w-2 sm:h-2 bg-gray-400 dark:bg-gray-500 rounded-full"></span>
                    </div>
                )
            }

            {/*new message button*/}
            {
                showNewButton && (
                    <button
                        onClick={() => {
                            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
                            setShowNewButton(false);
                        }}
                        className="absolute bottom-24 right-4 bg-green-500 text-white text-sm px-3 py-1 rounded-full shadow dark:shadow-black/40"
                    >
                        ↓ New messages
                    </button>
                )
            }

            {/* input */}
            <div className="border-t dark:border-gray-700 p-3 flex gap-2 bg-white dark:bg-gray-900">
                <input
                    value={text}
                    onChange={(e) => {
                        setText(e.target.value);

                        if (!conversationId || !user) return;

                        setTyping({
                            conversationId,
                            userId: user.id,
                        });

                        // clear previous timer
                        if (typingTimeout.current) {
                            clearTimeout(typingTimeout.current);
                        }

                        // stop typing after 2 sec inactivity
                        typingTimeout.current = setTimeout(() => {
                            setTyping({
                                conversationId,
                                userId: "",
                            });
                        }, 2000);
                    }}
                    placeholder="Type a message"
                    className="flex-1 border dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-gray-100 rounded-lg px-3 py-2 text-base outline-none"
                />
                <button
                    onClick={send}
                    className="bg-blue-500 text-white px-4 rounded-lg hover:bg-blue-600"
                >
                    Send
                </button>
            </div>
        </div>
    );
}