/**
 * Tài khoản demo + hồ sơ người mặc, lưu trong localStorage của trình duyệt.
 * Không gửi lên máy chủ: số đo cơ thể là dữ liệu cá nhân, chỉ nằm trên máy người dùng.
 */
import { Account, WearerProfile } from "../types";

const ACCOUNT_KEY = "vietphuc_account";
const PROFILES_KEY = "vietphuc_profiles";
const ACTIVE_KEY = "vietphuc_active_profile";

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // trình duyệt chặn lưu trữ (chế độ ẩn danh...) thì chỉ giữ trong phiên này
  }
}

export const loadAccount = () => read<Account | null>(ACCOUNT_KEY, null);
export const saveAccount = (a: Account | null) => write(ACCOUNT_KEY, a);

export function loadProfiles(): WearerProfile[] {
  const list = read<unknown>(PROFILES_KEY, []);
  return Array.isArray(list) ? (list as WearerProfile[]) : [];
}
export const saveProfiles = (list: WearerProfile[]) => write(PROFILES_KEY, list);

export const loadActiveProfileId = () => read<string | null>(ACTIVE_KEY, null);
export const saveActiveProfileId = (id: string | null) => write(ACTIVE_KEY, id);

/** Xóa sạch tài khoản demo và mọi hồ sơ trên máy này */
export function clearAllProfileData() {
  [ACCOUNT_KEY, PROFILES_KEY, ACTIVE_KEY].forEach((k) => write(k, null));
}

export function newProfile(name: string, partial: Partial<WearerProfile> = {}): WearerProfile {
  return {
    id: `hs-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name,
    gender: null,
    ageRange: null,
    heightCm: null,
    weightKg: null,
    styles: [],
    colors: [],
    updatedAt: Date.now(),
    ...partial,
  };
}
