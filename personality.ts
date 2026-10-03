/**
 * "Phong thái khi diện bộ này": Gemini đặt danh xưng + viết lời khen vui về khí chất của người dùng trong bộ đồ.
 * Gemini hay quá tải (503) hoặc treo, nên mỗi lần gọi có giới hạn thời gian,
 * và luôn có câu soạn sẵn để người dùng không bao giờ thấy chỗ trống.
 */
import { GoogleGenAI } from "@google/genai";
import { callGeminiJson } from "./geminiClient";

export interface PersonalityInput {
  gender: "nam" | "nu" | null;
  garmentType: string; // mã loại, ví dụ ao_dai
  garmentLabel: string; // "Áo dài"
  colorLabel: string | null;
  eventLabel: string | null;
  styleLabels: string[];
  ageRangeLabel: string | null;
  heightCm: number | null;
  weightKg: number | null;
}

export interface PersonalityResult {
  title: string;
  message: string;
  source: "gemini" | "local";
}

// Danh xưng soạn sẵn theo loại trang phục và giới tính
const TITLES: Record<string, { nam: string; nu: string }> = {
  ao_dai: { nam: "Lãng tử thư sinh", nu: "Tiểu thư liễu đào" },
  ao_dai_cach_tan: { nam: "Soái ca phố cổ", nu: "Nàng thơ Gen Z" },
  ao_tu_than: { nam: "Chàng trai làng quan họ", nu: "Thôn nữ duyên dáng" },
  ao_ngu_than: { nam: "Công tử phong nhã", nu: "Khuê nữ đoan trang" },
  ao_ba_ba: { nam: "Anh Ba miệt vườn", nu: "Cô Ba sông nước" },
  ao_tac: { nam: "Quan trạng oai phong", nu: "Mệnh phụ quyền quý" },
};

function bodyCompliment(heightCm: number | null, gender: "nam" | "nu" | null): string {
  if (!heightCm) return "";
  const tall = gender === "nam" ? heightCm >= 172 : heightCm >= 162;
  return tall
    ? " Dáng cao ráo thế này mặc tà dài là chuẩn người mẫu bước ra từ tranh luôn."
    : " Dáng nhỏ nhắn mà mặc lên lại gọn gàng, xinh xắn, ai nhìn cũng muốn chụp chung một tấm.";
}

export function localPersonality(input: PersonalityInput): PersonalityResult {
  const titles = TITLES[input.garmentType] || { nam: "Người đẹp Việt phục", nu: "Người đẹp Việt phục" };
  const title = input.gender ? titles[input.gender] : titles.nu;
  const color = input.colorLabel ? ` tông ${input.colorLabel.toLowerCase()}` : "";
  const event = input.eventLabel ? ` Dịp ${input.eventLabel.toLowerCase()} này chắc chắn bạn sẽ là tâm điểm.` : "";
  const trait =
    input.gender === "nam"
      ? "Bạn thuộc kiểu người điềm đạm bên ngoài nhưng ấm áp bên trong, nói ít mà làm nhiều."
      : "Bạn thuộc kiểu người dịu dàng bên ngoài nhưng cá tính bên trong, cười một cái là cả khung hình sáng bừng.";
  return {
    title,
    message: `Chọn ${input.garmentLabel.toLowerCase()}${color} là lộ rõ khí chất ${title.toLowerCase()} rồi đó! ${trait}${bodyCompliment(input.heightCm, input.gender)}${event} ✨`,
    source: "local",
  };
}

function buildPrompt(i: PersonalityInput): string {
  return `Bạn là stylist vui tính của một app Việt phục dành cho học sinh, sinh viên.
Dựa vào lựa chọn dưới đây, hãy đặt một danh xưng cho phong thái của người dùng khi diện bộ đồ này và KHEN họ.

Lựa chọn:
- Giới tính: ${i.gender === "nam" ? "nam" : i.gender === "nu" ? "nữ" : "không rõ"}
- Trang phục: ${i.garmentLabel}${i.colorLabel ? `, màu ${i.colorLabel}` : ""}
- Dịp mặc: ${i.eventLabel || "không rõ"}
- Phong cách thích: ${i.styleLabels.length ? i.styleLabels.join(", ") : "không rõ"}
- Độ tuổi: ${i.ageRangeLabel || "không rõ"}
- Chiều cao: ${i.heightCm ? `${i.heightCm} cm` : "không rõ"}
- Cân nặng: ${i.weightKg ? `${i.weightKg} kg` : "không rõ"}

Trả về JSON:
- title: danh xưng 2–5 chữ, kiểu cổ phong hài hước. Ví dụ: nam mặc áo dài → "Lãng tử thư sinh"; nữ mặc áo dài → "Tiểu thư liễu đào"; áo bà ba → "Cô Ba sông nước"; áo tấc → "Quan trạng oai phong".
- message: 2–3 câu tiếng Việt giọng Gen Z vui nhộn, khen ngoại hình và khí chất (đẹp trai, xinh gái, thư sinh, duyên dáng…), có thể thêm 1–2 emoji.

Luật bắt buộc:
- Chỉ khen, tích cực, không mỉa mai, không chê.
- Nếu có chiều cao/cân nặng: chỉ khen vóc dáng chung (cao ráo, cân đối, nhỏ nhắn đáng yêu…). KHÔNG nhắc lại con số cân nặng, không nói về béo/gầy, tăng/giảm cân.
- Không nói về lịch sử, nguồn gốc trang phục, không bói toán tâm linh nghiêm túc, không nội dung nhạy cảm.`;
}

export async function generatePersonality(ai: GoogleGenAI | null, input: PersonalityInput): Promise<PersonalityResult> {
  const parsed = await callGeminiJson<{ title?: string; message?: string }>(
    ai,
    buildPrompt(input),
    { type: "object", properties: { title: { type: "string" }, message: { type: "string" } }, required: ["title", "message"] },
    1.1
  );
  if (parsed?.title && parsed?.message) {
    return { title: String(parsed.title).slice(0, 60), message: String(parsed.message).slice(0, 500), source: "gemini" };
  }
  return localPersonality(input);
}
