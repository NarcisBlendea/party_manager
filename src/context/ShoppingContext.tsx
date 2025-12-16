"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface ShoppingItem {
  id: string;
  name: string;
  claimedBy?: string; // Name of person bringing it
  checked: boolean;
  addedBy: string; // User ID of person who added it
}

interface ShoppingContextType {
  items: ShoppingItem[];
  addItem: (name: string, userId: string) => void;
  claimItem: (id: string, name: string) => void;
  toggleCheck: (id: string) => void;
  removeItem: (id: string) => void;
}

const ShoppingContext = createContext<ShoppingContextType | undefined>(undefined);

export function ShoppingProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ShoppingItem[]>([]);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("revelion_shopping_v2"); // Version bump
    if (saved) {
      setItems(JSON.parse(saved));
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("revelion_shopping_v2", JSON.stringify(items));
  }, [items]);

  const addItem = (name: string, userId: string) => {
    const newItem: ShoppingItem = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      checked: false,
      addedBy: userId,
    };
    setItems((prev) => [...prev, newItem]);
  };

  const claimItem = (id: string, name: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, claimedBy: name } : item
      )
    );
  };

  const toggleCheck = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <ShoppingContext.Provider value={{ items, addItem, claimItem, toggleCheck, removeItem }}>
      {children}
    </ShoppingContext.Provider>
  );
}

export function useShopping() {
  const context = useContext(ShoppingContext);
  if (context === undefined) {
    throw new Error("useShopping must be used within a ShoppingProvider");
  }
  return context;
}