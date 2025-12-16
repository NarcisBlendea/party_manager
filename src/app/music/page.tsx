"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMusic } from "@/context/MusicContext";
import { useConfig } from "@/context/ConfigContext";
import { useAuth } from "@/context/AuthContext";
import { Plus, ThumbsUp, Trash2, Music, ExternalLink, Youtube, Heart } from "lucide-react";
import { clsx } from "clsx";

export default function MusicPage() {
  const { songs, addSong, voteSong, removeSong } = useMusic();
  const { config } = useConfig();
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.push("/login");
  }, [user, router]);

  const isChristmas = config.mode === "christmas";

  const [url, setUrl] = useState("");

  const glassStyle = isChristmas ? "christmas-glass" : "newyear-glass";
  const titleColor = isChristmas ? "text-red-800" : "text-amber-100";
  const inputBg = isChristmas ? "bg-white/50 border-green-200 focus:border-green-500" : "bg-black/30 border-white/20 focus:border-yellow-500 text-white";

  if (!user) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (url) {
      addSong(url, user.name, user.id);
      setUrl("");
    }
  };

  const isAdmin = user.isAdmin;

  return (
    <div className="max-w-4xl mx-auto py-10">
      <div className="text-center mb-12">
        <h1 className={clsx("text-5xl font-serif font-black mb-4 drop-shadow-lg flex items-center justify-center gap-3", titleColor)}>
          <Music size={48} /> YouTube Jukebox
        </h1>
        <p className={clsx("text-lg opacity-80 max-w-lg mx-auto", isChristmas ? "text-green-900" : "text-gray-300")}>
          Adaugă piesele tale preferate de pe YouTube. <br />
          Cele cu cele mai multe voturi vor fi redate primele!
        </p>
      </div>

      {/* Add Song Form */}
      <div className={clsx("glass-panel p-6 rounded-3xl mb-12 max-w-2xl mx-auto", glassStyle)}>
        <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Logat ca..."
            className={clsx("w-full md:w-1/4 px-5 py-3 rounded-xl outline-none opacity-60 cursor-not-allowed", inputBg)}
            value={user.name}
            readOnly
          />
          <input
            type="url"
            placeholder="Link YouTube (ex: youtube.com/watch?v=...)"
            className={clsx("flex-grow px-5 py-3 rounded-xl outline-none focus:ring-2 transition-all", inputBg)}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
          <button
            type="submit"
            className={clsx(
              "px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 hover:scale-105 active:scale-95 shadow-lg",
              isChristmas ? "bg-red-600 text-white" : "bg-yellow-500 text-black"
            )}
          >
            <Plus size={20} /> Adaugă
          </button>
        </form>
      </div>

      {/* Playlist Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {songs.map((song, index) => {
          const hasVoted = song.votedBy.includes(user.id);
          const voteCount = song.votedBy.length;

          return (
            <div
              key={song.id}
              className={clsx(
                "p-4 rounded-2xl flex gap-4 transition-all group hover:scale-[1.02]",
                glassStyle,
                index < 3 ? "border-2" : "border",
                index < 3 && (isChristmas ? "border-yellow-400/50" : "border-yellow-500/50 shadow-yellow-500/10")
              )}
            >
              {/* Thumbnail */}
              <div className="relative w-32 h-24 flex-shrink-0 rounded-lg overflow-hidden shadow-md bg-black">
                <img
                  src={`https://img.youtube.com/vi/${song.videoId}/mqdefault.jpg`}
                  alt="Thumbnail"
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-transparent transition-all">
                  <Youtube className="text-white opacity-80" size={32} />
                </div>
              </div>

              {/* Info */}
              <div className="flex-grow flex flex-col justify-between py-1">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold uppercase tracking-wider opacity-60">
                      Adăugat de {song.addedBy}
                    </span>
                    <div className="flex gap-2">
                      <a
                        href={`https://www.youtube.com/watch?v=${song.videoId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <ExternalLink size={16} />
                      </a>
                      {(isAdmin || song.addedBy === user.name) && (
                        <button onClick={() => removeSong(song.id)} className="text-red-400 hover:text-red-500">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                  <h3 className={clsx("font-bold text-lg leading-tight mt-1 line-clamp-2", isChristmas ? "text-green-900" : "text-white")}>
                    {song.title}
                  </h3>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <span className={clsx("text-2xl font-black", isChristmas ? "text-red-600" : "text-yellow-400")}>
                      {voteCount}
                    </span>
                    <span className="text-xs uppercase font-bold opacity-50">Voturi</span>
                  </div>
                  <button
                    onClick={() => voteSong(song.id, user.id)}
                    className={clsx(
                      "flex items-center gap-2 px-4 py-1.5 rounded-lg font-bold transition-all hover:scale-105 active:scale-95 shadow-sm",
                      hasVoted
                        ? (isChristmas ? "bg-red-600 text-white" : "bg-yellow-500 text-black") // Active State
                        : (isChristmas ? "bg-white/50 text-red-700 hover:bg-red-100" : "bg-white/10 text-white hover:bg-white/20") // Inactive State
                    )}
                  >
                    {hasVoted ? <Heart size={16} fill="currentColor" /> : <ThumbsUp size={16} />}
                    {hasVoted ? "Votat" : "Votează"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {songs.length === 0 && (
          <div className="col-span-full text-center py-20 opacity-50">
            Nu există piese încă. Fii tu DJ-ul!
          </div>
        )}
      </div>
    </div>
  );
}