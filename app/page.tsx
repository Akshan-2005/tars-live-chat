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
import ChatHeader from "@/components/ChatHeader";

export default function Home() {
  const markAsRead = useMutation(api.conversations.markAsRead);
  const createUser = useMutation(api.users.createUser);
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
    setOpen(false);
  }

  async function openConversation(id: Id<"conversations">) {
    setActiveConversation(id);

    if (user) {
      await markAsRead({
        conversationId: id,
        userId: user.id
      })
    }

    setOpen(false);
  }

  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      updatePresence({ clerkId: user.id });
    }, 15000);

    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (!user) return;

    createUser({
      clerkId: user.id,
      name: user.fullName ?? "User",
      email: user.primaryEmailAddress?.emailAddress ?? "",
      image: user.imageUrl,
    });
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
            <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
              <span className="font-semibold text-lg">Chats</span>

              <div className="flex items-center gap-2">
                <ThemeToggle />
                <UserButton />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-3">
              <UsersList onSelect={openChat} />
              <ConversationsList
                activeId={activeConversation}
                onSelect={openConversation}
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
            <UsersList onSelect={openChat} />
            <ConversationsList
              activeId={activeConversation}
              onSelect={openConversation}
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

            {/*CHAT USER HEADER */}
            {activeConversation ? (
              <ChatHeader conversationId={activeConversation} />
            ) : (
              <span className="font-semibold">Chats</span>
            )}

            <div className="ml-auto flex items-center gap-2">
              <ThemeToggle />
              <UserButton afterSignOutUrl="/" />
            </div>

          </div>

          {/* CHAT CONTENT */}
          <div className="flex-1 min-h-0 flex flex-col">
            {/*desktop header*/}
            {activeConversation && (
              <div className="hidden sm:flex items-center px-4 py-3 border-b dark:border-gray-700 bg-white dark:bg-gray-900">
                <ChatHeader conversationId={activeConversation} />
              </div>
            )}
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
