import express from "express";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Đọc API key: ưu tiên .env.local, sau đó .env
dotenv.config({ path: [".env.local", ".env"] });

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = 3000;

// Cho phép xử lý JSON payload lớn vì có base64 image
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Khởi tạo SDK @google/genai trên server
const apiKey = process.env.GEMINI_API_KEY?.trim();
const hasApiKey = Boolean(apiKey) && apiKey !== "MY_GEMINI_API_KEY" && apiKey !== "DAN_API_KEY_VAO_DAY";
if (!hasApiKey) {
  console.warn("[Server] Chưa có GEMINI_API_KEY trong file .env — các tính năng AI sẽ báo lỗi.");
}
const ai = new GoogleGenAI({ apiKey: hasApiKey ? apiKey : "missing" });

// Chặn sớm các endpoint AI khi chưa cấu hình API key
app.use("/api", (_req, res, next) => {
  if (!hasApiKey) {
    return res.status(500).json({
      error: "Máy chủ chưa có GEMINI_API_KEY. Hãy dán API key vào file .env rồi khởi động lại.",
    });
  }
  next();
});

// Đổi lỗi thô của Gemini thành thông báo tiếng Việt dễ hiểu
function friendlyAiError(error: any, fallback: string): { status: number; message: string } {
  const raw = String(error?.message || "");
  const status = Number(error?.status) || (raw.includes('"code":429') ? 429 : 500);
  if (status === 429) {
    if (/FreeTier/.test(raw) && /limit: 0/.test(raw)) {
      return {
        status,
        message:
          "Model tạo ảnh không dùng được với gói miễn phí của API key này. Hãy bật billing (Tier 1) cho project chứa key, hoặc đổi IMAGE_MODEL trong src/config.ts.",
      };
    }
    return { status, message: "AI đang hết lượt tạm thời. Vui lòng đợi khoảng 1 phút rồi thử lại." };
  }
  if (status === 404 || /not found/i.test(raw)) {
    return { status, message: "Không tìm thấy model AI. Hãy kiểm tra tên model trong src/config.ts." };
  }
  if (status === 400 && /API key/i.test(raw)) {
    return { status, message: "API key không hợp lệ. Hãy kiểm tra lại GEMINI_API_KEY trong file .env." };
  }
  return { status: 500, message: raw || fallback };
}

// Endpoint proxy cho việc thử đồ AI
app.post("/api/try-on", async (req, res) => {
  const startTime = Date.now();
  try {
    const { personDataUrl, outfitDataUrl, accessories, garmentNameEn, model } = req.body;

    if (!personDataUrl || !outfitDataUrl) {
      return res.status(400).json({ error: "Thiếu dữ liệu ảnh người hoặc ảnh bộ đồ." });
    }

    const targetModel = model || "gemini-3.1-flash-image";
    console.log(`[Server /api/try-on] Bắt đầu gọi model: ${targetModel}...`);

    const contents: any[] = [];

    // Tách inlineData helper
    const parseDataUrl = (dataUrl: string) => {
      const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (!match) {
        throw new Error("Định dạng ảnh không hợp lệ (cần data URL base64).");
      }
      return { mimeType: match[1], data: match[2] };
    };

    // 1. Ảnh người
    const personInline = parseDataUrl(personDataUrl);
    contents.push({
      inlineData: {
        mimeType: personInline.mimeType,
        data: personInline.data,
      },
    });

    // 2. Ảnh bộ đồ
    const outfitInline = parseDataUrl(outfitDataUrl);
    contents.push({
      inlineData: {
        mimeType: outfitInline.mimeType,
        data: outfitInline.data,
      },
    });

    // 3. Ảnh phụ kiện nếu có
    if (Array.isArray(accessories)) {
      accessories.forEach((acc: any) => {
        if (acc && acc.dataUrl) {
          try {
            const accInline = parseDataUrl(acc.dataUrl);
            contents.push({
              inlineData: {
                mimeType: accInline.mimeType,
                data: accInline.data,
              },
            });
          } catch (e) {
            console.warn("[Server] Bỏ qua phụ kiện lỗi format ảnh:", acc.name);
          }
        }
      });
    }

    // Danh sách phụ kiện tiếng Anh
    const accessoryPrompts = Array.isArray(accessories)
      ? accessories
          .map((a: any) => a?.promptEn?.trim())
          .filter((p: string) => Boolean(p && p.length > 0))
      : [];
    const accessoriesString =
      accessoryPrompts.length > 0 ? accessoryPrompts.join(", ") : "none";

    const promptText = `You are a virtual try-on photo editor.
Image 1 is the PERSON. Image 2 is the OUTFIT reference (${garmentNameEn || "Vietnamese traditional outfit"}).
The following images, if any, are ACCESSORY references.
Task: create one realistic full-body photo of the SAME person from Image 1 wearing the outfit from Image 2.
Keep unchanged: the person's face, identity, skin tone, hairstyle, body shape, height proportions and pose.
Copy the outfit exactly from Image 2: collar, sleeves, front and back panels, length, color and pattern. Do not redesign it.
Do not turn it into a Chinese cheongsam/qipao, Korean hanbok or Japanese kimono.
Accessories to add naturally: ${accessoriesString}.
Background: plain light studio background.
No text, no watermark, no extra people.`;

    contents.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: targetModel,
      contents,
    });

    const elapsed = Date.now() - startTime;
    console.log(`[Server /api/try-on] Phản hồi sau ${elapsed}ms`);

    const candidates = response.candidates;
    if (!candidates || candidates.length === 0) {
      return res.status(500).json({ error: "AI không trả về kết quả khả dụng. Hãy thử lại." });
    }

    const parts = candidates[0].content?.parts;
    if (!parts || parts.length === 0) {
      return res.status(500).json({ error: "AI không trả về nội dung phần ảnh. Hãy thử lại." });
    }

    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        const mimeType = part.inlineData.mimeType || "image/png";
        const resultDataUrl = `data:${mimeType};base64,${part.inlineData.data}`;
        return res.json({ dataUrl: resultDataUrl });
      }
    }

    return res.status(500).json({ error: "AI không trả về ảnh. Hãy thử lại hoặc dùng ảnh khác." });
  } catch (error: any) {
    console.error("[Server /api/try-on] Lỗi xử lý:", error);
    const friendly = friendlyAiError(error, "Đã xảy ra lỗi khi tạo ảnh bằng AI.");
    return res.status(friendly.status).json({ error: friendly.message });
  }
});

// Endpoint proxy kiểm tra yêu cầu chỉnh sửa (text filter)
app.post("/api/check-request", async (req, res) => {
  try {
    const { request, garmentTypeLabel, eventLabel, rules, model } = req.body;
    const targetModel = model || "gemini-3.5-flash-lite";

    const rulesFormatted = Array.isArray(rules)
      ? rules.map((r: any) => `${r.accessoryName} - ${r.level} - ${r.reason}`).join("\n")
      : "Không có quy tắc cụ thể.";

    const promptText = `Bạn là bộ lọc yêu cầu cho app phối Việt phục. Chỉ trả về JSON.
Trang phục: ${garmentTypeLabel || "không rõ"}. Sự kiện: ${eventLabel || "không rõ"}.
Quy tắc phụ kiện của đội (chỉ dùng các quy tắc này, không tự thêm quy tắc văn hóa mới):
${rulesFormatted}
Yêu cầu của người dùng: "${request}"
Phân loại:
- block: yêu cầu đổi khuôn mặt, đổi vóc dáng hoặc cơ thể, làm người gầy/béo đi, hở hang, phản cảm, xúc phạm, bạo lực, hoặc không liên quan tới chỉnh ảnh trang phục.
- warn: yêu cầu thêm phụ kiện có mức 'nen_tranh' trong danh sách trên.
- ok: các trường hợp còn lại.
message: một câu tiếng Việt ngắn, thân thiện. Nếu warn thì nêu lý do lấy đúng từ quy tắc. Nếu ok thì để chuỗi rỗng.`;

    const response = await ai.models.generateContent({
      model: targetModel,
      contents: promptText,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            status: {
              type: "string",
              enum: ["ok", "warn", "block"],
            },
            message: {
              type: "string",
            },
          },
          required: ["status", "message"],
        },
      },
    });

    const text = response.text;
    if (!text) {
      return res.json({ status: "ok", message: "" });
    }

    const parsed = JSON.parse(text);
    return res.json({
      status: parsed.status || "ok",
      message: parsed.message || "",
    });
  } catch (error: any) {
    console.warn("[Server /api/check-request] Lỗi gọi AI text filter:", error);
    // Trả về ok để không chặn người dùng
    return res.json({ status: "ok", message: "" });
  }
});

// Endpoint proxy chỉnh sửa ảnh (edit image)
app.post("/api/edit-image", async (req, res) => {
  const startTime = Date.now();
  try {
    const { currentDataUrl, instructionVi, model } = req.body;
    if (!currentDataUrl || !instructionVi) {
      return res.status(400).json({ error: "Thiếu ảnh hiện tại hoặc yêu cầu chỉnh sửa." });
    }

    const targetModel = model || "gemini-3.1-flash-image";
    console.log(`[Server /api/edit-image] Bắt đầu gọi model: ${targetModel}...`);

    const parseDataUrl = (dataUrl: string) => {
      const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (!match) {
        throw new Error("Định dạng ảnh không hợp lệ (cần data URL base64).");
      }
      return { mimeType: match[1], data: match[2] };
    };

    const imgInline = parseDataUrl(currentDataUrl);
    const contents: any[] = [
      {
        inlineData: {
          mimeType: imgInline.mimeType,
          data: imgInline.data,
        },
      },
      {
        text: `Edit this photo. Keep the same person, face, body shape, pose and the same traditional Vietnamese outfit unchanged unless the instruction explicitly changes an accessory or the background.
Instruction (Vietnamese): ${instructionVi}
Keep it realistic. No text, no watermark.`,
      },
    ];

    const response = await ai.models.generateContent({
      model: targetModel,
      contents,
    });

    const elapsed = Date.now() - startTime;
    console.log(`[Server /api/edit-image] Phản hồi sau ${elapsed}ms`);

    const candidates = response.candidates;
    if (!candidates || candidates.length === 0) {
      return res.status(500).json({ error: "AI không trả về kết quả khả dụng. Hãy thử lại." });
    }

    const parts = candidates[0].content?.parts;
    if (!parts || parts.length === 0) {
      return res.status(500).json({ error: "AI không trả về nội dung phần ảnh. Hãy thử lại." });
    }

    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        const mimeType = part.inlineData.mimeType || "image/png";
        const resultDataUrl = `data:${mimeType};base64,${part.inlineData.data}`;
        return res.json({ dataUrl: resultDataUrl });
      }
    }

    return res.status(500).json({ error: "AI không trả về ảnh. Hãy thử lại hoặc dùng ảnh khác." });
  } catch (error: any) {
    console.error("[Server /api/edit-image] Lỗi xử lý:", error);
    const friendly = friendlyAiError(error, "Đã xảy ra lỗi khi chỉnh sửa ảnh bằng AI.");
    return res.status(friendly.status).json({ error: friendly.message });
  }
});

// Endpoint proxy viết lời khuyên phối đồ (text, JSON)
app.post("/api/styling-tips", async (req, res) => {
  try {
    const {
      outfitName,
      garmentTypeLabel,
      eventLabel,
      styleLabels,
      selectedAccessories,
      ageRangeLabel,
      heightCm,
      weightKg,
      model,
    } = req.body;
    const targetModel = model || "gemini-3.5-flash-lite";

    const accessoryLines =
      Array.isArray(selectedAccessories) && selectedAccessories.length > 0
        ? selectedAccessories
            .map((a: any) => `- ${a.name} - ${a.levelLabel} - ${a.reason}`)
            .join("\n")
        : "- (chưa chọn phụ kiện)";

    const promptText = `Bạn là stylist Việt phục thân thiện với học sinh, sinh viên. Trả về JSON, mỗi trường 1–2 câu tiếng Việt.
Dữ liệu: bộ đồ ${outfitName} (${garmentTypeLabel}), sự kiện ${eventLabel || "không rõ"}, phong cách ${
      Array.isArray(styleLabels) && styleLabels.length > 0 ? styleLabels.join(", ") : "không rõ"
    }.
Phụ kiện đã chọn và đánh giá của đội:
${accessoryLines}
Vóc dáng (có thể trống): độ tuổi ${ageRangeLabel || "không rõ"}, chiều cao ${heightCm ?? "không rõ"} cm, cân nặng ${weightKg ?? "không rõ"} kg.
Luật:
- stylingTip: gợi ý phối màu, kiểu tóc hoặc giày cho hợp sự kiện và phong cách.
- accessoryTip: nhận xét bộ phụ kiện đã chọn, chỉ dựa trên đánh giá của đội ở trên. Nếu chưa chọn phụ kiện thì gợi ý nên chọn nhóm "Hợp truyền thống".
- bodyTip: nếu có chiều cao hoặc cân nặng thì gợi ý độ dài tà, form áo hoặc quần sao cho thoải mái, tự tin. Lời lẽ tích cực, không chê cơ thể, không nói về giảm cân. Không có dữ liệu thì trả null.
- Không đưa ra thông tin lịch sử hay nguồn gốc trang phục (phần đó app đã có dữ liệu riêng).`;

    const response = await ai.models.generateContent({
      model: targetModel,
      contents: promptText,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            stylingTip: { type: "string" },
            accessoryTip: { type: "string" },
            bodyTip: { type: "string", nullable: true },
          },
          required: ["stylingTip", "accessoryTip"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    const hasBodyData = heightCm != null || weightKg != null;
    return res.json({
      stylingTip: parsed.stylingTip || "",
      accessoryTip: parsed.accessoryTip || "",
      bodyTip: hasBodyData ? parsed.bodyTip || null : null,
    });
  } catch (error: any) {
    console.warn("[Server /api/styling-tips] Lỗi gọi AI:", error);
    return res.status(500).json({ error: error?.message || "Không soạn được lời khuyên." });
  }
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
    console.log(`Server đang chạy tại http://0.0.0.0:${PORT}`);
  });
}

startServer();
