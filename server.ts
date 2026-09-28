import express from "express";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { ootdTryOn, getHfToken, OotdError, OotdCategory } from "./ootd";
import { generatePersonality, PersonalityInput } from "./personality";
import { suggestLook } from "./lookSuggest";

// Đọc cấu hình: ưu tiên .env.local, sau đó .env
dotenv.config({ path: [".env.local", ".env"] });

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = 3000;

// Cho phép JSON lớn vì ảnh gửi dạng base64
app.use(express.json({ limit: "50mb" }));

// Gemini: chỉ dùng model chữ để viết "bí mật tính cách"
const apiKey = process.env.GEMINI_API_KEY?.trim();
const hasApiKey = Boolean(apiKey) && apiKey !== "MY_GEMINI_API_KEY" && apiKey !== "DAN_API_KEY_VAO_DAY";
const ai = new GoogleGenAI({ apiKey: hasApiKey ? apiKey : "missing" });

// Hugging Face: OOTDiffusion để ghép ảnh
const hasHfToken = Boolean(getHfToken());

if (!hasApiKey) console.warn("[Server] Chưa có GEMINI_API_KEY — phần bí mật tính cách dùng câu soạn sẵn.");
if (!hasHfToken) console.warn("[Server] Chưa có HF_TOKEN — nút Ghép ảnh sẽ báo lỗi.");

// Cho giao diện biết server đã cấu hình những gì
app.get("/api/status", (_req, res) => {
  res.json({ tryOn: hasHfToken, tips: hasApiKey });
});

// Ghép bộ đồ lên ảnh người bằng OOTDiffusion
app.post("/api/try-on", async (req, res) => {
  const startTime = Date.now();
  const { personDataUrl, outfitDataUrl, category } = req.body;

  if (!personDataUrl || !outfitDataUrl) {
    return res.status(400).json({ error: "Thiếu ảnh người hoặc ảnh bộ đồ." });
  }
  if (!hasHfToken) {
    return res.status(500).json({
      error: "Máy chủ chưa có HF_TOKEN. Hãy dán token Hugging Face vào file .env rồi khởi động lại.",
    });
  }

  try {
    const dataUrl = await ootdTryOn({
      personDataUrl,
      garmentDataUrl: outfitDataUrl,
      category: (category as OotdCategory) || "Dress",
    });
    console.log(`[Server /api/try-on] Xong sau ${Date.now() - startTime}ms`);
    return res.json({ dataUrl });
  } catch (err: any) {
    console.error("[Server /api/try-on] Lỗi:", err?.message);
    const status = err instanceof OotdError ? err.status : 500;
    return res.status(status).json({ error: err?.message || "Máy chủ thử đồ gặp lỗi." });
  }
});

// Gemini viết "bí mật tính cách" vui nhộn; luôn trả về nội dung (có câu dự phòng khi Gemini quá tải)
app.post("/api/personality", async (req, res) => {
  const b = req.body || {};
  const input: PersonalityInput = {
    gender: b.gender === "nam" || b.gender === "nu" ? b.gender : null,
    garmentType: String(b.garmentType || ""),
    garmentLabel: String(b.garmentLabel || "Việt phục"),
    colorLabel: b.colorLabel || null,
    eventLabel: b.eventLabel || null,
    styleLabels: Array.isArray(b.styleLabels) ? b.styleLabels.map(String).slice(0, 6) : [],
    ageRangeLabel: b.ageRangeLabel || null,
    heightCm: Number(b.heightCm) > 0 ? Number(b.heightCm) : null,
    weightKg: Number(b.weightKg) > 0 ? Number(b.weightKg) : null,
  };
  res.json(await generatePersonality(hasApiKey ? ai : null, input));
});

// Gemini chọn 1 lookbook mẫu hợp gu (chữ vào, chữ ra); luôn có kết quả dự phòng
app.post("/api/suggest-look", async (req, res) => {
  const b = req.body || {};
  res.json(
    await suggestLook(hasApiKey ? ai : null, {
      gender: b.gender === "nam" || b.gender === "nu" ? b.gender : null,
      event: b.event || null,
      styles: Array.isArray(b.styles) ? b.styles : [],
      ageRangeLabel: b.ageRangeLabel || null,
      freeText: String(b.freeText || "").slice(0, 300),
    })
  );
});

async function startServer() {
  const isProd = process.env.NODE_ENV === "production";

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
  });
}

startServer();
