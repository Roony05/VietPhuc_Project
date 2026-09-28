/**
 * Gọi Gemini API (chỉ chữ vào, chữ ra) có giới hạn thời gian, thử lại và đổi model dự phòng.
 * Các model Gemini Flash hay báo 503 "high demand" hoặc treo lâu; Gemma (cũng qua Gemini API, cùng key)
 * thường vẫn chạy khi Flash quá tải, nên được dùng làm lớp dự phòng. Mọi tính năng vẫn cần câu soạn sẵn.
 */
import { GoogleGenAI } from "@google/genai";

// Thứ tự: model báo lỗi nhanh và hay còn chạy được thử trước; model chậm (Gemma) để cuối.
// jsonMode: model hỗ trợ responseSchema; Gemma thì không, phải tự tách JSON trong câu trả lời.
// 503 là máy chủ Google quá tải cho mọi người, không liên quan quota còn nhiều hay ít.
const CHAIN = [
  { model: "gemini-3.5-flash-lite", attempts: 1, jsonMode: true, timeoutMs: 10_000 },
  { model: "gemini-3.1-flash-lite", attempts: 2, jsonMode: true, timeoutMs: 10_000 },
  { model: "gemini-3.8-flash", attempts: 1, jsonMode: true, timeoutMs: 15_000 }, // gói free chỉ 20 lượt/ngày
  { model: "gemma-4-26b-a4b-it", attempts: 1, jsonMode: false, timeoutMs: 20_000 }, // chậm nhưng ít khi quá tải
];
const TOTAL_BUDGET_MS = 30_000; // cả chuỗi thử lại (quá hạn thì dùng câu soạn sẵn)
const RETRYABLE = [429, 500, 503, 504];

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(Object.assign(new Error("timeout"), { status: 504 })), ms)),
  ]);
}

function extractJson(text: string): unknown {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw Object.assign(new Error("Không có JSON trong câu trả lời"), { status: 500 });
  return JSON.parse(match[0]);
}

/** Trả về object JSON do model sinh ra, hoặc null nếu mọi lần thử đều thất bại. */
export async function callGeminiJson<T>(
  ai: GoogleGenAI | null,
  prompt: string,
  schema: Record<string, unknown>,
  temperature = 1
): Promise<T | null> {
  if (!ai) return null;
  const started = Date.now();

  for (const { model, attempts, jsonMode, timeoutMs } of CHAIN) {
    for (let attempt = 1; attempt <= attempts; attempt++) {
      const left = TOTAL_BUDGET_MS - (Date.now() - started);
      if (left < 2_000) return null;
      try {
        const res = await withTimeout(
          ai.models.generateContent({
            model,
            contents: jsonMode
              ? prompt
              : `${prompt}\n\nChỉ trả về đúng 1 object JSON hợp lệ theo schema sau, không thêm chữ nào khác:\n${JSON.stringify(schema)}`,
            config: jsonMode
              ? { temperature, responseMimeType: "application/json", responseSchema: schema }
              : { temperature },
          }),
          Math.min(timeoutMs, left)
        );
        const text = res.text || "";
        const parsed = (jsonMode ? JSON.parse(text) : extractJson(text)) as T;
        console.log(`[Gemini] ${model} OK sau ${Date.now() - started}ms`);
        return parsed;
      } catch (err: any) {
        const status = Number(err?.status) || (err instanceof SyntaxError ? 500 : 0);
        console.warn(`[Gemini] ${model} lần ${attempt}: ${status || ""} ${String(err?.message).slice(0, 60)}`);
        if (!RETRYABLE.includes(status)) break; // sai model, sai key... thì đổi model luôn
        await new Promise((r) => setTimeout(r, 700 * attempt));
      }
    }
  }
  return null;
}
