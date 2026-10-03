import express from "express";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { catvtonTryOn, getModalConfig, TryOnError } from "./catvton";
import { generatePersonality, PersonalityInput } from "./personality";
import { suggestLook } from "./lookSuggest";

// Đọc cấu hình: ưu tiên .env.local, sau đó .env
dotenv.config({ path: [".env.local", ".env"] });

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = Number(process.env.PORT || 3000);

// Cho phép JSON lớn vì ảnh gửi dạng base64
app.use(express.json({ limit: "50mb" }));

// Gemini: chỉ dùng model chữ để viết lời khen "phong thái khi diện bộ này"
const apiKey = process.env.GEMINI_API_KEY?.trim();
const hasApiKey = Boolean(apiKey) && apiKey !== "MY_GEMINI_API_KEY" && apiKey !== "DAN_API_KEY_VAO_DAY";
const ai = new GoogleGenAI({ apiKey: hasApiKey ? apiKey : "missing" });

// Ghép ảnh: CatVTON đã fine-tune Việt phục, chạy trên Modal
const hasTryOn = Boolean(getModalConfig());

if (!hasApiKey) console.warn("[Server] Chưa có GEMINI_API_KEY — phần phong thái dùng câu soạn sẵn.");
if (hasTryOn) console.log("[Server] Ghép ảnh bằng CatVTON Việt phục trên Modal.");
else console.warn("[Server] Chưa có MODAL_TRYON_* — nút Ghép ảnh sẽ báo lỗi.");

// Cho giao diện biết server đã cấu hình những gì
app.get("/api/status", (_req, res) => {
  res.json({ tryOn: hasTryOn, tips: hasApiKey });
});

// Ghép bộ đồ lên ảnh người
app.post("/api/try-on", async (req, res) => {
  const startTime = Date.now();
  const { personDataUrl, outfitDataUrl, background } = req.body;

  if (!personDataUrl || !outfitDataUrl) {
    return res.status(400).json({ error: "Thiếu ảnh người hoặc ảnh bộ đồ." });
  }
  if (!hasTryOn) {
    return res.status(500).json({
      error: "Máy chủ chưa cấu hình dịch vụ ghép ảnh. Hãy điền MODAL_TRYON_URL / KEY / SECRET vào file .env rồi khởi động lại.",
    });
  }

  try {
    // Việt phục đều là đồ dài toàn thân nên luôn thay cả bộ ("overall")
    const dataUrl = await catvtonTryOn({
      personDataUrl,
      garmentDataUrl: outfitDataUrl,
      maskType: "overall",
      background: background === "white" ? "white" : "original",
    });
    console.log(`[Server /api/try-on] Xong sau ${Date.now() - startTime}ms`);
    return res.json({ dataUrl });
  } catch (err: any) {
    console.error("[Server /api/try-on] Lỗi:", err?.message);
    const status = err instanceof TryOnError ? err.status : 500;
    return res.status(status).json({ error: err?.message || "Máy chủ thử đồ gặp lỗi." });
  }
});

// Gemini viết lời khen phong thái vui nhộn; luôn trả về nội dung (có câu dự phòng khi Gemini quá tải)
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
