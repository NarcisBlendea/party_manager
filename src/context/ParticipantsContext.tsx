"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { EventMode } from "./ConfigContext";

export type Status = "confirmed" | "maybe" | "declined";

export interface Participant {
  id: string;
  name: string;
  status: Status;
  dietary?: string;
  guests?: string[]; // Array of guest names
  event: EventMode; // Separator between Christmas/NewYear
}

interface ParticipantsContextType {
  participants: Participant[];
  addParticipant: (participant: Omit<Participant, "id">) => void;
  removeParticipant: (id: string) => void;
}

const ParticipantsContext = createContext<ParticipantsContextType | undefined>(undefined);

export function ParticipantsProvider({ children }: { children: ReactNode }) {
  const [participants, setParticipants] = useState<Participant[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("revelion_participants_v3");
    if (saved) {
      setParticipants(JSON.parse(saved));
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("revelion_participants_v3", JSON.stringify(participants));
  }, [participants]);

  const addParticipant = (newParticipant: Omit<Participant, "id">) => {
    setParticipants((prev) => {
      // Check if user already has an RSVP for THIS specific event
      const existingIndex = prev.findIndex(p =>
        p.name.toLowerCase() === newParticipant.name.toLowerCase() &&
        p.event === newParticipant.event
      );

      if (existingIndex >= 0) {
        // Update existing entry for this event
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          ...newParticipant,
        };
        return updated;
      } else {
        // Add new entry
        const participant: Participant = {
          ...newParticipant,
          id: Math.random().toString(36).substr(2, 9),
        };
        return [...prev, participant];
      }
    });
  };

  const removeParticipant = (id: string) => {
    setParticipants(prev => prev.filter(p => p.id !== id));
  };

  return (
    <ParticipantsContext.Provider value={{ participants, addParticipant, removeParticipant }}>
      {children}
    </ParticipantsContext.Provider>
  );
}

export function useParticipants() {
  const context = useContext(ParticipantsContext);
  if (context === undefined) {
    throw new Error("useParticipants must be used within a ParticipantsProvider");
  }
  return context;
}