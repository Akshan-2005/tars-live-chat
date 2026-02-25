"use client";

import { useTheme } from "@/components/ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm bg-gray-100 dark:bg-gray-800 dark:border-gray-700 transition"
    >
      <span
        className={`w-2 h-2 rounded-full ${
          theme === "light" ? "bg-yellow-400" : "bg-gray-300"
        }`}
      />
      {theme === "light" ? "Light" : "Dark"}
    </button>
  );
}