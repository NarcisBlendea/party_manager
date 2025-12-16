"use client";

import dynamic from "next/dynamic";
import { Calendar, Clock, MapPin, Music, Users, ArrowRight, Share2, Info, CloudSun, CloudSnow, Sun, CloudRain } from "lucide-react";
import Countdown from "@/components/Countdown";
import Link from "next/link";
import { useParticipants } from "@/context/ParticipantsContext";
import { useConfig } from "@/context/ConfigContext";
import { clsx } from "clsx";
import { useEffect, useState } from "react";

const Map = dynamic(() => import("@/components/Map"), { ssr: false });

export default function Home() {
  const { participants } = useParticipants();
  const { config } = useConfig();
  const isChristmas = config.mode === "christmas";

  // Filter participants for current event
  const currentParticipants = participants.filter(p => p.event === config.mode);
  const confirmedCount = currentParticipants.filter((p) => p.status === "confirmed").length;

  // Format Date Helper
  const getFormattedDate = () => {
    const dateStr = isChristmas ? config.christmas.date : config.newyear.date;
    if (!dateStr) return "Data nesetată";
    const date = new Date(dateStr);
    return date.toLocaleDateString("ro-RO", {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Weather State
  const [weather, setWeather] = useState<{ temp: number; code: number } | null>(null);
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const currentLocation = isChristmas ? config.christmas : config.newyear;
      const text = encodeURIComponent(`Salut! Hai la ${isChristmas ? "Crăciun" : "Revelion"} la ${currentLocation.venueName}! Intră aici să confirmi:`);
      setShareUrl(`https://wa.me/?text=${text}%20${window.location.href}`);
    }
  }, [isChristmas, config.christmas, config.newyear]);

  // Fetch Weather (Open-Meteo API)
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const loc = isChristmas ? config.christmas : config.newyear;
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lng}&current=temperature_2m,weather_code`);
        const data = await res.json();
        if (data.current) {
          setWeather({
            temp: data.current.temperature_2m,
            code: data.current.weather_code
          });
        }
      } catch (e) {
        console.error("Weather fetch failed", e);
      }
    };
    fetchWeather();
  }, [config.mode, config.christmas, config.newyear, isChristmas]);

  const getWeatherInfo = (code: number) => {
    if (code <= 1) return { label: "Senin", icon: Sun };
    if (code <= 3) return { label: "Înnorat", icon: CloudSun };
    if (code <= 48) return { label: "Ceață", icon: CloudSun };
    if (code <= 67) return { label: "Ploaie", icon: CloudRain };
    if (code <= 77) return { label: "Ninsoare", icon: CloudSnow };
    return { label: "Instabil", icon: CloudRain };
  };

  const glassStyle = isChristmas ? "christmas-glass" : "newyear-glass";
  const titleColor = isChristmas ? "text-red-700" : "text-amber-100";
  const accentText = isChristmas ? "text-green-800" : "text-gray-300";

  const heroButton = isChristmas
    ? "bg-gradient-to-r from-red-600 to-red-800 text-white shadow-red-900/50"
    : "bg-white text-black shadow-white/30";

  return (
    <div className="space-y-16 pb-10 mt-8">
      {/* Hero Section */}
      <section className="text-center space-y-8 py-10 relative">
        <div className="inline-block animate-bounce-slow">
          <span className={clsx("px-4 py-1.5 rounded-full text-sm font-bold tracking-widest uppercase border backdrop-blur-md",
            isChristmas ? "bg-white/50 border-white text-red-700" : "bg-white/10 border-white/20 text-yellow-400"
          )}>
            {isChristmas ? "Ho Ho Ho!" : "Party of the Year"}
          </span>
        </div>

        <div className="space-y-2">
          <h1 className={clsx(
            "text-6xl md:text-8xl font-serif font-black drop-shadow-2xl tracking-tight leading-none",
            isChristmas ? "text-white" : "text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-yellow-100 to-amber-600"
          )}>
            {isChristmas ? "Christmas Party" : "Revelion 2026"}
          </h1>
          <div className={clsx("text-xl md:text-2xl font-bold uppercase tracking-wide opacity-90", isChristmas ? "text-red-100" : "text-yellow-100")}>
            {getFormattedDate()}
          </div>
        </div>

        <p className={clsx("text-xl md:text-2xl font-light max-w-2xl mx-auto drop-shadow-md", isChristmas ? "text-white" : "text-gray-200")}>
          O seară magică alături de cei mai buni prieteni.
        </p>

        <Countdown targetDate={isChristmas ? config.christmas.date : config.newyear.date} />

        <div className="pt-4 flex flex-col md:flex-row gap-4 justify-center items-center">
          <Link
            href="/rsvp"
            className={clsx(
              "group relative px-10 py-4 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl flex items-center gap-3",
              heroButton
            )}
          >
            <Calendar size={22} /> Înscrie-te Acum
            <ArrowRight size={20} className="opacity-70 group-hover:translate-x-1 transition-transform" />
          </Link>

          <a
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={clsx(
              "px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl flex items-center gap-2 border",
              isChristmas ? "bg-green-600 border-green-400 text-white" : "bg-white/10 border-white/20 text-white hover:bg-white/20"
            )}
          >
            <Share2 size={20} /> Trimite pe WhatsApp
          </a>
        </div>
      </section>

      {/* Info Cards */}
      <section className="grid md:grid-cols-4 gap-4">
        {[
          {
            icon: Clock,
            title: "Când?",
            desc: getFormattedDate(),
            color: "text-blue-500"
          },
          {
            icon: MapPin,
            title: "Unde?",
            desc: (isChristmas ? config.christmas : config.newyear).venueName,
            color: "text-red-500"
          },
          {
            icon: weather ? getWeatherInfo(weather.code).icon : CloudSun,
            title: "Meteo (Live)",
            desc: weather !== null
              ? `${weather.temp}°C • ${getWeatherInfo(weather.code).label}`
              : "Se încarcă...",
            subtext: (isChristmas ? config.christmas : config.newyear).venueName,
            color: "text-sky-400"
          },
          {
            icon: Music,
            title: "Jukebox",
            desc: "Votează muzica",
            action: true,
            color: "text-green-500"
          }
        ].map((item, idx) => (
          <div key={idx} className={clsx("glass-panel p-6 rounded-3xl flex flex-col items-center text-center transition-transform hover:-translate-y-1 duration-300 relative overflow-hidden", glassStyle)}>
            <div className={clsx("p-3 rounded-full mb-3 bg-white/10 backdrop-blur-md shadow-inner", item.color)}>
              <item.icon size={24} />
            </div>
            <h3 className={clsx("font-serif font-bold text-lg mb-1", titleColor)}>{item.title}</h3>

            {item.action ? (
              <Link
                href="/music"
                className="mt-2 text-sm font-bold underline hover:no-underline opacity-80 hover:opacity-100"
              >
                Adaugă Piese &rarr;
              </Link>
            ) : (
              <>
                <p className={clsx("font-medium text-sm capitalize", accentText)}>{item.desc}</p>
                {item.subtext && (
                  <p className="text-xs opacity-50 mt-1">📍 {item.subtext}</p>
                )}
              </>
            )}
          </div>
        ))}
      </section>

      {/* Content Grid */}
      <section className="grid lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Rules & Map */}
        <div className="lg:col-span-2 space-y-6">
          {/* Rules Section */}
          <div className={clsx("glass-panel p-6 rounded-3xl", glassStyle)}>
            <h2 className={clsx("text-xl font-serif font-bold flex items-center gap-2 mb-4", titleColor)}>
              <Info size={20} /> Bine de știut
            </h2>
            <div className={clsx("whitespace-pre-wrap text-base leading-relaxed pl-4 border-l-2 border-white/20", accentText)}>
              {config.rules}
            </div>
          </div>

          {/* Map Section */}
          <div className={clsx("glass-panel p-2 rounded-3xl overflow-hidden shadow-2xl", glassStyle)}>
            <div className="p-4 border-b border-white/10 mb-2 flex justify-between items-center">
              <h2 className={clsx("text-2xl font-serif font-bold flex items-center gap-2", titleColor)}>
                <MapPin className="text-red-500" /> Harta
              </h2>
            </div>
            <div className="rounded-2xl overflow-hidden bg-black/50 relative">
              <Map />
            </div>
          </div>
        </div>

        {/* Participants Section */}
        <div className={clsx("glass-panel p-6 rounded-3xl shadow-2xl h-full min-h-[500px] flex flex-col", glassStyle)}>
          <h2 className={clsx("text-2xl font-serif font-bold flex items-center gap-3 mb-6", titleColor)}>
            <Users className="text-blue-400" /> Participanti
            <span className={clsx("text-xs font-sans font-bold px-3 py-1 rounded-full ml-auto", isChristmas ? "bg-green-100 text-green-800" : "bg-white/20 text-white")}>
              {confirmedCount} Going
            </span>
          </h2>

          <div className="flex-grow overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            {currentParticipants.map((person) => (
              <div key={person.id} className="group flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
                <div className="flex items-center gap-3">
                  <div className={clsx("w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg", isChristmas ? "bg-red-100 text-red-800" : "bg-white/10 text-yellow-400")}>
                    {person.name.charAt(0)}
                  </div>
                  <div>
                    <span className={clsx("font-bold block leading-tight", accentText)}>
                      {person.name}
                      {person.guests && person.guests.length > 0 && (
                        <span className="text-xs font-normal opacity-70 ml-1">+{person.guests.length}</span>
                      )}
                    </span>
                    {person.guests && person.guests.length > 0 && (
                      <span className="text-xs opacity-60 flex items-center gap-1">
                        👥 {person.guests.join(", ")}
                      </span>
                    )}
                    {person.dietary && (
                      <span className="text-xs opacity-60 flex items-center gap-1">🍽️ {person.dietary}</span>
                    )}
                  </div>
                </div>

                {person.status === "confirmed" && (
                  <span className="text-xs font-bold text-green-400 border border-green-400/30 px-2 py-1 rounded-lg bg-green-400/10">GOING</span>
                )}
                {person.status === "maybe" && (
                  <span className="text-xs font-bold text-orange-400 border border-orange-400/30 px-2 py-1 rounded-lg bg-orange-400/10">MAYBE</span>
                )}
                {person.status === "declined" && (
                  <span className="text-xs font-bold text-red-400 opacity-50">NO</span>
                )}
              </div>
            ))}
            {currentParticipants.length === 0 && (
              <div className="text-center py-10 opacity-50">
                <p>Be the first to join the party!</p>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 text-center">
            <Link href="/rsvp" className="text-sm font-bold opacity-70 hover:opacity-100 hover:tracking-wide transition-all">
              Nu ești pe listă? Cum să nu fii pe listă? PARTIKIPA ACUM! &rarr;
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
