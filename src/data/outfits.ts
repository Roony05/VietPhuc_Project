import { GARMENT_HISTORY } from "./history";
import { ColorTag, EventTag, GarmentType, Gender, Outfit, StyleTag } from "../types";
import { colorLabels } from "./labels";

// 11 màu có ảnh sẵn cho mọi gia đình trang phục.
export const outfitColors: ColorTag[] = [
  "do", "vang", "xanh_lam", "xanh_la", "hong_sen", "tim", "nau", "den", "trang", "be", "cam",
];

// Ghi chú thẩm mỹ ngắn cho từng màu — chỉ mô tả cảm quan, KHÔNG khẳng định ý nghĩa lịch sử/văn hóa.
const colorNotes: Record<ColorTag, string> = {
  do: "Tông đỏ nổi bật, rực rỡ, thường được nhiều người chọn cho dịp vui, lễ Tết.",
  vang: "Tông vàng tươi sáng, ấm áp, dễ thu hút ánh nhìn trong ảnh chụp.",
  xanh_lam: "Tông xanh lam dịu mắt, mang cảm giác điềm đạm, lịch sự.",
  xanh_la: "Tông xanh lá tươi mát, gợi cảm giác gần gũi thiên nhiên.",
  hong: "Tông hồng nhẹ nhàng, ngọt ngào, tạo cảm giác trẻ trung.",
  hong_sen: "Tông hồng sen ngọt ngào, nữ tính, được nhiều bạn trẻ yêu thích.",
  tim: "Tông tím nhẹ nhàng, mộng mơ, tạo nét khác biệt khi lên hình.",
  nau: "Tông nâu trầm ấm, mộc mạc, gợi cảm giác giản dị, gần gũi.",
  den: "Tông đen thanh lịch, tôn dáng, dễ phối và ít lỗi thời.",
  trang: "Tông trắng thanh khiết, nhã nhặn, dễ phối và phù hợp nhiều dịp.",
  be: "Tông be trung tính, nhẹ nhàng, mang phong cách tối giản.",
  cam: "Tông cam năng động, tươi vui, nổi bật trong các dịp lễ hội.",
};

interface FamilyDef {
  garmentType: GarmentType;
  gender: Gender;
  baseName: string; // tên hiển thị trước khi ghép giới tính + màu
  events: EventTag[];
  styles: StyleTag[];
}

// Mỗi bản ghi mô tả MỘT gia đình trang phục (kiểu áo/quần + giới tính), dùng chung cho toàn bộ 11 màu.
// Mọi mô tả chỉ nêu đặc điểm hình dáng/cấu trúc và dịp sử dụng phổ biến, tránh khẳng định
// các chi tiết lịch sử/biểu tượng còn gây tranh cãi hoặc chưa được kiểm chứng.
const families: FamilyDef[] = [
  {
    garmentType: "ao_dai",
    gender: "nu",
    baseName: "Áo dài nữ",
    events: ["khai_giang", "ky_yeu", "le_tot_nghiep", "tet", "dam_cuoi", "chup_anh"],
    styles: ["truyen_thong", "sang_trong"],
  },
  {
    garmentType: "ao_dai",
    gender: "nam",
    baseName: "Áo dài nam",
    events: ["khai_giang", "ky_yeu", "le_tot_nghiep", "tet", "dam_cuoi"],
    styles: ["truyen_thong", "sang_trong"],
  },
  {
    garmentType: "ao_dai_cach_tan",
    gender: "nu",
    baseName: "Áo dài cách tân nữ",
    events: ["dao_pho", "chup_anh", "ky_yeu"],
    styles: ["gen_z", "toi_gian"],
  },
  {
    garmentType: "ao_dai_cach_tan",
    gender: "nam",
    baseName: "Áo dài cách tân nam",
    events: ["dao_pho", "chup_anh", "ky_yeu"],
    styles: ["gen_z", "toi_gian"],
  },
  {
    garmentType: "ao_tu_than",
    gender: "nu",
    baseName: "Áo tứ thân nữ",
    events: ["le_hoi", "tet", "chup_anh", "di_chua"],
    styles: ["truyen_thong"],
  },
  {
    garmentType: "ao_tu_than",
    gender: "nam",
    baseName: "Áo tứ thân nam",
    events: ["le_hoi", "tet", "chup_anh", "di_chua"],
    styles: ["truyen_thong"],
  },
  {
    garmentType: "ao_ngu_than",
    gender: "nu",
    baseName: "Áo ngũ thân nữ",
    events: ["tet", "le_hoi", "dam_cuoi", "di_chua"],
    styles: ["truyen_thong", "sang_trong"],
  },
  {
    garmentType: "ao_ngu_than",
    gender: "nam",
    baseName: "Áo ngũ thân nam",
    events: ["tet", "le_hoi", "dam_cuoi", "di_chua"],
    styles: ["truyen_thong", "sang_trong"],
  },
  {
    garmentType: "ao_ba_ba",
    gender: "nu",
    baseName: "Áo bà ba nữ",
    events: ["dao_pho", "le_hoi", "chup_anh"],
    styles: ["truyen_thong", "toi_gian"],
  },
  {
    garmentType: "ao_ba_ba",
    gender: "nam",
    baseName: "Áo bà ba nam",
    events: ["dao_pho", "le_hoi", "chup_anh"],
    styles: ["truyen_thong", "toi_gian"],
  },
  {
    garmentType: "ao_tac",
    gender: "nu",
    baseName: "Áo tấc nữ",
    events: ["tet", "le_hoi", "dam_cuoi", "di_chua"],
    styles: ["truyen_thong", "sang_trong"],
  },
  {
    garmentType: "ao_tac",
    gender: "nam",
    baseName: "Áo tấc nam",
    events: ["tet", "le_hoi", "dam_cuoi", "di_chua"],
    styles: ["truyen_thong", "sang_trong"],
  },
];

// Tên tệp ảnh: {loai-trang-phuc}-{gioi-tinh}-{mau}.webp trong public/img/outfits (ảnh PNG gốc ở ../assets_goc)
const fileBaseFor = (garmentType: GarmentType, gender: Gender) => `${garmentType.replaceAll("_", "-")}-${gender}`;

export const outfits: Outfit[] = families.flatMap((family) => {
  const familyId = `${family.garmentType.replaceAll("_", "-")}-${family.gender}`;
  const fileBase = fileBaseFor(family.garmentType, family.gender);

  return outfitColors.map((color): Outfit => {
    const colorSlug = color.replaceAll("_", "-");
    const id = `${fileBase}-${colorSlug}`;
    const colorInfo = colorLabels[color];
    return {
      id,
      familyId,
      name: `${family.baseName.charAt(0).toUpperCase()}${family.baseName.slice(1)} màu ${colorInfo.label.toLowerCase()}`,
      gender: family.gender,
      garmentType: family.garmentType,
      colors: [color],
      events: family.events,
      styles: family.styles,
      image: `/img/outfits/${id}.webp`,
      // lịch sử kiểu áo lấy từ src/data/history.ts (đã đối chiếu nguồn), kèm ghi chú cảm quan về màu
      meaning: `${GARMENT_HISTORY[family.garmentType].facts[0]} ${colorNotes[color]}`,
      meaningSource: GARMENT_HISTORY[family.garmentType].sources.map((src) => src.label).join("; "),
      verified: false,
    };
  });
});
