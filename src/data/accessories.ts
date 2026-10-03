import { ColorTag, EventTag, GarmentType } from "../types";

/**
 * Catalog phụ kiện để phối thêm sau khi thử đồ.
 * Ảnh sản phẩm WebP nền trong suốt, có 11 biến thể màu theo bộ outfit trong public/img/accessories.
 * Các luật "hợp / không nên" là GỢI Ý THẨM MỸ của nhóm, chưa phải quy tắc văn hóa đã kiểm chứng.
 */

/** Vùng trên người: mỗi vùng chỉ nên có 1 món */
export type AccessorySlot = "dau" | "toc" | "tai" | "co" | "tay" | "chan";

export const slotLabels: Record<AccessorySlot, string> = {
  dau: "Đội đầu",
  toc: "Cài tóc",
  tai: "Tai",
  co: "Cổ",
  tay: "Cầm tay",
  chan: "Chân",
};

export interface Accessory {
  id: string;
  name: string;
  slot: AccessorySlot;
  image: string;
  /** Ảnh nền trong suốt theo màu outfit; món có chất liệu tự nhiên chỉ nhuộm phần phù hợp. */
  colorVariants: Partial<Record<ColorTag, string>>;
  /** Màu mặc định: "match" = theo màu áo (áo đen/trắng/be thì lấy đỏ cho nổi), hoặc 1 màu cố định */
  defaultColor?: "match" | ColorTag;
  garmentTypes: GarmentType[];    // kiểu áo hợp
  genders: ("nam" | "nu")[];
  events: EventTag[];             // dịp hợp (được cộng điểm)
  avoidEvents?: EventTag[];       // dịp không nên dùng
  conflicts?: string[];           // không nên đi chung với các món này
  note: string;                   // vì sao hợp (gợi ý thẩm mỹ)
  avoidNote?: string;             // vì sao không hợp khi kiểu áo không nằm trong garmentTypes
}

/** 11 màu có ảnh cho mọi phụ kiện (trùng bảng màu bộ đồ) */
export const ACCESSORY_COLORS: ColorTag[] = ["do", "vang", "xanh_lam", "xanh_la", "hong_sen", "tim", "nau", "den", "trang", "be", "cam"];

/** Màu gợi ý cho phụ kiện theo màu áo */
export function accessoryColorFor(acc: Accessory, outfitColor: ColorTag | undefined): ColorTag {
  if (acc.defaultColor && acc.defaultColor !== "match") return acc.defaultColor;
  if (!outfitColor || outfitColor === "den" || outfitColor === "trang" || outfitColor === "be") return "do";
  return ACCESSORY_COLORS.includes(outfitColor) ? outfitColor : "do";
}

export const accessoryImageOf = (acc: Accessory, color: ColorTag) => acc.colorVariants[color] || acc.image;

const ALL_TYPES: GarmentType[] = ["ao_dai", "ao_dai_cach_tan", "ao_tu_than", "ao_ngu_than", "ao_ba_ba", "ao_tac"];

const accessoryImage = (id: string, color: string) => `/img/accessories/${id}-${color}.webp`;
const colorVariants = (id: string): Partial<Record<ColorTag, string>> => ({
  do: accessoryImage(id, "do"),
  vang: accessoryImage(id, "vang"),
  xanh_lam: accessoryImage(id, "xanh-lam"),
  xanh_la: accessoryImage(id, "xanh-la"),
  hong_sen: accessoryImage(id, "hong-sen"),
  tim: accessoryImage(id, "tim"),
  nau: accessoryImage(id, "nau"),
  den: accessoryImage(id, "den"),
  trang: accessoryImage(id, "trang"),
  be: accessoryImage(id, "be"),
  cam: accessoryImage(id, "cam"),
});

export const accessories: Accessory[] = [
  {
    id: "non-la",
    name: "Nón lá",
    slot: "dau",
    image: accessoryImage("non-la", "do"),
    colorVariants: colorVariants("non-la"),
    garmentTypes: ["ao_dai", "ao_dai_cach_tan", "ao_ba_ba", "ao_tu_than"],
    genders: ["nu", "nam"],
    events: ["chup_anh", "dao_pho", "ky_yeu", "le_hoi"],
    avoidEvents: ["dam_cuoi", "le_tot_nghiep"],
    conflicts: ["o-giay", "tram-cai"],
    note: "Dáng chóp nón cân với tà áo dài và áo bà ba, lên ảnh ngoài trời rất có không khí đồng quê.",
    avoidNote: "Áo ngũ thân, áo tấc mang nét lễ phục nên hợp khăn đóng, khăn vấn hơn nón lá.",
  },
  {
    id: "non-quai-thao",
    name: "Nón quai thao",
    slot: "dau",
    image: accessoryImage("non-quai-thao", "do"),
    colorVariants: colorVariants("non-quai-thao"),
    garmentTypes: ["ao_tu_than"],
    genders: ["nu"],
    events: ["le_hoi", "tet", "chup_anh"],
    conflicts: ["tram-cai", "o-giay"],
    note: "Mặt nón phẳng, quai lụa thả dài đi cặp quen thuộc với áo tứ thân trong ảnh lễ hội.",
    avoidNote: "Nón quai thao thường đi cùng áo tứ thân; với kiểu áo khác dễ bị lệch phong cách.",
  },
  {
    id: "khan-dong",
    name: "Khăn đóng",
    slot: "dau",
    image: accessoryImage("khan-dong", "do"),
    colorVariants: colorVariants("khan-dong"),
    garmentTypes: ["ao_dai", "ao_ngu_than", "ao_tac"],
    genders: ["nam"],
    events: ["tet", "dam_cuoi", "le_tot_nghiep", "le_hoi", "di_chua", "chup_anh"],
    avoidEvents: ["dao_pho"],
    conflicts: ["non-la"],
    note: "Khăn đóng làm bộ áo dài nam, áo ngũ thân trông chỉn chu và trang trọng hơn hẳn.",
    avoidNote: "Áo dài cách tân, áo bà ba, áo tứ thân mang nét thường phục nên ít khi đội khăn đóng.",
  },
  {
    id: "khan-van",
    name: "Khăn vấn",
    slot: "dau",
    image: accessoryImage("khan-van", "do"),
    colorVariants: colorVariants("khan-van"),
    garmentTypes: ["ao_dai", "ao_ngu_than", "ao_tac"],
    genders: ["nu"],
    events: ["tet", "dam_cuoi", "le_hoi", "di_chua", "chup_anh"],
    avoidEvents: ["dao_pho"],
    conflicts: ["non-la", "tram-cai"],
    note: "Khăn vấn tròn đầy tôn gương mặt, hợp áo dài truyền thống và áo ngũ thân ngày lễ, Tết.",
    avoidNote: "Khăn vấn hợp áo dài truyền thống, áo ngũ thân, áo tấc; với áo dài cách tân, áo bà ba, áo tứ thân dễ bị nặng nề.",
  },
  {
    id: "tram-cai",
    name: "Trâm cài tóc",
    slot: "toc",
    image: accessoryImage("tram-cai", "do"),
    colorVariants: colorVariants("tram-cai"),
    garmentTypes: ["ao_dai", "ao_dai_cach_tan", "ao_ngu_than", "ao_tac", "ao_tu_than"],
    genders: ["nu"],
    events: ["tet", "dam_cuoi", "le_tot_nghiep", "ky_yeu", "chup_anh", "le_hoi"],
    conflicts: ["non-la", "non-quai-thao", "khan-van"],
    note: "Một điểm vàng nhỏ trên tóc giúp ảnh chân dung có điểm nhấn mà không lấn át bộ đồ.",
    avoidNote: "Áo bà ba hợp tóc buông tự nhiên hơn trâm cài cầu kỳ.",
    defaultColor: "trang",
  },
  {
    id: "bong-tai-ngoc",
    name: "Bông tai ngọc trai",
    slot: "tai",
    image: accessoryImage("bong-tai-ngoc", "do"),
    colorVariants: colorVariants("bong-tai-ngoc"),
    defaultColor: "trang",
    garmentTypes: ALL_TYPES,
    genders: ["nu"],
    events: ["tet", "dam_cuoi", "le_tot_nghiep", "khai_giang", "ky_yeu", "chup_anh", "le_hoi", "dao_pho"],
    note: "Ngọc trai trắng ngà hợp mọi màu áo, giúp gương mặt sáng hơn khi lên ảnh.",
  },
  {
    id: "chuoi-ngoc",
    name: "Chuỗi ngọc trai",
    slot: "co",
    image: accessoryImage("chuoi-ngoc", "do"),
    colorVariants: colorVariants("chuoi-ngoc"),
    defaultColor: "trang",
    garmentTypes: ["ao_ba_ba", "ao_tu_than"],
    genders: ["nu"],
    events: ["tet", "dam_cuoi", "chup_anh", "le_hoi", "dao_pho"],
    note: "Cổ áo thấp của áo bà ba, áo tứ thân để lộ cổ, chuỗi ngọc vừa vặn lấp khoảng trống.",
    avoidNote: "Kiểu áo cổ đứng che gần hết cổ nên chuỗi ngọc dễ bị cấn và lấp mất.",
  },
  {
    id: "quat-giay",
    name: "Quạt giấy",
    slot: "tay",
    image: accessoryImage("quat-giay", "do"),
    colorVariants: colorVariants("quat-giay"),
    garmentTypes: ALL_TYPES,
    genders: ["nu", "nam"],
    events: ["tet", "le_hoi", "chup_anh", "ky_yeu", "dao_pho", "dam_cuoi"],
    note: "Quạt xòe cành đào cho tay có việc để làm, dáng chụp tự nhiên hơn và thêm không khí ngày xuân.",
  },
  {
    id: "tui-gam",
    name: "Túi gấm",
    slot: "tay",
    image: accessoryImage("tui-gam", "do"),
    colorVariants: colorVariants("tui-gam"),
    garmentTypes: ["ao_dai", "ao_dai_cach_tan", "ao_ba_ba", "ao_tu_than"],
    genders: ["nu"],
    events: ["tet", "dam_cuoi", "dao_pho", "chup_anh", "le_tot_nghiep", "di_chua"],
    note: "Túi gấm thêu kim tuyến là món nhấn gọn nhẹ, hợp đi lễ, chúc Tết hay dạo phố.",
    avoidNote: "Với áo ngũ thân, áo tấc dáng lễ phục, cầm quạt hoặc để tay trống trông cân hơn.",
  },
  {
    id: "o-giay",
    name: "Ô giấy",
    slot: "tay",
    image: accessoryImage("o-giay", "do"),
    colorVariants: colorVariants("o-giay"),
    garmentTypes: ["ao_dai", "ao_dai_cach_tan", "ao_ba_ba", "ao_tu_than"],
    genders: ["nu", "nam"],
    events: ["dao_pho", "chup_anh", "ky_yeu"],
    avoidEvents: ["dam_cuoi", "di_chua", "le_tot_nghiep", "khai_giang"],
    conflicts: ["non-la", "non-quai-thao"],
    note: "Tán ô giấy làm nền cho gương mặt, hợp ảnh dạo phố cổ, chụp kỷ yếu ngoài trời.",
    avoidNote: "Áo ngũ thân, áo tấc trang trọng nên ô giấy dễ làm ảnh bị rối.",
  },
  {
    id: "hoa-sen",
    name: "Hoa sen",
    slot: "tay",
    image: accessoryImage("hoa-sen", "do"),
    colorVariants: colorVariants("hoa-sen"),
    garmentTypes: ALL_TYPES,
    genders: ["nu", "nam"],
    events: ["di_chua", "chup_anh", "tet", "ky_yeu", "le_tot_nghiep", "khai_giang"],
    note: "Bông sen mềm mại, hợp ảnh đi chùa, chụp sen hay lễ tốt nghiệp nhẹ nhàng.",
    defaultColor: "hong_sen",
  },
  {
    id: "guoc-moc",
    name: "Guốc mộc",
    slot: "chan",
    image: accessoryImage("guoc-moc", "do"),
    colorVariants: colorVariants("guoc-moc"),
    garmentTypes: ["ao_ba_ba", "ao_tu_than", "ao_dai"],
    genders: ["nu", "nam"],
    events: ["chup_anh", "le_hoi", "tet", "dao_pho"],
    avoidEvents: ["le_tot_nghiep", "khai_giang"],
    note: "Guốc gỗ quai nhung giữ trọn nét mộc mạc của áo bà ba, áo tứ thân.",
    avoidNote: "Áo ngũ thân, áo tấc, áo dài cách tân thường hợp hài thêu hoặc giày kín mũi hơn.",
  },
];
