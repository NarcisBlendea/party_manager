"use client";

import { useState, useEffect } from "react";
import { useShopping } from "@/context/ShoppingContext";
import { useConfig } from "@/context/ConfigContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Plus, Trash2, UserPlus, Check, X, Calculator, Wine } from "lucide-react";
import { clsx } from "clsx";

export default function ShoppingPage() {
  const { items, addItem, claimItem, toggleCheck, removeItem } = useShopping();
  const { config } = useConfig();
  const { user } = useAuth();
  const router = useRouter();

  // Protect Route
  useEffect(() => {
    if (!user) router.push("/login");
  }, [user, router]);

  const isChristmas = config.mode === "christmas";

  const [newItemName, setNewItemName] = useState("");

  // Drink Calculator State
  const [guests, setGuests] = useState(10);
  const [hours, setHours] = useState(6);
  const [showCalc, setShowCalc] = useState(false);

  const glassStyle = isChristmas ? "christmas-glass" : "newyear-glass";
  const titleColor = isChristmas ? "text-red-800" : "text-amber-100";
  const inputBg = isChristmas ? "bg-white/50 border-green-200" : "bg-black/30 border-white/20 text-white";

  if (!user) return null;

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItemName.trim()) {
      addItem(newItemName, user.id);
      setNewItemName("");
    }
  };

  const isAdmin = user.isAdmin;

  const handleClaim = (id: string) => {
    claimItem(id, user.name);
  };

  // Simple Formula: 2 drinks first hour, 1 drink every hour after per person
  const totalDrinks = guests * (1 + hours);
  const estBeer = Math.ceil(totalDrinks * 0.5); // 50% Beer
  const estWine = Math.ceil((totalDrinks * 0.3) / 5); // 30% Wine (5 glasses/bottle)
  const estSpirits = Math.ceil((totalDrinks * 0.2) / 15); // 20% Spirits (15 shots/bottle)

  return (
    <div className="max-w-4xl mx-auto py-10">
      <div className="text-center mb-12">
        <h1 className={clsx("text-5xl font-serif font-black mb-4 drop-shadow-lg", titleColor)}>
          Shopping List
        </h1>
        <p className={clsx("text-lg opacity-80 max-w-lg mx-auto", isChristmas ? "text-green-900" : "text-gray-300")}>
          Lista comună pentru o petrecere reușită.
          <br />Adaugă ce lipsește sau asumă-ți responsabilitatea.
        </p>
      </div>

      {/* Drink Calculator Toggle */}
      <div className="flex justify-center mb-8">
        <button
          onClick={() => setShowCalc(!showCalc)}
          className={clsx(
            "flex items-center gap-2 px-6 py-3 rounded-full font-bold shadow-lg transition-all hover:scale-105 active:scale-95 border",
            showCalc
              ? (isChristmas ? "bg-red-100 text-red-800 border-red-200" : "bg-white/20 text-white border-white/30")
              : (isChristmas ? "bg-white text-green-800 border-green-200" : "bg-slate-800 text-yellow-400 border-yellow-500/50")
          )}
        >
          <Calculator size={20} /> {showCalc ? "Ascunde Calculatorul" : "Deschide Calculator Băuturi"}
        </button>
      </div>

      {/* Drink Calculator Widget */}
      {showCalc && (
        <div className={clsx("glass-panel p-8 rounded-3xl mb-12 max-w-2xl mx-auto animate-in fade-in zoom-in-95 shadow-2xl border-2",
          isChristmas ? "border-white/60 bg-white/80" : "border-white/10 bg-black/40"
        )}>
          <div className={clsx("flex items-center gap-2 mb-6 font-black text-2xl border-b pb-4", isChristmas ? "text-red-800 border-red-100" : "text-white border-white/10")}>
            <Wine size={28} /> Estimator Necesar
          </div>

          <div className="flex gap-6 mb-8">
            <div className="flex-1">
              <label className={clsx("text-xs uppercase font-bold mb-2 block", isChristmas ? "text-green-800 opacity-70" : "text-white opacity-60")}>Invitați</label>
              <input
                type="number"
                value={guests}
                onChange={e => setGuests(Number(e.target.value))}
                className={clsx("w-full px-4 py-3 rounded-xl text-lg font-bold outline-none ring-1 focus:ring-2", inputBg)}
              />
            </div>
            <div className="flex-1">
              <label className={clsx("text-xs uppercase font-bold mb-2 block", isChristmas ? "text-green-800 opacity-70" : "text-white opacity-60")}>Durată (Ore)</label>
              <input
                type="number"
                value={hours}
                onChange={e => setHours(Number(e.target.value))}
                className={clsx("w-full px-4 py-3 rounded-xl text-lg font-bold outline-none ring-1 focus:ring-2", inputBg)}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className={clsx("p-4 rounded-2xl", isChristmas ? "bg-yellow-50 text-yellow-900" : "bg-white/10 text-white")}>
              <div className="text-3xl font-black mb-1">{estBeer}</div>
              <div className="text-xs font-bold uppercase opacity-70">Beri (doze)</div>
            </div>
            <div className={clsx("p-4 rounded-2xl", isChristmas ? "bg-red-50 text-red-900" : "bg-white/10 text-white")}>
              <div className="text-3xl font-black mb-1">{estWine}</div>
              <div className="text-xs font-bold uppercase opacity-70">Vin (sticle)</div>
            </div>
            <div className={clsx("p-4 rounded-2xl", isChristmas ? "bg-purple-50 text-purple-900" : "bg-white/10 text-white")}>
              <div className="text-3xl font-black mb-1">{estSpirits}</div>
              <div className="text-xs font-bold uppercase opacity-70">Tărie (sticle)</div>
            </div>
          </div>
          <p className={clsx("text-xs text-center mt-6 italic", isChristmas ? "text-slate-500" : "text-slate-400")}>
            *Calcul bazat pe consum mediu: 2 băuturi în prima oră, apoi 1 pe oră.
          </p>
        </div>
      )}

      {/* Add New Item Form */}
      <div className={clsx("glass-panel p-4 rounded-2xl mb-10 max-w-xl mx-auto", glassStyle)}>
        <form onSubmit={handleAddItem} className="flex gap-3">
          <input
            type="text"
            placeholder="Adaugă produs..."
            className={clsx("flex-grow px-5 py-3 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 transition-all", inputBg)}
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
          />
          <button
            type="submit"
            className={clsx(
              "px-6 rounded-xl font-bold transition-all flex items-center gap-2 hover:scale-105 active:scale-95",
              isChristmas ? "bg-green-700 text-white" : "bg-purple-600 text-white"
            )}
          >
            <Plus size={24} />
          </button>
        </form>
      </div>

      {/* Items List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        {items.map((item) => (
          <div
            key={item.id}
            className={clsx(
              "p-5 rounded-2xl border transition-all flex flex-col justify-between group hover:scale-[1.01]",
              glassStyle,
              item.checked ? "opacity-60 grayscale" : "opacity-100 shadow-xl"
            )}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => toggleCheck(item.id)}
                  className={clsx(
                    "w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all",
                    item.checked
                      ? "bg-green-500 border-green-500 text-white scale-110"
                      : "border-white/30 hover:border-green-400 text-transparent"
                  )}
                >
                  <Check size={20} />
                </button>
                <span
                  className={clsx(
                    "font-bold text-xl",
                    item.checked && "line-through decoration-2"
                  )}
                >
                  {item.name}
                </span>
              </div>
              {(isAdmin || item.addedBy === user.id) && (
                <button
                  onClick={() => removeItem(item.id)}
                  className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-500 transition-all p-2 bg-white/5 rounded-full"
                  title="Șterge"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-sm">
              {item.claimedBy ? (
                <div className="flex items-center gap-2 font-bold px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  <UserPlus size={14} />
                  <span>Aduce: {item.claimedBy}</span>
                  {item.claimedBy === user.name && (
                    <button onClick={() => claimItem(item.id, "")} className="ml-1 text-xs text-red-400 hover:text-red-300">(Renunță)</button>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => handleClaim(item.id)}
                  className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity hover:text-purple-300"
                >
                  <UserPlus size={16} /> Vreau să aduc eu
                </button>
              )}
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div className="col-span-full text-center py-20 opacity-50 font-serif text-xl">
            Lista e goală... deocamdată.
          </div>
        )}
      </div>
    </div>
  );
}