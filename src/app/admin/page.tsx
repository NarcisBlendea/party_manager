"use client";

import { useState } from "react";
import { useConfig, EventMode } from "@/context/ConfigContext";
import { useParticipants } from "@/context/ParticipantsContext";
import { useShopping } from "@/context/ShoppingContext";
import { useAuth, User } from "@/context/AuthContext";
import { Settings, MapPin, Lock, Save, LogOut, FileDown, Music, ScrollText, Users, BarChart3, Trash2, CalendarCheck } from "lucide-react";
import { clsx } from "clsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function AdminPage() {
    const { config, updateConfig, updateLocation, loginAdmin } = useConfig();
    const { participants, removeParticipant } = useParticipants();
    const { items } = useShopping();
    const { users, user: authUser, deleteUser, logout } = useAuth();

    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState<"overview" | "guests" | "users" | "settings">("overview");

    // Settings State - also serves as filter for Guest List
    const [modeTab, setModeTab] = useState<EventMode>(config.mode);
    const [tempConfig, setTempConfig] = useState(config);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (loginAdmin(password)) {
            setError("");
            setTempConfig(config);
        } else {
            setError("Parolă incorectă");
        }
    };

    const isAdmin = authUser?.isAdmin;

    const handleSave = () => {
        updateConfig({
            mode: tempConfig.mode,
            playlistUrl: tempConfig.playlistUrl,
            rules: tempConfig.rules,
            rsvpMessages: tempConfig.rsvpMessages
        });
        updateLocation("christmas", tempConfig.christmas);
        updateLocation("newyear", tempConfig.newyear);
        alert("Setări salvate cu succes!");
    };

    const updateTempLocation = (mode: EventMode, field: string, value: string) => {
        setTempConfig(prev => ({
            ...prev,
            [mode]: { ...prev[mode], [field]: value }
        }));
    };

    const generatePDF = () => {
        const doc = new jsPDF();
        const date = new Date().toLocaleDateString("ro-RO");
        doc.setFontSize(20);
        doc.text(`Raport Eveniment`, 14, 22);
        doc.setFontSize(10);
        doc.text(`Generat: ${date}`, 14, 28);

        doc.setFontSize(14);
        doc.text("Participanți (Toate evenimentele)", 14, 40);
        const participantsData = participants.map(p => [p.name, p.status.toUpperCase(), p.event.toUpperCase(), p.dietary || "-"]);
        autoTable(doc, { startY: 45, head: [['Nume', 'Status', 'Event', 'Alimentație']], body: participantsData });

        // @ts-expect-error jspdf type issue
        const finalY = doc.lastAutoTable.finalY || 100;
        doc.setFontSize(14);
        doc.text("Cumpărături", 14, finalY + 15);
        const shoppingData = items.map(i => [i.name, i.checked ? "OK" : "Pending", i.claimedBy || "-"]);
        autoTable(doc, { startY: finalY + 20, head: [['Produs', 'Status', 'Responsabil']], body: shoppingData });

        doc.save("raport-eveniment.pdf");
    };

    // Stats
    const confirmedCount = participants.filter(p => p.status === "confirmed").length;
    const boughtCount = items.filter(i => i.checked).length;
    const totalItems = items.length;

    // Filtered Guests for Admin View
    const filteredGuests = participants.filter(p => p.event === modeTab);

    if (!isAdmin) {
        return (
            <div className="max-w-md mx-auto mt-20 glass-panel p-8 rounded-2xl">
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center p-3 bg-slate-900 text-white rounded-full mb-4">
                        <Lock size={24} />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800">Admin Login</h1>
                </div>
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Parolă</label>
                        <input
                            type="password"
                            className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 bg-white"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Admin PIN (1234)"
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <button
                        type="submit"
                        className="w-full bg-slate-900 text-white font-bold py-2 rounded-lg hover:bg-slate-800 transition"
                    >
                        Intră
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto glass-panel p-6 rounded-3xl mt-10 bg-white/95 backdrop-blur-xl min-h-[80vh]">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 border-b pb-4 gap-4">
                <h1 className="text-3xl font-bold flex items-center gap-2 text-slate-800">
                    <Settings className="text-slate-600" /> Admin Dashboard
                </h1>
                <div className="flex gap-2">
                    <button onClick={generatePDF} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition text-sm font-bold">
                        <FileDown size={18} /> Export PDF
                    </button>
                    <button onClick={logout} className="text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg flex items-center gap-1 transition border border-red-200">
                        <LogOut size={18} />
                    </button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar */}
                <div className="w-full md:w-64 flex flex-col gap-2">
                    {[
                        { id: "overview", label: "Overview", icon: BarChart3 },
                        { id: "guests", label: "Guest List (RSVP)", icon: CalendarCheck },
                        { id: "users", label: "Conturi Acces", icon: Users },
                        { id: "settings", label: "Setări Site", icon: Settings },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={clsx(
                                "text-left px-4 py-3 rounded-xl font-bold flex items-center gap-3 transition-all",
                                activeTab === tab.id ? "bg-slate-900 text-white shadow-lg" : "hover:bg-slate-100 text-slate-500"
                            )}
                        >
                            <tab.icon size={20} /> {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1">

                    {/* OVERVIEW TAB */}
                    {activeTab === "overview" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                                    <div className="text-blue-500 font-bold uppercase text-xs mb-1">Participanți Total</div>
                                    <div className="text-4xl font-black text-blue-900">{confirmedCount}</div>
                                    <div className="text-sm text-blue-400">confirmări active</div>
                                </div>
                                <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100">
                                    <div className="text-purple-500 font-bold uppercase text-xs mb-1">Produse</div>
                                    <div className="text-4xl font-black text-purple-900">{boughtCount}</div>
                                    <div className="text-sm text-purple-400">cumpărate din {totalItems}</div>
                                </div>
                                <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
                                    <div className="text-orange-500 font-bold uppercase text-xs mb-1">Conturi</div>
                                    <div className="text-4xl font-black text-orange-900">{users.length}</div>
                                    <div className="text-sm text-orange-400">utilizatori înregistrați</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* GUESTS TAB (RSVP) */}
                    {activeTab === "guests" && (
                        <div className="animate-in fade-in slide-in-from-right-4">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-slate-800">Lista Participanți</h2>
                                <div className="flex bg-slate-100 p-1 rounded-lg">
                                    <button
                                        onClick={() => setModeTab("christmas")}
                                        className={clsx("px-4 py-1 rounded text-sm font-bold transition", modeTab === "christmas" ? "bg-white shadow text-green-700" : "text-slate-500")}
                                    >
                                        Crăciun
                                    </button>
                                    <button
                                        onClick={() => setModeTab("newyear")}
                                        className={clsx("px-4 py-1 rounded text-sm font-bold transition", modeTab === "newyear" ? "bg-white shadow text-yellow-700" : "text-slate-500")}
                                    >
                                        Revelion
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 border-b">
                                        <tr>
                                            <th className="px-6 py-3 font-bold text-slate-600">Nume</th>
                                            <th className="px-6 py-3 font-bold text-slate-600">Status</th>
                                            <th className="px-6 py-3 font-bold text-slate-600">Alimentație</th>
                                            <th className="px-6 py-3 font-bold text-slate-600 text-right">Șterge</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {filteredGuests.map(p => (
                                            <tr key={p.id} className="hover:bg-slate-50/50">
                                                <td className="px-6 py-3 font-medium text-slate-900">{p.name}</td>
                                                <td className="px-6 py-3">
                                                    <span className={clsx(
                                                        "px-2 py-1 rounded text-xs font-bold uppercase",
                                                        p.status === "confirmed" ? "bg-green-100 text-green-700" :
                                                            p.status === "maybe" ? "bg-orange-100 text-orange-700" :
                                                                "bg-red-100 text-red-700"
                                                    )}>
                                                        {p.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3 text-slate-500 max-w-xs truncate">{p.dietary || "-"}</td>
                                                <td className="px-6 py-3 text-right">
                                                    <button
                                                        onClick={() => {
                                                            if (confirm("Sigur ștergi acest participant din listă?")) removeParticipant(p.id);
                                                        }}
                                                        className="text-red-400 hover:text-red-600 p-2 rounded hover:bg-red-50 transition"
                                                        title="Elimină din listă"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredGuests.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-8 text-center text-slate-400 italic">
                                                    Lista pentru {modeTab === "christmas" ? "Crăciun" : "Revelion"} este goală.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* USERS TAB (Accounts) */}
                    {activeTab === "users" && (
                        <div className="animate-in fade-in slide-in-from-right-4">
                            <h2 className="text-xl font-bold text-slate-800 mb-4">Conturi Acces (Login)</h2>
                            <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 border-b">
                                        <tr>
                                            <th className="px-6 py-3 font-bold text-slate-600">Nume</th>
                                            <th className="px-6 py-3 font-bold text-slate-600">PIN</th>
                                            <th className="px-6 py-3 font-bold text-slate-600">Rol</th>
                                            <th className="px-6 py-3 font-bold text-slate-600 text-right">Acțiuni</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {users.map(u => (
                                            <tr key={u.id} className="hover:bg-slate-50/50">
                                                <td className="px-6 py-3 font-medium text-slate-900">{u.name}</td>
                                                <td className="px-6 py-3 font-mono text-slate-500 tracking-widest">{u.pin}</td>
                                                <td className="px-6 py-3">
                                                    {u.isAdmin ? (
                                                        <span className="bg-slate-900 text-white px-2 py-1 rounded text-xs font-bold">ADMIN</span>
                                                    ) : (
                                                        <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold">USER</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-3 text-right">
                                                    {!u.isAdmin && (
                                                        <button
                                                            onClick={() => {
                                                                if (confirm("Sigur ștergi acest cont? Utilizatorul nu se va mai putea loga.")) deleteUser(u.id);
                                                            }}
                                                            className="text-red-400 hover:text-red-600 p-2 rounded hover:bg-red-50 transition"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* SETTINGS TAB */}
                    {activeTab === "settings" && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                            {/* Mod Activ Global */}
                            <section>
                                <h2 className="text-xl font-bold mb-4 text-slate-800">1. Modul Activ (Ce văd userii)</h2>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => setTempConfig({ ...tempConfig, mode: "christmas" })}
                                        className={clsx(
                                            "p-4 rounded-xl border-2 transition-all font-bold text-lg",
                                            tempConfig.mode === "christmas"
                                                ? "border-green-600 bg-green-100 text-green-800 shadow-md"
                                                : "border-slate-200 text-slate-400 hover:bg-slate-50"
                                        )}
                                    >
                                        🎄 Crăciun
                                    </button>
                                    <button
                                        onClick={() => setTempConfig({ ...tempConfig, mode: "newyear" })}
                                        className={clsx(
                                            "p-4 rounded-xl border-2 transition-all font-bold text-lg",
                                            tempConfig.mode === "newyear"
                                                ? "border-yellow-500 bg-yellow-100 text-yellow-800 shadow-md"
                                                : "border-slate-200 text-slate-400 hover:bg-slate-50"
                                        )}
                                    >
                                        🎆 Revelion
                                    </button>
                                </div>
                            </section>

                            {/* Tab-uri pentru editare locații */}
                            <section>
                                <h2 className="text-xl font-bold mb-4 text-slate-800 flex items-center gap-2">
                                    <MapPin size={24} /> 2. Configurare Detalii
                                </h2>

                                <div className="flex border-b border-slate-200 mb-6">
                                    <button
                                        onClick={() => setModeTab("christmas")}
                                        className={clsx(
                                            "px-6 py-2 font-medium transition-colors border-b-2",
                                            modeTab === "christmas" ? "border-green-600 text-green-700" : "border-transparent text-slate-400 hover:text-slate-600"
                                        )}
                                    >
                                        Crăciun
                                    </button>
                                    <button
                                        onClick={() => setModeTab("newyear")}
                                        className={clsx(
                                            "px-6 py-2 font-medium transition-colors border-b-2",
                                            modeTab === "newyear" ? "border-yellow-500 text-yellow-700" : "border-transparent text-slate-400 hover:text-slate-600"
                                        )}
                                    >
                                        Revelion
                                    </button>
                                </div>

                                <div className="space-y-4 bg-slate-50 p-6 rounded-xl border border-slate-200">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-600 mb-1">Nume Locație</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2 border rounded-lg bg-white text-slate-900"
                                            value={tempConfig[modeTab].venueName}
                                            onChange={(e) => updateTempLocation(modeTab, "venueName", e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-600 mb-1">Dată & Oră Eveniment</label>
                                        <input
                                            type="datetime-local"
                                            className="w-full px-4 py-2 border rounded-lg bg-white text-slate-900"
                                            value={tempConfig[modeTab].date}
                                            onChange={(e) => updateTempLocation(modeTab, "date", e.target.value)}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-600 mb-1">Latitudine</label>
                                            <input
                                                type="text"
                                                className="w-full px-4 py-2 border rounded-lg bg-white font-mono text-sm text-slate-900"
                                                value={tempConfig[modeTab].lat}
                                                onChange={(e) => updateTempLocation(modeTab, "lat", e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-600 mb-1">Longitudine</label>
                                            <input
                                                type="text"
                                                className="w-full px-4 py-2 border rounded-lg bg-white font-mono text-sm text-slate-900"
                                                value={tempConfig[modeTab].lng}
                                                onChange={(e) => updateTempLocation(modeTab, "lng", e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Extra Settings */}
                            <section>
                                <h2 className="text-xl font-bold mb-4 text-slate-800 flex items-center gap-2">
                                    <ScrollText size={24} /> 3. Detalii Suplimentare
                                </h2>
                                <div className="space-y-4 bg-slate-50 p-6 rounded-xl border border-slate-200">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-600 mb-1">Reguli & Info (Markdown basic)</label>
                                        <textarea
                                            rows={5}
                                            className="w-full px-4 py-2 border rounded-lg bg-white text-slate-900"
                                            value={tempConfig.rules}
                                            onChange={(e) => setTempConfig({ ...tempConfig, rules: e.target.value })}
                                            placeholder="1. Regula 1..."
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* RSVP Messages */}
                            <section>
                                <h2 className="text-xl font-bold mb-4 text-slate-800 flex items-center gap-2">
                                    <CalendarCheck size={24} /> 4. Mesaje Confirmare RSVP
                                </h2>
                                <div className="space-y-4 bg-slate-50 p-6 rounded-xl border border-slate-200">
                                    {(["confirmed", "maybe", "declined"] as const).map((status) => {
                                        const labels = {
                                            confirmed: { emoji: "✅", label: "Prezent" },
                                            maybe: { emoji: "🤔", label: "Poate" },
                                            declined: { emoji: "❌", label: "Absent" }
                                        };
                                        return (
                                            <div key={status} className="grid grid-cols-2 gap-4 p-4 bg-white rounded-lg border">
                                                <div className="col-span-2 font-bold text-sm uppercase tracking-wide text-slate-500">
                                                    {labels[status].emoji} {labels[status].label}
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 mb-1">Titlu Popup</label>
                                                    <input
                                                        type="text"
                                                        className="w-full px-3 py-2 border rounded-lg bg-white text-slate-900"
                                                        value={tempConfig.rsvpMessages[status].title}
                                                        onChange={(e) => setTempConfig({
                                                            ...tempConfig,
                                                            rsvpMessages: {
                                                                ...tempConfig.rsvpMessages,
                                                                [status]: { ...tempConfig.rsvpMessages[status], title: e.target.value }
                                                            }
                                                        })}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 mb-1">Mesaj</label>
                                                    <input
                                                        type="text"
                                                        className="w-full px-3 py-2 border rounded-lg bg-white text-slate-900"
                                                        value={tempConfig.rsvpMessages[status].message}
                                                        onChange={(e) => setTempConfig({
                                                            ...tempConfig,
                                                            rsvpMessages: {
                                                                ...tempConfig.rsvpMessages,
                                                                [status]: { ...tempConfig.rsvpMessages[status], message: e.target.value }
                                                            }
                                                        })}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>

                            <button
                                onClick={handleSave}
                                className="w-full bg-slate-900 hover:bg-black text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition hover:scale-[1.01]"
                            >
                                <Save size={20} /> Salvează Tot
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}