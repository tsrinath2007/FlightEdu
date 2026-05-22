"use client";

import { create } from "zustand";
import type { User } from "@/types";

interface UserStore {
  user: User | null;
  setUser: (user: User | null) => void;
  updateCoins: (delta: number) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  updateCoins: (delta) =>
    set((s) => ({
      user: s.user
        ? { ...s.user, coins: Math.max(-10000, s.user.coins + delta) }
        : null,
    })),
}));
