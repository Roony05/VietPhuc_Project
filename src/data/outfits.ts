import { ColorTag, EventTag, GarmentType, Gender, Outfit, StyleTag } from "../types";
import { colorLabels, garmentTypeLabels, genderLabels } from "./labels";

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
  meaning: string;
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
    meaning:
      "Áo dài là trang phục truyền thống quen thuộc của phụ nữ Việt Nam, gồm hai tà áo dài thả xuống mặc cùng quần dài bên trong, ôm nhẹ theo dáng người. Áo dài thường được mặc trong các dịp trang trọng như khai giảng, lễ tốt nghiệp, Tết hoặc đám cưới, và cũng thường xuất hiện trong ảnh kỷ yếu, ảnh lưu niệm.",
  },
  {
    garmentType: "ao_dai",
    gender: "nam",
    baseName: "Áo dài nam",
    events: ["khai_giang", "ky_yeu", "le_tot_nghiep", "tet", "dam_cuoi"],
    styles: ["truyen_thong", "sang_trong"],
    meaning:
      "Áo dài nam là trang phục truyền thống dành cho nam giới, form áo suông dài qua gối, cổ đứng, thường mặc cùng quần dài. Trang phục này thường xuất hiện trong các dịp trang trọng như lễ Tết, đám cưới, lễ tốt nghiệp hoặc khi chụp ảnh kỷ yếu cùng bạn bè.",
  },
  {
    garmentType: "ao_dai_cach_tan",
    gender: "nu",
    baseName: "Áo dài cách tân nữ",
    events: ["dao_pho", "chup_anh", "ky_yeu"],
    styles: ["gen_z", "toi_gian"],
    meaning:
      "Áo dài cách tân là phiên bản biến tấu từ áo dài truyền thống, thường có tà áo ngắn hơn, form dáng thoải mái và dễ phối cùng phụ kiện hiện đại. Kiểu áo này được nhiều bạn trẻ lựa chọn khi dạo phố, chụp ảnh hoặc chụp kỷ yếu vì vừa giữ được nét duyên dáng vừa trẻ trung, năng động.",
  },
  {
    garmentType: "ao_dai_cach_tan",
    gender: "nam",
    baseName: "Áo dài cách tân nam",
    events: ["dao_pho", "chup_anh", "ky_yeu"],
    styles: ["gen_z", "toi_gian"],
    meaning:
      "Áo dài cách tân nam là phiên bản hiện đại hóa của áo dài truyền thống, thường được cắt gọn hơn, chất liệu và màu sắc đa dạng, dễ mặc trong đời sống thường ngày. Đây là lựa chọn phổ biến của giới trẻ khi dạo phố, chụp ảnh hoặc tham gia các buổi chụp kỷ yếu.",
  },
  {
    garmentType: "ao_tu_than",
    gender: "nu",
    baseName: "Áo tứ thân nữ",
    events: ["le_hoi", "tet", "chup_anh", "di_chua"],
    styles: ["truyen_thong"],
    meaning:
      "Áo tứ thân là trang phục truyền thống thường gắn với hình ảnh phụ nữ vùng đồng bằng Bắc Bộ, gồm nhiều vạt áo buông dài, thường mặc cùng yếm và thắt lưng. Trang phục này thường xuất hiện trong các lễ hội truyền thống, dịp Tết hoặc khi chụp ảnh mang phong cách xưa.",
  },
  {
    garmentType: "ao_tu_than",
    gender: "nam",
    baseName: "Áo tứ thân nam",
    events: ["le_hoi", "tet", "chup_anh", "di_chua"],
    styles: ["truyen_thong"],
    meaning:
      "Áo tứ thân nam là biến thể dành cho nam giới của trang phục tứ thân truyền thống, form áo rộng rãi, thường mặc cùng khăn và thắt lưng. Trang phục này thường xuất hiện trong các lễ hội dân gian, dịp Tết hoặc khi chụp ảnh theo phong cách truyền thống.",
  },
  {
    garmentType: "ao_ngu_than",
    gender: "nu",
    baseName: "Áo ngũ thân nữ",
    events: ["tet", "le_hoi", "dam_cuoi", "di_chua"],
    styles: ["truyen_thong", "sang_trong"],
    meaning:
      "Áo ngũ thân là trang phục truyền thống với năm vạt áo, cổ đứng, tay áo dài, thường được may từ chất liệu trang trọng. Áo được nhiều người lựa chọn để mặc trong các dịp lễ trang nghiêm như Tết, lễ hội, đám cưới hoặc khi đi lễ chùa.",
  },
  {
    garmentType: "ao_ngu_than",
    gender: "nam",
    baseName: "Áo ngũ thân nam",
    events: ["tet", "le_hoi", "dam_cuoi", "di_chua"],
    styles: ["truyen_thong", "sang_trong"],
    meaning:
      "Áo ngũ thân nam là trang phục truyền thống gồm năm vạt áo, cổ đứng, dáng áo dài qua gối, thường mặc cùng khăn đóng trong các nghi lễ. Trang phục này thường được dùng trong dịp Tết, lễ hội, đám cưới hoặc khi đi lễ chùa vì vẻ trang trọng, chỉn chu.",
  },
  {
    garmentType: "ao_ba_ba",
    gender: "nu",
    baseName: "Áo bà ba nữ",
    events: ["dao_pho", "le_hoi", "chup_anh"],
    styles: ["truyen_thong", "toi_gian"],
    meaning:
      "Áo bà ba là trang phục dân dã quen thuộc, thường gắn với hình ảnh vùng sông nước Nam Bộ, form áo đơn giản, không cổ, xẻ tà hai bên, mặc cùng quần dài. Trang phục này thoải mái, dễ mặc, thường xuất hiện khi dạo phố, tham gia lễ hội hoặc chụp ảnh mang phong cách mộc mạc.",
  },
  {
    garmentType: "ao_ba_ba",
    gender: "nam",
    baseName: "Áo bà ba nam",
    events: ["dao_pho", "le_hoi", "chup_anh"],
    styles: ["truyen_thong", "toi_gian"],
    meaning:
      "Áo bà ba nam là trang phục dân dã, form áo rộng rãi, không cổ, xẻ tà hai bên, thường mặc cùng quần dài thoải mái. Đây là lựa chọn quen thuộc khi dạo phố, tham gia lễ hội dân gian hoặc chụp ảnh theo phong cách giản dị, gần gũi.",
  },
  {
    garmentType: "ao_tac",
    gender: "nu",
    baseName: "Áo tấc nữ",
    events: ["tet", "le_hoi", "dam_cuoi", "di_chua"],
    styles: ["truyen_thong", "sang_trong"],
    meaning:
      "Áo tấc là loại lễ phục truyền thống với tay áo rộng, dáng áo thụng, thường được may cầu kỳ và trang trọng hơn áo thường ngày. Trang phục này thường được mặc trong các dịp lễ quan trọng như Tết, lễ hội, đám cưới hoặc khi đi lễ chùa.",
  },
  {
    garmentType: "ao_tac",
    gender: "nam",
    baseName: "Áo tấc nam",
    events: ["tet", "le_hoi", "dam_cuoi", "di_chua"],
    styles: ["truyen_thong", "sang_trong"],
    meaning:
      "Áo tấc nam là lễ phục truyền thống với tay áo rộng, dáng thụng, thường mặc cùng khăn đóng trong các nghi lễ trang trọng. Trang phục này thường xuất hiện trong dịp Tết, lễ hội, đám cưới hoặc khi đi lễ chùa nhờ vẻ trang nghiêm, chỉn chu.",
  },
];

// Tên tệp ảnh: {loai-trang-phuc}-{gioi-tinh}-{mau}.png trong public/img/outfits
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
      image: `/img/outfits/${id}.png`,
      meaning: `${family.meaning} ${colorNotes[color]}`,
      meaningSource: "CẦN BỔ SUNG",
      imageLabel: "minh_hoa_AI",
      verified: false,
    };
  });
});
