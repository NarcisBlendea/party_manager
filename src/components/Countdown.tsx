"use client";

import { useEffect, useState } from "react";

interface CountdownProps {
    targetDate: string; // ISO String
}

export default function Countdown({ targetDate }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState({
    zile: 0,
    ore: 0,
    minute: 0,
    secunde: 0,
  });

  useEffect(() => {
    const target = new Date(targetDate).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = target - now;

      if (distance < 0) {
        // Event passed
        setTimeLeft({ zile: 0, ore: 0, minute: 0, secunde: 0 });
        clearInterval(interval);
        return;
      }

      setTimeLeft({
        zile: Math.floor(distance / (1000 * 60 * 60 * 24)),
        ore: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minute: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        secunde: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mt-8">
      {Object.entries(timeLeft).map(([label, value]) => (
        <div key={label} className="bg-slate-900/40 backdrop-blur p-4 rounded-xl shadow-lg border border-white/10">
          <div className="text-3xl md:text-5xl font-bold text-white font-mono shadow-black drop-shadow-md">
            {value.toString().padStart(2, "0")}
          </div>
          <div className="text-xs uppercase tracking-widest text-slate-300 mt-2 font-bold">{label}</div>
        </div>
      ))}
    </div>
  );
}
