import { AgeRange, EventTag, Gender, StyleTag } from "../types";

/** Lookbook mẫu dựng sẵn: mỗi mẫu là 1 bộ đồ trong thư viện + dịp mặc + phong cách + lời giới thiệu vui */
export interface PresetLook {
  id: string;
  title: string;
  vibe: string; // câu ngắn mô tả không khí
  outfitId: string; // id trong data/outfits.ts
  gender: Exclude<Gender, "unisex">;
  event: EventTag;
  styles: StyleTag[];
  ageHint: AgeRange; // độ tuổi hợp nhất, dùng để chọn nhân vật minh họa
  tips: string; // gợi ý phối thêm (thẩm mỹ, không phải thông tin lịch sử)
}

export const presetLooks: PresetLook[] = [
  {
    id: "nu-sinh-khai-giang",
    title: "Nữ sinh ngày khai giảng",
    vibe: "Tà áo trắng bay bay, sân trường đầy nắng",
    outfitId: "ao-dai-nu-trang",
    gender: "nu",
    event: "khai_giang",
    styles: ["truyen_thong", "toi_gian"],
    ageHint: "16_18",
    tips: "Tóc buộc nơ hoặc thả thẳng, giày búp bê trắng, balo nhỏ màu pastel.",
  },
  {
    id: "lang-tu-du-xuan",
    title: "Lãng tử du xuân",
    vibe: "Đi chúc Tết họ hàng, ai cũng khen ngoan",
    outfitId: "ao-dai-nam-xanh-lam",
    gender: "nam",
    event: "tet",
    styles: ["truyen_thong", "sang_trong"],
    ageHint: "19_22",
    tips: "Quần trắng, giày lười da nâu, tay cầm bao lì xì đỏ cho có không khí.",
  },
  {
    id: "co-ba-cho-noi",
    title: "Cô Ba dạo chợ nổi",
    vibe: "Mộc mạc, dễ thương, chụp ảnh sông nước siêu hợp",
    outfitId: "ao-ba-ba-nu-hong-sen",
    gender: "nu",
    event: "dao_pho",
    styles: ["truyen_thong", "toi_gian"],
    ageHint: "19_22",
    tips: "Nón lá, khăn rằn quàng cổ, dép quai hậu cho dễ đi lại.",
  },
  {
    id: "anh-ba-miet-vuon",
    title: "Anh Ba miệt vườn",
    vibe: "Chân chất, hiền lành, nụ cười tỏa nắng",
    outfitId: "ao-ba-ba-nam-nau",
    gender: "nam",
    event: "le_hoi",
    styles: ["truyen_thong"],
    ageHint: "23_30",
    tips: "Khăn rằn buộc cổ tay, quần đen ống suông, dép sandal đơn giản.",
  },
  {
    id: "nang-tho-pho-co",
    title: "Nàng thơ phố cổ",
    vibe: "Lang thang Hội An, góc nào cũng thành ảnh đẹp",
    outfitId: "ao-dai-cach-tan-nu-hong-sen",
    gender: "nu",
    event: "chup_anh",
    styles: ["gen_z"],
    ageHint: "19_22",
    tips: "Kẹp tóc ngọc trai, túi cói nhỏ, sneaker trắng cho phong cách remix.",
  },
  {
    id: "soai-ca-ky-yeu",
    title: "Soái ca kỷ yếu",
    vibe: "Cả lớp chụp chung mà ai cũng nhìn về phía bạn",
    outfitId: "ao-dai-cach-tan-nam-be",
    gender: "nam",
    event: "ky_yeu",
    styles: ["gen_z", "toi_gian"],
    ageHint: "16_18",
    tips: "Quần kaki trắng, sneaker trắng, đồng hồ dây da cho gọn gàng.",
  },
  {
    id: "thon-nu-hoi-lang",
    title: "Thôn nữ hội làng",
    vibe: "Rộn ràng tiếng trống hội, má hồng môi thắm",
    outfitId: "ao-tu-than-nu-nau",
    gender: "nu",
    event: "le_hoi",
    styles: ["truyen_thong"],
    ageHint: "19_22",
    tips: "Khăn mỏ quạ hoặc khăn vấn, thắt lưng màu nổi, quạt giấy cầm tay.",
  },
  {
    id: "quan-trang-vinh-quy",
    title: "Quan trạng vinh quy",
    vibe: "Ngày nhận bằng tốt nghiệp, oai phong như đỗ trạng",
    outfitId: "ao-tac-nam-do",
    gender: "nam",
    event: "le_tot_nghiep",
    styles: ["truyen_thong", "sang_trong"],
    ageHint: "19_22",
    tips: "Khăn đóng cùng tông, quần trắng, cầm bằng tốt nghiệp thay cho cuộn chiếu chỉ.",
  },
  {
    id: "menh-phu-don-tet",
    title: "Tiểu thư đón Tết",
    vibe: "Rực rỡ sắc vàng, đi chùa đầu năm cầu may",
    outfitId: "ao-ngu-than-nu-vang",
    gender: "nu",
    event: "tet",
    styles: ["truyen_thong", "sang_trong"],
    ageHint: "23_30",
    tips: "Khăn vấn cùng màu, trâm cài tóc, túi thêu nhỏ xinh.",
  },
  {
    id: "chang-trai-ca-phe-pho",
    title: "Chàng trai cà phê phố",
    vibe: "Đi cà phê cuối tuần, cổ phục mà vẫn cực chill",
    outfitId: "ao-dai-cach-tan-nam-den",
    gender: "nam",
    event: "dao_pho",
    styles: ["gen_z", "toi_gian"],
    ageHint: "16_18",
    tips: "Mix với quần ống suông, túi đeo chéo, sneaker trắng cho đậm chất Gen Z.",
  },
];
