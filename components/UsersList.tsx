"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";

export default function UsersList({
  onSelect,
}: {
  onSelect?: (id: string) => void;
}) {
  const { user } = useUser();
  const [search, setSearch] = useState("");

  const users = useQuery(
    api.users.getUsers,
    user ? { clerkId: user.id } : "skip"
  );

  if (!users) return <p className="text-sm text-gray-400 dark:text-gray-500">Loading users...</p>;

  // filter users as you type
  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full flex flex-col gap-2">
      {/* SEARCH INPUT */}
      <input
        type="text"
        placeholder="Search users..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 rounded-lg px-3 py-2 text-base outline-none"
      />

      {/* EMPTY STATE */}
      {filteredUsers.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-300 text-sm">No users found</p>
      ) : (
        <div className="space-y-1">
          {filteredUsers.map((u) => {
            const isOnline =
              u.lastSeen && Date.now() - u.lastSeen < 30000;

            return (
              <div
                key={u._id}
                onClick={() => onSelect?.(u.clerkId)}
                className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 dark:hover:bg-gray-800 cursor-pointer overflow-hidden"
              >
                <div className="relative">
                  <img
                    src={u.image}
                    alt={u.name}
                    className="w-7 h-7 min-w-7 rounded-full object-cover"
                  />

                  {isOnline && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-gray-700 rounded-full" />
                  )}
                </div>

                <span className="font-medium truncate text-gray-900 dark:text-gray-100">{u.name}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}