"use client";

import { useState, useEffect } from "react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/nextjs";
import UsersList from "@/components/UsersList";
import ChatWindow from "@/components/ChatWindow";
import { Id } from "@/convex/_generated/dataModel";
import { Menu } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import ConversationsList from "@/components/ConversationsList";
import ThemeToggle from "@/components/ThemeToggle";

export default function Home() {
  const markAsRead = useMutation(api.conversations.markAsRead);
  const { user } = useUser();
  const updatePresence = useMutation(api.users.updatePresence);
  const [open, setOpen] = useState(false);
  const [activeConversation, setActiveConversation] = useState<Id<"conversations"> | undefined>();

  const getOrCreateConversation = useMutation(api.conversations.getOrCreateConversation);

  async function openChat(userId: string) {
    if (!user) return;

    const convoId = await getOrCreateConversation({
      userA: user.id,
      userB: userId,
    });

    await openConversation(convoId);
  }

  async function openConversation(id: Id<"conversations">) {
    setActiveConversation(id);

    if (user) {
      await markAsRead({
        conversationId: id,
        userId: user.id
      })
    }
  }

  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      updatePresence({ clerkId: user.id });
    }, 15000);

    return () => clearInterval(interval);
  }, [user]);

  return (
    <main className="h-full w-full flex overflow-hidden">
      <SignedOut>
        <div className="flex items-center justify-center w-full">
          <SignInButton />
        </div>
      </SignedOut>

      <SignedIn>
        {/* MOBILE DRAWER */}
        <div
          className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-gray-50 dark:bg-gray-950 border-r dark:border-gray-700 transform transition-transform duration-300 sm:hidden ${open ? "translate-x-0" : "-translate-x-full"
            }`}
        >
          <div className="flex flex-col h-full">
            <div className="p-4 font-bold border-b dark:border-gray-700">Users</div>

            <div className="flex-1 overflow-y-auto p-2">
              {/* Search & start new chat */}
              <UsersList onSelect={openChat} />

              {/* Existing conversations */}
              <ConversationsList
                activeId={activeConversation}
                onSelect={(id) => {
                  openConversation(id);
                  setOpen(false);
                }}
              />
            </div>
          </div>
        </div>

        {/* OVERLAY */}
        {open && (
          <div
            className="fixed inset-0 bg-black/30 dark:bg-black/60 z-40 sm:hidden"
            onClick={() => setOpen(false)}
          />
        )}

        {/* DESKTOP SIDEBAR */}
        <div className="hidden sm:flex sm:w-80 border-r dark:border-gray-700 bg-gray-50 dark:bg-gray-950 flex-col h-screen">
          <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
            <h2 className="font-semibold text-lg tracking-tight">Users</h2>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <UserButton />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {/* Search users */}
            <UsersList onSelect={openChat} />

            {/* Conversations */}
            <ConversationsList
              activeId={activeConversation}
              onSelect={(id) => {
                openConversation(id);
              }}
            />
          </div>
        </div>

        {/* CHAT AREA */}
        <div className="flex-1 flex flex-col relative bg-gray-50 dark:bg-gray-950 min-h-0">
          {/* MOBILE HEADER */}
          <div className="sm:hidden flex items-center gap-3 border-b dark:border-gray-700 p-3">
            {activeConversation ? (
              <button onClick={() => setActiveConversation(undefined)}>
                ←
              </button>
            ) : (
              <button onClick={() => setOpen(true)}>
                <Menu size={22} />
              </button>
            )}
            <span className="font-semibold">Chats</span>
            <div className="ml-auto">
              <ThemeToggle />
            </div>
          </div>

          {/* CHAT CONTENT */}
          <div className="flex-1 min-h-0 flex flex-col">
            {activeConversation
              ? <ChatWindow conversationId={activeConversation} />
              : <div className="flex flex-1 items-center justify-center text-gray-400 dark:text-gray-500">
                Select a user to start chatting
              </div>
            }
          </div>
        </div>
      </SignedIn>
    </main>
  );
}