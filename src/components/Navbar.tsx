"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { Home, CalendarCheck, ShoppingCart, Menu, Settings, Music, LogIn, LogOut, User as UserIcon } from "lucide-react";
import { useState } from "react";
import { useConfig } from "@/context/ConfigContext";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { config } = useConfig();
  const { user, logout } = useAuth();
  const isChristmas = config.mode === "christmas";

  const links = [
    { href: "/", label: "Acasă", icon: Home },
    { href: "/rsvp", label: "Confirmare", icon: CalendarCheck },
    { href: "/shopping", label: "Listă", icon: ShoppingCart },
    { href: "/music", label: "Muzică", icon: Music },
  ];

  const glassClass = isChristmas
    ? "bg-white/70 border-white/40 text-green-900"
    : "bg-black/60 border-white/10 text-white";

  const hoverClass = isChristmas
    ? "hover:bg-green-50 text-green-800"
    : "hover:bg-white/10 text-gray-200";

  const activeClass = isChristmas
    ? "bg-green-600 text-white shadow-green-500/30"
    : "bg-white text-black shadow-white/20";

  return (
    <div className="flex justify-center pt-6 sticky top-0 z-50 px-4">
      <nav className={clsx(
        "backdrop-blur-xl border shadow-2xl rounded-full px-6 py-3 transition-all duration-500 max-w-4xl w-full flex items-center justify-between",
        glassClass
      )}>
        {/* Logo / Brand */}
        <Link href="/" className="font-serif font-bold text-xl tracking-tight flex items-center gap-2 mr-4">
          {isChristmas ? "🎄 Crăciun" : "🥂 REV '2k26"}
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                  isActive ? activeClass : hoverClass
                )}
              >
                <Icon size={16} />
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* User / Login Actions */}
        <div className="hidden md:flex items-center gap-2 ml-4 pl-4 border-l border-white/20">
          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold flex items-center gap-1">
                <UserIcon size={14} /> {user.name}
              </span>
              {user.isAdmin && (
                <Link
                  href="/admin"
                  className={clsx("p-2 rounded-full transition-colors", hoverClass)}
                  title="Admin Dashboard"
                >
                  <Settings size={18} />
                </Link>
              )}
              <button
                onClick={logout}
                className={clsx("p-2 rounded-full transition-colors text-red-400 hover:text-red-500 hover:bg-white/10")}
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className={clsx(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all border",
                isChristmas ? "bg-red-600 border-red-500 text-white hover:bg-red-700" : "bg-white/10 border-white/30 text-white hover:bg-white/20"
              )}
            >
              <LogIn size={16} /> Login
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            type="button"
            className={clsx("p-2 rounded-full", hoverClass)}
          >
            <Menu size={24} />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className={clsx(
          "absolute top-24 left-4 right-4 rounded-3xl p-4 backdrop-blur-xl border shadow-2xl md:hidden flex flex-col gap-2 animate-in fade-in slide-in-from-top-4 z-50",
          glassClass
        )}>
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={clsx(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all",
                  isActive ? activeClass : hoverClass
                )}
              >
                <Icon size={20} />
                {link.label}
              </Link>
            );
          })}

          <div className="h-px bg-white/10 my-2"></div>

          {user ? (
            <>
              <div className="px-4 py-2 font-bold opacity-60 flex items-center gap-2">
                <UserIcon size={16} /> Logat ca {user.name}
              </div>
              {user.isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setIsOpen(false)}
                  className={clsx("flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all", hoverClass)}
                >
                  <Settings size={20} /> Admin Dashboard
                </Link>
              )}
              <button
                onClick={() => { logout(); setIsOpen(false); }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all text-red-400 hover:bg-white/10 w-full text-left"
              >
                <LogOut size={20} /> Ieșire din cont
              </button>
            </>
          ) : (
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className={clsx("flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold transition-all justify-center", activeClass)}
            >
              <LogIn size={20} /> Autentificare
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
