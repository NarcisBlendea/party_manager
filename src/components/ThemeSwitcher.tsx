"use client";

import { useConfig } from "@/context/ConfigContext";
import { Sparkles, Snowflake } from "lucide-react";

export default function ThemeSwitcher() {
  const { config, updateConfig } = useConfig();
  const isChristmas = config.mode === "christmas";

  const toggleTheme = () => {
    updateConfig({ mode: isChristmas ? "newyear" : "christmas" });
  };

  return (
    <button
      onClick={toggleTheme}
      className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-full shadow-2xl transition-all transform hover:scale-105 active:scale-95 border-2 flex items-center gap-3 font-bold ${
        isChristmas
          ? "bg-red-600 border-green-400 text-white"
          : "bg-slate-900 border-yellow-400 text-yellow-400"
      }`}
    >
      {isChristmas ? (
        <>
           <Snowflake size={20} /> Mod Crăciun
        </>
      ) : (
        <>
           <Sparkles size={20} /> Mod Revelion
        </>
      )}
    </button>
  );
}