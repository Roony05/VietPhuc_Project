import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Account, GeneratedImage, Screen, UserFilters, WearerProfile } from "../types";
import { ROUTES, screenFromHash } from "../logic/routes";
import {
  clearAllProfileData,
  loadAccount,
  loadActiveProfileId,
  loadProfiles,
  newProfile,
  saveAccount,
  saveActiveProfileId,
  saveProfiles,
} from "../logic/profileStorage";

export interface AppContextType {
  screen: Screen;
  goTo: (screen: Screen) => void;
  filters: UserFilters;
  setFilters: React.Dispatch<React.SetStateAction<UserFilters>>;
  updateFilters: (partial: Partial<UserFilters>) => void;
  selectedOutfitId: string | null;
  setSelectedOutfitId: (id: string | null) => void;
  personImageDataUrl: string | null;
  setPersonImageDataUrl: (dataUrl: string | null) => void;
  history: GeneratedImage[];
  addGeneratedImage: (img: GeneratedImage) => void;
  activeImage: GeneratedImage | null; // ảnh ghép đang xem ở trang Kết quả / Hoàn tất
  setActiveImageId: (id: string) => void;
  generationCount: number;
  incrementGenerationCount: () => void;
  resetSession: () => void;
  // tài khoản demo + hồ sơ người mặc (lưu trên trình duyệt)
  account: Account | null;
  login: (name: string, email: string) => void;
  logout: (wipe: boolean) => void;
  profiles: WearerProfile[];
  activeProfile: WearerProfile | null;
  setActiveProfileId: (id: string | null) => void;
  upsertProfile: (p: WearerProfile) => void;
  deleteProfile: (id: string) => void;
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
  wearDate: null,
  placeId: null,
  weather: null,
};

/** Thông tin hồ sơ được điền sẵn vào bộ lọc (dịp mặc và loại áo vẫn chọn theo từng lần) */
export function filtersFromProfile(p: WearerProfile): Partial<UserFilters> {
  return {
    gender: p.gender,
    ageRange: p.ageRange,
    heightCm: p.heightCm,
    weightKg: p.weightKg,
    styles: p.styles,
    colors: p.colors,
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [screen, setScreen] = useState<Screen>(() => screenFromHash(window.location.hash));
  const [account, setAccount] = useState<Account | null>(() => loadAccount());
  const [profiles, setProfiles] = useState<WearerProfile[]>(() => loadProfiles());
  const [activeProfileId, setActiveId] = useState<string | null>(() => loadActiveProfileId());
  const activeProfile = profiles.find((p) => p.id === activeProfileId) ?? null;
  const [filters, setFilters] = useState<UserFilters>(() =>
    activeProfile ? { ...initialFilters, ...filtersFromProfile(activeProfile) } : initialFilters
  );
  const [selectedOutfitId, setSelectedOutfitId] = useState<string | null>(null);
  const [personImageDataUrl, setPersonImageDataUrl] = useState<string | null>(null);
  const [history, setHistory] = useState<GeneratedImage[]>([]);
  const [activeImageId, setActiveImageId] = useState<string | null>(null);
  const activeImage = history.find((h) => h.id === activeImageId) ?? history[history.length - 1] ?? null;
  const [generationCount, setGenerationCount] = useState<number>(0);

  // nút Back / Forward của trình duyệt, hoặc người dùng tự sửa đường dẫn
  useEffect(() => {
    const onHash = () => {
      setScreen(screenFromHash(window.location.hash));
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const goTo = (newScreen: Screen) => {
    if (window.location.hash !== ROUTES[newScreen]) {
      window.location.hash = ROUTES[newScreen]; // tạo 1 mục lịch sử; hashchange sẽ đổi màn
    } else {
      setScreen(newScreen);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const updateFilters = (partial: Partial<UserFilters>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
  };

  const addGeneratedImage = (img: GeneratedImage) => {
    setHistory((prev) => [...prev, img]);
    setActiveImageId(img.id);
  };

  const incrementGenerationCount = () => {
    setGenerationCount((prev) => prev + 1);
  };

  const resetSession = () => {
    setFilters(activeProfile ? { ...initialFilters, ...filtersFromProfile(activeProfile) } : initialFilters);
    setSelectedOutfitId(null);
    setPersonImageDataUrl(null);
    setHistory([]);
    setActiveImageId(null);
    setGenerationCount(0);
  };

  const persistProfiles = (list: WearerProfile[]) => {
    setProfiles(list);
    saveProfiles(list);
  };

  const setActiveProfileId = (id: string | null) => {
    setActiveId(id);
    saveActiveProfileId(id);
    const p = profiles.find((x) => x.id === id);
    if (p) updateFilters(filtersFromProfile(p));
  };

  /** Đăng nhập demo: lần đầu tạo sẵn hồ sơ "Tôi" */
  const login = (name: string, email: string) => {
    const acc = { name: name.trim(), email: email.trim(), createdAt: Date.now() };
    setAccount(acc);
    saveAccount(acc);
    if (profiles.length === 0) {
      const me = newProfile("Tôi", { gender: filters.gender === "nam" || filters.gender === "nu" ? filters.gender : null });
      persistProfiles([me]);
      setActiveId(me.id);
      saveActiveProfileId(me.id);
    }
  };

  /** Đăng xuất; wipe = xóa luôn mọi hồ sơ trên máy này */
  const logout = (wipe: boolean) => {
    setAccount(null);
    saveAccount(null);
    if (wipe) {
      clearAllProfileData();
      setProfiles([]);
      setActiveId(null);
    }
  };

  const upsertProfile = (p: WearerProfile) => {
    const next = { ...p, updatedAt: Date.now() };
    const exists = profiles.some((x) => x.id === p.id);
    persistProfiles(exists ? profiles.map((x) => (x.id === p.id ? next : x)) : [...profiles, next]);
    if (p.id === activeProfileId) updateFilters(filtersFromProfile(next));
  };

  const deleteProfile = (id: string) => {
    const rest = profiles.filter((p) => p.id !== id);
    persistProfiles(rest);
    if (id === activeProfileId) {
      // xóa hồ sơ đang chọn thì chuyển sang hồ sơ còn lại đầu tiên
      const next = rest[0] ?? null;
      setActiveId(next?.id ?? null);
      saveActiveProfileId(next?.id ?? null);
      if (next) updateFilters(filtersFromProfile(next));
    }
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
        personImageDataUrl,
        setPersonImageDataUrl,
        history,
        addGeneratedImage,
        activeImage,
        setActiveImageId,
        generationCount,
        incrementGenerationCount,
        resetSession,
        account,
        login,
        logout,
        profiles,
        activeProfile,
        setActiveProfileId,
        upsertProfile,
        deleteProfile,
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
