export type Gender = "nam" | "nu" | "unisex";
export type GarmentType = "ao_dai" | "ao_dai_cach_tan" | "ao_tu_than" | "ao_ngu_than" | "ao_ba_ba" | "ao_tac";
export type EventTag = "tet" | "ky_yeu" | "le_tot_nghiep" | "khai_giang" | "le_hoi" | "di_chua" | "dao_pho" | "chup_anh" | "dam_cuoi";
export type StyleTag = "truyen_thong" | "toi_gian" | "gen_z" | "sang_trong";
export type ColorTag = "trang" | "do" | "vang" | "xanh_lam" | "xanh_la" | "hong" | "hong_sen" | "tim" | "nau" | "den" | "be" | "cam";
export type Screen = "home" | "filter" | "recommend" | "gallery" | "studio" | "lookbook";
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
  image: string;              // PNG tách nền trong outfits, ao hoặc quan
  meaning: string;            // ý nghĩa, đội tự điền; chưa có thì "CẦN BỔ SUNG"
  meaningSource: string;      // nguồn; chưa có thì "CẦN BỔ SUNG"
  imageLabel: "minh_hoa_AI" | "anh_that";
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
}

export interface GeneratedImage {
  id: string;
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
