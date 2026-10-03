import { ColorTag, GarmentType } from "../types";

/**
 * BỘ PHỐI PHỤ KIỆN CHUẨN cho từng dòng áo (kiểu áo + giới tính).
 * Đây là nguồn gợi ý DUY NHẤT trong phần "Phối phụ kiện": không dùng AI chọn, để không phá nét trang phục.
 *
 * ⚠ BẢN NHÁP do lập trình viên soạn theo gợi ý thẩm mỹ phổ biến — NHÓM CẦN DUYỆT LẠI
 *   (đối chiếu tài liệu / người am hiểu Việt phục), sửa trực tiếp file này là app đổi theo.
 *
 * - items: id phụ kiện theo thứ tự ưu tiên (trong src/data/accessories.ts), mỗi vùng cơ thể 1 món
 * - colors: màu cố định cho món đó; không ghi thì app tự chọn theo màu áo
 */
export interface AccessoryPreset {
  items: string[];
  colors?: Record<string, ColorTag>;
  note: string; // 1 câu giải thích chung cho cả bộ
}

export type FamilyKey = `${GarmentType}-${"nam" | "nu"}`;

export const ACCESSORY_PRESETS: Record<FamilyKey, AccessoryPreset> = {
  "ao_dai-nu": {
    items: ["non-la", "bong-tai-ngoc", "tui-gam"],
    colors: { "bong-tai-ngoc": "trang" },
    note: "Áo dài nữ đi cùng nón lá và ngọc trai là hình ảnh quen thuộc, nhẹ nhàng, hợp mọi dịp chụp ảnh.",
  },
  "ao_dai-nam": {
    items: ["khan-dong", "quat-giay"],
    note: "Áo dài nam với khăn đóng cùng màu là bộ lễ phục chỉn chu cho Tết, lễ tốt nghiệp, đám cưới.",
  },
  "ao_dai_cach_tan-nu": {
    items: ["tram-cai", "bong-tai-ngoc", "tui-gam"],
    colors: { "bong-tai-ngoc": "trang" },
    note: "Áo dài cách tân trẻ trung nên phụ kiện nhỏ gọn: trâm cài, ngọc trai và túi gấm.",
  },
  "ao_dai_cach_tan-nam": {
    items: ["quat-giay"],
    note: "Áo dài cách tân nam vốn gọn gàng, chỉ cần một chiếc quạt làm điểm nhấn khi tạo dáng.",
  },
  "ao_tu_than-nu": {
    items: ["non-quai-thao", "guoc-moc"],
    note: "Áo tứ thân đi cùng nón quai thao và guốc mộc, đúng tinh thần ảnh lễ hội làng quê Bắc Bộ.",
  },
  "ao_tu_than-nam": {
    items: ["non-la", "guoc-moc"],
    note: "Bộ tứ thân nam mộc mạc nên đi nón lá, guốc mộc cho đồng bộ.",
  },
  "ao_ngu_than-nu": {
    items: ["khan-van", "bong-tai-ngoc"],
    colors: { "bong-tai-ngoc": "trang" },
    note: "Áo ngũ thân nữ trang trọng đi cùng khăn vấn và ngọc trai cho ngày lễ, Tết.",
  },
  "ao_ngu_than-nam": {
    items: ["khan-dong", "quat-giay"],
    note: "Áo ngũ thân nam đội khăn đóng, cầm quạt là bộ lễ phục cân đối nhất.",
  },
  "ao_ba_ba-nu": {
    items: ["non-la", "guoc-moc"],
    note: "Áo bà ba hợp nón lá và guốc mộc, giữ nét giản dị miền sông nước.",
  },
  "ao_ba_ba-nam": {
    items: ["non-la", "guoc-moc"],
    note: "Áo bà ba nam đi nón lá, guốc mộc cho đúng chất miệt vườn.",
  },
  "ao_tac-nu": {
    items: ["khan-van", "bong-tai-ngoc"],
    colors: { "bong-tai-ngoc": "trang" },
    note: "Áo tấc nữ là lễ phục, nên đi khăn vấn và trang sức ngọc trai nhã nhặn.",
  },
  "ao_tac-nam": {
    items: ["khan-dong", "quat-giay"],
    note: "Áo tấc nam đi khăn đóng và quạt, trang trọng như bộ lễ phục ngày xưa.",
  },
};
