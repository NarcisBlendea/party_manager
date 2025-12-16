"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface Song {
  id: string;
  videoId: string;
  title: string;
  addedBy: string; // User Name (Display)
  addedByUserId: string; // User ID (Permission)
  votedBy: string[];
  createdAt: number;
}

interface MusicContextType {
  songs: Song[];
  addSong: (url: string, addedBy: string, userId: string) => Promise<void>;
  voteSong: (songId: string, userId: string) => void;
  removeSong: (id: string) => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export function MusicProvider({ children }: { children: ReactNode }) {
  const [songs, setSongs] = useState<Song[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("revelion_music_v3"); // Version bump
    if (saved) {
      setSongs(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("revelion_music_v3", JSON.stringify(songs));
  }, [songs]);

  const extractVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const fetchYouTubeTitle = async (videoId: string): Promise<string> => {
    try {
      const response = await fetch(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
      );
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      return data.title || "Melodie YouTube";
    } catch (error) {
      console.error("Failed to fetch YouTube title:", error);
      return "Melodie YouTube";
    }
  };

  const addSong = async (url: string, addedBy: string, userId: string) => {
    const videoId = extractVideoId(url);
    if (!videoId) return;

    if (songs.some(s => s.videoId === videoId)) return;

    // Fetch the title from YouTube
    const title = await fetchYouTubeTitle(videoId);

    const newSong: Song = {
      id: Math.random().toString(36).substr(2, 9),
      videoId,
      title,
      addedBy,
      addedByUserId: userId,
      votedBy: [],
      createdAt: Date.now(),
    };

    setSongs(prev => [newSong, ...prev]);
  };

  const voteSong = (songId: string, userId: string) => {
    setSongs(prev =>
      prev.map(song => {
        if (song.id === songId) {
          const hasVoted = song.votedBy.includes(userId);
          let newVotedBy;

          if (hasVoted) {
            newVotedBy = song.votedBy.filter(id => id !== userId);
          } else {
            newVotedBy = [...song.votedBy, userId];
          }

          return { ...song, votedBy: newVotedBy };
        }
        return song;
      })
        .sort((a, b) => b.votedBy.length - a.votedBy.length)
    );
  };

  const removeSong = (id: string) => {
    setSongs(prev => prev.filter(s => s.id !== id));
  };

  return (
    <MusicContext.Provider value={{ songs, addSong, voteSong, removeSong }}>
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error("useMusic must be used within a MusicProvider");
  }
  return context;
}
