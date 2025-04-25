"use client";

import { useEffect, useState } from "react";

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const initial =
      (saved as "light" | "dark") || (prefersDark ? "dark" : "light");

    console.log("🌟 useEffect: initial theme:", initial);

    setTheme(initial);
    if (initial === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    console.log("🛎️ toggleTheme: switching to", next);

    setTheme(next);
    localStorage.setItem("theme", next);

    if (next === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  if (!mounted) return null;

  return (
    <>
      <div className="w-full p-4 flex justify-end">
        <button
          onClick={toggleTheme}
          className="px-4 py-2 rounded bg-gray-100 dark:bg-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition"
        >
          {theme === "dark" ? "☀ Modo Claro" : "🌙 Modo Oscuro"}
        </button>
      </div>
      {children}
    </>
  );
}
