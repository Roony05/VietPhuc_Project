import React, { createContext, useContext, useState, ReactNode } from "react";
import { GeneratedImage, Screen, UserFilters } from "../types";

export interface AppContextType {
  screen: Screen;
  goTo: (screen: Screen) => void;
  filters: UserFilters;
  setFilters: React.Dispatch<React.SetStateAction<UserFilters>>;
  updateFilters: (partial: Partial<UserFilters>) => void;
  selectedOutfitId: string | null;
  setSelectedOutfitId: (id: string | null) => void;
  selectedAccessoryIds: string[];
  setSelectedAccessoryIds: React.Dispatch<React.SetStateAction<string[]>>;
  toggleAccessoryId: (id: string) => void;
  personImageDataUrl: string | null;
  setPersonImageDataUrl: (dataUrl: string | null) => void;
  history: GeneratedImage[];
  addGeneratedImage: (img: GeneratedImage) => void;
  clearHistory: () => void;
  generationCount: number;
  incrementGenerationCount: () => void;
  resetSession: () => void;
}

export const initialFilters: UserFilters = {
  gender: null,
  ageRange: null,
  heightCm: null,
  weightKg: null,
  event: null,
  styles: [],
  colors: [],
  garmentType: null,
  accessoryIds: [],
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [screen, setScreen] = useState<Screen>("home");
  const [filters, setFilters] = useState<UserFilters>(initialFilters);
  const [selectedOutfitId, setSelectedOutfitId] = useState<string | null>(null);
  const [selectedAccessoryIds, setSelectedAccessoryIds] = useState<string[]>([]);
  const [personImageDataUrl, setPersonImageDataUrl] = useState<string | null>(null);
  const [history, setHistory] = useState<GeneratedImage[]>([]);
  const [generationCount, setGenerationCount] = useState<number>(0);

  const goTo = (newScreen: Screen) => {
    setScreen(newScreen);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const updateFilters = (partial: Partial<UserFilters>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
  };

  const toggleAccessoryId = (id: string) => {
    setSelectedAccessoryIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const addGeneratedImage = (img: GeneratedImage) => {
    setHistory((prev) => [...prev, img]);
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const incrementGenerationCount = () => {
    setGenerationCount((prev) => prev + 1);
  };

  const resetSession = () => {
    setFilters(initialFilters);
    setSelectedOutfitId(null);
    setSelectedAccessoryIds([]);
    setPersonImageDataUrl(null);
    setHistory([]);
    setGenerationCount(0);
    setScreen("home");
  };

  return (
    <AppContext.Provider
      value={{
        screen,
        goTo,
        filters,
        setFilters,
        updateFilters,
        selectedOutfitId,
        setSelectedOutfitId,
        selectedAccessoryIds,
        setSelectedAccessoryIds,
        toggleAccessoryId,
        personImageDataUrl,
        setPersonImageDataUrl,
        history,
        addGeneratedImage,
        clearHistory,
        generationCount,
        incrementGenerationCount,
        resetSession,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
