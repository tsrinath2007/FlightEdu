"use client";

import { create } from "zustand";
import type { Session, StudyPlan, TravelOption } from "@/types";

interface SessionStore {
  // Journey setup
  origin: string;
  originCode: string;
  destination: string;
  destinationCode: string;
  selectedOption: TravelOption | null;
  travelOptions: TravelOption[];

  // Active session
  activeSession: Session | null;
  studyPlan: StudyPlan | null;
  elapsed: number;
  isLockInMode: boolean;

  setOrigin: (name: string, code: string) => void;
  setDestination: (name: string, code: string) => void;
  setTravelOptions: (options: TravelOption[]) => void;
  setSelectedOption: (option: TravelOption) => void;
  setActiveSession: (session: Session | null) => void;
  setStudyPlan: (plan: StudyPlan | null) => void;
  setElapsed: (seconds: number) => void;
  toggleLockIn: () => void;
  reset: () => void;
}

export const useSessionStore = create<SessionStore>((set) => ({
  origin: "",
  originCode: "",
  destination: "",
  destinationCode: "",
  selectedOption: null,
  travelOptions: [],
  activeSession: null,
  studyPlan: null,
  elapsed: 0,
  isLockInMode: false,

  setOrigin: (name, code) => set({ origin: name, originCode: code }),
  setDestination: (name, code) => set({ destination: name, destinationCode: code }),
  setTravelOptions: (options) => set({ travelOptions: options }),
  setSelectedOption: (option) => set({ selectedOption: option }),
  setActiveSession: (session) => set({ activeSession: session }),
  setStudyPlan: (plan) => set({ studyPlan: plan }),
  setElapsed: (seconds) => set({ elapsed: seconds }),
  toggleLockIn: () => set((s) => ({ isLockInMode: !s.isLockInMode })),
  reset: () =>
    set({
      origin: "",
      originCode: "",
      destination: "",
      destinationCode: "",
      selectedOption: null,
      travelOptions: [],
      activeSession: null,
      studyPlan: null,
      elapsed: 0,
      isLockInMode: false,
    }),
}));
