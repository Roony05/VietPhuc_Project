import type { WeatherInfo } from "./logic/weather";

export type Gender = "nam" | "nu" | "unisex";
export type GarmentType = "ao_dai" | "ao_dai_cach_tan" | "ao_tu_than" | "ao_ngu_than" | "ao_ba_ba" | "ao_tac";
export type EventTag = "tet" | "ky_yeu" | "le_tot_nghiep" | "khai_giang" | "le_hoi" | "di_chua" | "dao_pho" | "chup_anh" | "dam_cuoi";
export type StyleTag = "truyen_thong" | "toi_gian" | "gen_z" | "sang_trong";
export type ColorTag = "trang" | "do" | "vang" | "xanh_lam" | "xanh_la" | "hong" | "hong_sen" | "tim" | "nau" | "den" | "be" | "cam";
export type Screen = "home" | "filter" | "recommend" | "gallery" | "studio" | "result" | "finish" | "lookbook" | "profile";
export type AgeRange = "duoi_16" | "16_18" | "19_22" | "23_30" | "tren_30";

export interface Outfit {
  id: string;                 // trùng tên file ảnh
  familyId: string;           // cùng kiểu và giới tính, khác màu
  name: string;               // tên hiển thị
  gender: Gender;
  garmentType: GarmentType;
  colors: ColorTag[];
  events: EventTag[];
  styles: StyleTag[];
  image: string;              // WebP tách nền trong public/img/outfits (PNG gốc ở ../assets_goc)
  meaning: string;            // ý nghĩa, đội tự điền; chưa có thì "CẦN BỔ SUNG"
  meaningSource: string;      // nguồn; chưa có thì "CẦN BỔ SUNG"
  verified: boolean;          // đội đã kiểm tra thông tin văn hóa chưa
}

export interface Avatar {
  id: string;
  name: string;
  gender: Gender;
  image: string;
}

export interface UserFilters {
  gender: Gender | null;
  ageRange: AgeRange | null;
  heightCm: number | null;    // chỉ dùng cho lời khuyên chữ, KHÔNG đưa vào prompt tạo ảnh
  weightKg: number | null;    // chỉ dùng cho lời khuyên chữ, KHÔNG đưa vào prompt tạo ảnh
  event: EventTag | null;
  styles: StyleTag[];
  colors: ColorTag[];
  garmentType: GarmentType | null;
  wearDate: string | null;    // ngày mặc yyyy-mm-dd (không bắt buộc)
  placeId: string | null;     // nơi mặc, xem PLACES trong logic/weather.ts
  weather: WeatherInfo | null; // thời tiết đã tra cho ngày + nơi đó
}

export interface GeneratedImage {
  id: string;
  outfitId: string;           // bộ đồ đã ghép
  dataUrl: string;            // "data:image/png;base64,..."
  instruction: string;        // yêu cầu đã dùng để tạo ảnh này
  createdAt: number;
}

export interface LookbookItem {
  id: string;
  outfitId: string;
  imageDataUrl: string;
  note: string;
  createdAt: number;
}

/** Tài khoản demo: chỉ có tên hiển thị, không mật khẩu, lưu trên trình duyệt */
export interface Account {
  name: string;
  email: string;
  createdAt: number;
}

/** Hồ sơ người mặc (một tài khoản có thể chọn đồ cho nhiều người) */
export interface WearerProfile {
  id: string;
  name: string;               // VD "Tôi", "Em gái", "Bạn Minh"
  gender: "nam" | "nu" | null;
  ageRange: AgeRange | null;
  heightCm: number | null;
  weightKg: number | null;
  styles: StyleTag[];
  colors: ColorTag[];
  updatedAt: number;
}
