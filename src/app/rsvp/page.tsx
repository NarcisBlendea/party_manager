"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useParticipants, Status } from "@/context/ParticipantsContext";
import { useConfig } from "@/context/ConfigContext";
import { useAuth } from "@/context/AuthContext";
import { Check, HelpCircle, X, ArrowLeft, PartyPopper, Calendar, Plus } from "lucide-react";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "framer-motion";

export default function RsvpPage() {
    const router = useRouter();
    const { participants, addParticipant } = useParticipants();
    const { config } = useConfig();
    const { user } = useAuth();

    // Protect Route
    useEffect(() => {
        if (!user) {
            router.push("/login");
        }
    }, [user, router]);

    const isChristmas = config.mode === "christmas";
    const currentEventName = isChristmas ? "Crăciun" : "Revelion";

    const glassStyle = isChristmas ? "christmas-glass" : "newyear-glass";
    const titleColor = isChristmas ? "text-red-800" : "text-amber-100";
    const inputBg = isChristmas ? "bg-white/50 border-green-200 focus:border-green-500" : "bg-black/30 border-white/20 focus:border-yellow-500 text-white";

    // Find existing RSVP for THIS event
    const existingRsvp = user ? participants.find(p => p.name === user.name && p.event === config.mode) : null;

    // Helper to safely get guests as array (handles old object format)
    const getGuestsArray = (guests: unknown): string[] => {
        if (Array.isArray(guests)) return guests;
        if (guests && typeof guests === 'object' && 'names' in guests) {
            // Old format: {count, names} - convert names string to array
            const oldGuests = guests as { count?: number; names?: string };
            if (oldGuests.names) return oldGuests.names.split(',').map(s => s.trim()).filter(Boolean);
        }
        return [];
    };

    const [formData, setFormData] = useState({
        name: user?.name || "",
        status: (existingRsvp?.status || "confirmed") as Status,
        dietary: existingRsvp?.dietary || "",
        guests: getGuestsArray(existingRsvp?.guests),
    });

    // Update form when mode changes or existing RSVP is found
    useEffect(() => {
        if (user) {
            const currentRsvp = participants.find(p => p.name === user.name && p.event === config.mode);
            setFormData({
                name: user.name,
                status: currentRsvp ? currentRsvp.status : "confirmed",
                dietary: currentRsvp ? currentRsvp.dietary || "" : "",
                guests: getGuestsArray(currentRsvp?.guests),
            });
        }
    }, [config.mode, user, participants]);

    const [showSuccess, setShowSuccess] = useState(false);

    if (!user) return null;

    // Guest management functions
    const addGuest = () => {
        setFormData(prev => ({ ...prev, guests: [...(prev.guests || []), ""] }));
    };

    const removeGuest = (index: number) => {
        setFormData(prev => ({
            ...prev,
            guests: (prev.guests || []).filter((_, i) => i !== index)
        }));
    };

    const updateGuest = (index: number, value: string) => {
        setFormData(prev => ({
            ...prev,
            guests: (prev.guests || []).map((g, i) => i === index ? value : g)
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Filter out empty guest names
        const filteredGuests = formData.guests.filter(g => g.trim() !== "");
        addParticipant({
            name: formData.name,
            status: formData.status,
            dietary: formData.dietary,
            guests: filteredGuests.length > 0 ? filteredGuests : undefined,
            event: config.mode
        });
        setShowSuccess(true);
    };

    const statusOptions = [
        {
            id: "confirmed",
            label: "PREZENT!",
            sub: "Nu ratez așa ceva",
            icon: Check,
            color: "green",
            gradient: "from-green-500 to-emerald-600"
        },
        {
            id: "maybe",
            label: "ÎNCĂ NU ȘTIU",
            sub: "S-ar putea să vin",
            icon: HelpCircle,
            color: "orange",
            gradient: "from-orange-400 to-amber-500"
        },
        {
            id: "declined",
            label: "ABSENT",
            sub: "Îmi pare rău...",
            icon: X,
            color: "red",
            gradient: "from-red-500 to-pink-600"
        },
    ];

    return (
        <div className="max-w-2xl mx-auto py-6 relative">

            {/* Header */}
            <div className="text-center mb-10">
                <div className={clsx("inline-block px-4 py-1 rounded-full text-xs font-bold uppercase mb-2 border", isChristmas ? "bg-red-100 text-red-800 border-red-200" : "bg-yellow-500/20 text-yellow-400 border-yellow-500/40")}>
                    Eveniment: {currentEventName}
                </div>
                <h1 className={clsx("text-4xl md:text-5xl font-serif font-black mb-2 drop-shadow-lg", titleColor)}>
                    Confirmare
                </h1>
                <p className={clsx("text-lg opacity-80", isChristmas ? "text-green-900" : "text-gray-300")}>
                    Salut, <span className="font-bold">{user.name}</span>! Te așteptăm?
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">

                {/* Status Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {statusOptions.map((opt) => {
                        const isSelected = formData.status === opt.id;
                        return (
                            <motion.button
                                key={opt.id}
                                type="button"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setFormData({ ...formData, status: opt.id as Status })}
                                className={clsx(
                                    "relative p-6 rounded-2xl border transition-all duration-300 flex flex-col items-center justify-center gap-3 text-center h-48 overflow-hidden",
                                    glassStyle,
                                    isSelected
                                        ? `border-${opt.color}-400 ring-2 ring-${opt.color}-400 ring-offset-2 ring-offset-transparent shadow-xl`
                                        : "border-transparent opacity-70 hover:opacity-100"
                                )}
                            >
                                {/* Background Gradient for selected state */}
                                {isSelected && (
                                    <div className={clsx("absolute inset-0 opacity-10 bg-gradient-to-br", opt.gradient)} />
                                )}

                                <div className={clsx(
                                    "p-4 rounded-full transition-colors",
                                    isSelected ? `bg-${opt.color}-500 text-white shadow-lg` : "bg-white/10"
                                )}>
                                    <opt.icon size={32} />
                                </div>

                                <div>
                                    <div className={clsx("font-black text-lg tracking-wide", isSelected ? `text-${opt.color}-500` : "")}>
                                        {opt.label}
                                    </div>
                                    <div className="text-xs opacity-60 font-medium mt-1">
                                        {opt.sub}
                                    </div>
                                </div>
                            </motion.button>
                        );
                    })}
                </div>

                {/* Guests Input */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={clsx("glass-panel p-6 rounded-2xl", glassStyle)}
                >
                    <div className="flex items-center justify-between mb-4">
                        <label className="text-sm font-bold uppercase tracking-wider opacity-80 flex items-center gap-2">
                            👥 Mai aduci pe cineva?
                        </label>
                        <button
                            type="button"
                            onClick={addGuest}
                            className={clsx(
                                "px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all hover:scale-105",
                                isChristmas ? "bg-green-600 text-white" : "bg-yellow-500 text-black"
                            )}
                        >
                            <Plus size={16} /> Adaugă persoană
                        </button>
                    </div>

                    {formData.guests.length > 0 && (
                        <div className="space-y-3">
                            {formData.guests.map((guest, index) => (
                                <div key={index} className="flex gap-3 items-center">
                                    <span className={clsx("w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0", isChristmas ? "bg-red-100 text-red-700" : "bg-white/10 text-white")}>
                                        {index + 1}
                                    </span>
                                    <input
                                        type="text"
                                        className={clsx("flex-grow px-4 py-3 rounded-xl outline-none transition-all focus:ring-2", inputBg)}
                                        placeholder={`Numele persoanei ${index + 1}`}
                                        value={guest}
                                        onChange={(e) => updateGuest(index, e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeGuest(index)}
                                        className="p-2 rounded-full text-red-400 hover:text-red-500 hover:bg-red-500/10 transition-all"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            ))}
                            <p className="text-sm opacity-60 pt-2">
                                Total persoane: <span className="font-bold">{formData.guests.length + 1}</span> (tu + {formData.guests.length})
                            </p>
                        </div>
                    )}

                    {formData.guests.length === 0 && (
                        <p className="text-sm opacity-50 italic">Nicio persoană adăugată. Apeăsă butonul de mai sus pentru a adăuga.</p>
                    )}
                </motion.div>

                {/* Dietary Input */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={clsx("glass-panel p-6 rounded-2xl", glassStyle)}
                >
                    <label htmlFor="dietary" className="block text-sm font-bold uppercase tracking-wider mb-3 opacity-80 flex items-center gap-2">
                        🍽️ Preferințe Alimentare / Alergii
                    </label>
                    <textarea
                        id="dietary"
                        rows={3}
                        className={clsx("w-full px-5 py-4 rounded-xl outline-none transition-all focus:ring-2 focus:ring-opacity-50 text-lg", inputBg)}
                        placeholder="Ex: Nu mănânc ciuperci, sunt vegetarian..."
                        value={formData.dietary}
                        onChange={(e) => setFormData({ ...formData, dietary: e.target.value })}
                    />
                </motion.div>

                {/* Submit Button */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className={clsx(
                        "w-full font-black py-5 px-6 rounded-2xl transition-all shadow-2xl text-xl tracking-wide flex items-center justify-center gap-3",
                        isChristmas
                            ? "bg-gradient-to-r from-red-600 to-red-800 text-white shadow-red-900/30"
                            : "bg-gradient-to-r from-yellow-400 to-amber-500 text-black shadow-yellow-500/30"
                    )}
                >
                    TRIMITE RĂSPUNSUL <ArrowRight strokeWidth={3} />
                </motion.button>

            </form>

            {/* Success Modal */}
            <AnimatePresence>
                {showSuccess && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setShowSuccess(false)}
                        />

                        {/* Modal Content */}
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            className={clsx(
                                "relative w-full max-w-sm p-8 rounded-3xl text-center shadow-2xl border border-white/20",
                                isChristmas ? "bg-white" : "bg-slate-900 text-white"
                            )}
                        >
                            <div className={clsx(
                                "w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 animate-bounce",
                                isChristmas ? "bg-green-100 text-green-600" : "bg-yellow-500/20 text-yellow-400"
                            )}>
                                <PartyPopper size={40} />
                            </div>

                            <h2 className={clsx("text-3xl font-black mb-2", isChristmas ? "text-slate-800" : "text-white")}>
                                {config.rsvpMessages[formData.status].title}
                            </h2>
                            <p className="opacity-70 mb-8 text-lg">
                                {config.rsvpMessages[formData.status].message}
                            </p>

                            <button
                                onClick={() => router.push("/")}
                                className={clsx(
                                    "w-full py-3 rounded-xl font-bold transition-all hover:scale-105",
                                    isChristmas ? "bg-green-600 text-white hover:bg-green-700" : "bg-white text-black hover:bg-gray-200"
                                )}
                            >
                                Înapoi la Dashboard
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Helper icon
import { ArrowRight } from "lucide-react";