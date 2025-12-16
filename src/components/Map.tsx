"use client";

import { useConfig } from "@/context/ConfigContext";

export default function Map() {
  const { config } = useConfig();
  
  // Select coordinates based on current mode
  const location = config.mode === "christmas" ? config.christmas : config.newyear;
  const { lat, lng } = location;

  // Generate Google Maps Embed URL using coordinates
  const mapUrl = `https://maps.google.com/maps?q=${lat},${lng}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="h-[400px] w-full rounded-lg shadow-lg overflow-hidden bg-slate-200 relative group">
      <iframe
        src={mapUrl}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen={true}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      ></iframe>
      
      {/* Overlay to prompt interaction */}
      <div className="absolute top-2 right-2 bg-white/80 backdrop-blur px-2 py-1 rounded text-xs text-black font-mono shadow-sm pointer-events-none">
        Lat: {lat}, Lng: {lng}
      </div>
    </div>
  );
}