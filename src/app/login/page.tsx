"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useConfig } from "@/context/ConfigContext";
import { Lock, User, ArrowRight, UserPlus } from "lucide-react";
import { clsx } from "clsx";

export default function LoginPage() {
  const router = useRouter();
  const { login, register } = useAuth();
  const { config } = useConfig();
  const isChristmas = config.mode === "christmas";

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const glassStyle = isChristmas ? "christmas-glass" : "newyear-glass";
  const titleColor = isChristmas ? "text-red-800" : "text-amber-100";
  const inputBg = isChristmas ? "bg-white/50 border-green-200 focus:border-green-500 text-green-900" : "bg-black/30 border-white/20 focus:border-yellow-500 text-white";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (pin.length < 4) {
        setError("PIN-ul trebuie să aibă minim 4 cifre.");
        return;
    }

    if (isLoginMode) {
        const success = login(name, pin);
        if (success) {
            router.push("/");
        } else {
            setError("Nume sau PIN incorect.");
        }
    } else {
        const success = register(name, pin);
        if (success) {
            router.push("/rsvp"); // Redirect to RSVP after register
        } else {
            setError("Acest nume este deja folosit.");
        }
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className={clsx("w-full max-w-md p-8 rounded-3xl shadow-2xl transition-all", glassStyle)}>
        <div className="text-center mb-8">
            <h1 className={clsx("text-4xl font-serif font-black mb-2", titleColor)}>
                {isChristmas ? "Bun venit!" : "Welcome Party"}
            </h1>
            <p className={clsx("opacity-80 text-sm", isChristmas ? "text-green-900" : "text-gray-300")}>
                {isLoginMode ? "Identifică-te pentru a continua" : "Creează-ți profilul de invitat"}
            </p>
        </div>

        <div className="flex bg-black/10 rounded-xl p-1 mb-6">
            <button
                onClick={() => { setIsLoginMode(true); setError(""); }}
                className={clsx(
                    "flex-1 py-2 rounded-lg text-sm font-bold transition-all",
                    isLoginMode ? "bg-white shadow text-black" : "text-gray-400 hover:text-white"
                )}
            >
                Login
            </button>
            <button
                onClick={() => { setIsLoginMode(false); setError(""); }}
                className={clsx(
                    "flex-1 py-2 rounded-lg text-sm font-bold transition-all",
                    !isLoginMode ? "bg-white shadow text-black" : "text-gray-400 hover:text-white"
                )}
            >
                Cont Nou
            </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="text-xs font-bold uppercase opacity-70 ml-1">Nume</label>
                <div className="relative mt-1">
                    <User className="absolute left-3 top-3 opacity-50" size={18} />
                    <input
                        type="text"
                        required
                        className={clsx("w-full pl-10 pr-4 py-3 rounded-xl outline-none border transition-all", inputBg)}
                        placeholder="Ex: Andrei"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
            </div>

            <div>
                <label className="text-xs font-bold uppercase opacity-70 ml-1">Cod PIN (Secret)</label>
                <div className="relative mt-1">
                    <Lock className="absolute left-3 top-3 opacity-50" size={18} />
                    <input
                        type="password"
                        required
                        className={clsx("w-full pl-10 pr-4 py-3 rounded-xl outline-none border transition-all tracking-widest", inputBg)}
                        placeholder="****"
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                    />
                </div>
            </div>

            {error && (
                <div className="bg-red-500/20 border border-red-500/50 text-red-200 text-sm p-3 rounded-lg text-center font-bold">
                    {error}
                </div>
            )}

            <button
                type="submit"
                className={clsx(
                    "w-full py-4 rounded-xl font-bold text-lg shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 mt-4",
                    isChristmas ? "bg-red-700 text-white" : "bg-yellow-500 text-black"
                )}
            >
                {isLoginMode ? <>Intră <ArrowRight size={20}/></> : <>Creează Cont <UserPlus size={20}/></>}
            </button>
        </form>
      </div>
    </div>
  );
}
