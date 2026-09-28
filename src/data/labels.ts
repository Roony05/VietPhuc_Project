import {
  AgeRange,
  ColorTag,
  EventTag,
  GarmentType,
  Gender,
  StyleTag,
} from "../types";

export const genderLabels: Record<Gender, string> = {
  nam: "Nam",
  nu: "Nữ",
  unisex: "Unisex",
};

export const garmentTypeLabels: Record<GarmentType, string> = {
  ao_dai: "Áo dài",
  ao_dai_cach_tan: "Áo dài cách tân",
  ao_tu_than: "Áo tứ thân",
  ao_ngu_than: "Áo ngũ thân",
  ao_ba_ba: "Áo bà ba",
  ao_tac: "Áo tấc",
};

export const eventLabels: Record<EventTag, string> = {
  tet: "Tết",
  ky_yeu: "Kỷ yếu",
  le_tot_nghiep: "Lễ tốt nghiệp",
  khai_giang: "Khai giảng",
  le_hoi: "Lễ hội",
  di_chua: "Đi chùa",
  dao_pho: "Dạo phố",
  chup_anh: "Chụp ảnh",
  dam_cuoi: "Đám cưới",
};

export const styleLabels: Record<StyleTag, string> = {
  truyen_thong: "Truyền thống",
  toi_gian: "Tối giản",
  gen_z: "Gen Z",
  sang_trong: "Sang trọng",
};

export interface ColorInfo {
  label: string;
  hex: string;
  border?: string;
}

export const colorLabels: Record<ColorTag, ColorInfo> = {
  trang: { label: "Trắng", hex: "#FFFFFF", border: "#D1D5DB" },
  do: { label: "Đỏ", hex: "#DC2626" },
  vang: { label: "Vàng", hex: "#EAB308" },
  xanh_lam: { label: "Xanh lam", hex: "#2563EB" },
  xanh_la: { label: "Xanh lá", hex: "#16A34A" },
  hong: { label: "Hồng", hex: "#EC4899" },
  hong_sen: { label: "Hồng sen", hex: "#D63379" },
  tim: { label: "Tím", hex: "#9333EA" },
  nau: { label: "Nâu", hex: "#78350F" },
  den: { label: "Đen", hex: "#18181B" },
  be: { label: "Be", hex: "#E7D8C9" },
  cam: { label: "Cam", hex: "#EA580C" },
};

export const ageRangeLabels: Record<AgeRange, string> = {
  duoi_16: "Dưới 16 tuổi",
  "16_18": "16 - 18 tuổi",
  "19_22": "19 - 22 tuổi",
  "23_30": "23 - 30 tuổi",
  tren_30: "Trên 30 tuổi",
};


/** Danh sách nhãn tiếng Việt của các lựa chọn, dùng để hiện chip tóm tắt */
export function filterSummary(f: {
  gender: Gender | null;
  event: EventTag | null;
  garmentType: GarmentType | null;
  styles: StyleTag[];
  colors: ColorTag[];
}): string[] {
  return [
    f.gender && genderLabels[f.gender],
    f.event && eventLabels[f.event],
    f.garmentType && garmentTypeLabels[f.garmentType],
    ...f.styles.map((s) => styleLabels[s]),
    ...f.colors.map((c) => colorLabels[c].label),
  ].filter(Boolean) as string[];
}
