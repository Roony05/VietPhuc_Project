/**
 * Dự phòng khi API Modal lỗi (hết credits, hết lượt, máy chủ lỗi): gọi Space OOTDiffusion trên Hugging Face (Gradio API).
 * Model chung, không fine-tune cho Việt phục, không tách nền nên chất lượng thấp hơn CatVTON trên Modal.
 * Chạy phía server, token HF không bao giờ gửi xuống trình duyệt.
 */
import { TryOnError } from "./catvton";

export type OotdCategory = "Upper-body" | "Lower-body" | "Dress";

const UPLOAD_TIMEOUT_MS = 30_000;
const RESULT_TIMEOUT_MS = 180_000; // gồm cả thời gian xếp hàng chờ GPU miễn phí của Space

function spaceHost(): string {
  // Đọc sau khi server đã nạp .env.local / .env.
  const SPACE = (process.env.OOTD_SPACE || "levihsu/OOTDiffusion").trim();
  if (/^https?:\/\//.test(SPACE)) return SPACE.replace(/\/+$/, "");
  return `https://${SPACE.replace("/", "-").replace(/\./g, "-").toLowerCase()}.hf.space`;
}

export function getHfToken(): string | null {
  const token = process.env.HF_TOKEN?.trim();
  if (!token || token === "DAN_HF_TOKEN_VAO_DAY") return null;
  return token;
}

function authHeaders(): Record<string, string> {
  const token = getHfToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function parseDataUrl(dataUrl: string): { mimeType: string; buffer: Buffer } {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) throw new TryOnError("Định dạng ảnh không hợp lệ (cần data URL base64).", 400);
  return { mimeType: match[1], buffer: Buffer.from(match[2], "base64") };
}

async function uploadImage(host: string, dataUrl: string, filename: string): Promise<string> {
  const { mimeType, buffer } = parseDataUrl(dataUrl);
  const form = new FormData();
  form.append("files", new Blob([new Uint8Array(buffer)], { type: mimeType }), filename);

  const res = await fetch(`${host}/gradio_api/upload`, {
    method: "POST",
    headers: authHeaders(),
    body: form,
    signal: AbortSignal.timeout(UPLOAD_TIMEOUT_MS),
  });
  if (!res.ok) {
    throw new TryOnError(`Không tải ảnh lên được máy chủ thử đồ (HTTP ${res.status}).`, 502);
  }
  const paths = (await res.json()) as string[];
  if (!paths?.[0]) throw new TryOnError("Máy chủ thử đồ không nhận ảnh.", 502);
  return paths[0];
}

// Tìm URL ảnh đầu tiên trong kết quả Gallery của Gradio
function findImageUrl(node: any): string | null {
  if (!node) return null;
  if (Array.isArray(node)) {
    for (const item of node) {
      const url = findImageUrl(item);
      if (url) return url;
    }
    return null;
  }
  if (typeof node === "object") {
    if (typeof node.url === "string") return node.url;
    for (const value of Object.values(node)) {
      const url = findImageUrl(value);
      if (url) return url;
    }
  }
  return null;
}

// Đổi lỗi của Space thành câu tiếng Việt
function friendlySpaceError(raw: string): TryOnError {
  if (/ZeroGPU quota/i.test(raw) || /exceeded your .*quota/i.test(raw)) {
    const wait = raw.match(/Try again in ([0-9:]+)/i)?.[1];
    const hasWait = wait && !/^[0:]+$/.test(wait);
    return new TryOnError(
      `Máy chủ thử đồ đang quá tải và máy dự phòng đã hết lượt GPU miễn phí.${
        hasWait ? ` Có lượt lại sau khoảng ${wait}.` : " Vui lòng thử lại sau."
      }`,
      429
    );
  }
  if (/sleeping|paused|building/i.test(raw)) {
    return new TryOnError("Máy chủ thử đồ đang khởi động lại. Vui lòng thử lại sau 1–2 phút.", 503);
  }
  return new TryOnError(`Máy chủ thử đồ báo lỗi: ${raw.slice(0, 200)}`, 502);
}

interface OotdParams {
  personDataUrl: string;
  garmentDataUrl: string;
  category?: OotdCategory;
  steps?: number;
}

/**
 * Ghép ảnh bộ đồ lên ảnh người. Trả về data URL của ảnh kết quả.
 */
export async function ootdTryOn(params: OotdParams): Promise<string> {
  try {
    return await runOotd(params);
  } catch (err: any) {
    if (err instanceof TryOnError) throw err;
    // lỗi mạng hoặc quá thời gian chờ (AbortSignal.timeout)
    throw err?.name === "TimeoutError"
      ? new TryOnError("Máy chủ thử đồ dự phòng (Hugging Face) phản hồi quá lâu. Vui lòng thử lại sau.", 504)
      : new TryOnError("Không kết nối được máy chủ thử đồ dự phòng (Hugging Face).", 502);
  }
}

async function runOotd(params: OotdParams): Promise<string> {
  const host = spaceHost();
  const [personPath, garmentPath] = await Promise.all([
    uploadImage(host, params.personDataUrl, "person.jpg"),
    uploadImage(host, params.garmentDataUrl, params.garmentDataUrl.startsWith("data:image/png;") ? "garment.png" : "garment.jpg"),
  ]);

  const fileData = (p: string) => ({ path: p, meta: { _type: "gradio.FileData" } });
  const callRes = await fetch(`${host}/gradio_api/call/process_dc`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({
      // vton_img, garm_img, category, n_samples, n_steps, image_scale, seed
      data: [fileData(personPath), fileData(garmentPath), params.category || "Dress", 1, params.steps ?? 20, 2, -1],
    }),
    signal: AbortSignal.timeout(UPLOAD_TIMEOUT_MS),
  });
  if (!callRes.ok) {
    throw new TryOnError(`Không gọi được máy chủ thử đồ (HTTP ${callRes.status}).`, 502);
  }
  const { event_id } = (await callRes.json()) as { event_id?: string };
  if (!event_id) throw new TryOnError("Máy chủ thử đồ không trả mã xử lý.", 502);

  // Kết quả trả về dạng SSE: "event: complete|error" rồi "data: ..."
  const streamRes = await fetch(`${host}/gradio_api/call/process_dc/${event_id}`, {
    headers: authHeaders(),
    signal: AbortSignal.timeout(RESULT_TIMEOUT_MS),
  });
  const text = await streamRes.text();

  let lastEvent = "";
  for (const line of text.split("\n")) {
    if (line.startsWith("event:")) {
      lastEvent = line.slice(6).trim();
      continue;
    }
    if (!line.startsWith("data:")) continue;
    const payload = line.slice(5).trim();

    if (lastEvent === "error") {
      let message = payload;
      try {
        message = JSON.parse(payload)?.error || payload;
      } catch {
        // payload không phải JSON, giữ nguyên
      }
      throw friendlySpaceError(String(message || "Lỗi không rõ"));
    }

    if (lastEvent === "complete") {
      const url = findImageUrl(JSON.parse(payload));
      if (!url) throw new TryOnError("Máy chủ thử đồ không trả về ảnh.", 502);

      const imgRes = await fetch(url, { headers: authHeaders(), signal: AbortSignal.timeout(UPLOAD_TIMEOUT_MS) });
      if (!imgRes.ok) throw new TryOnError(`Không tải được ảnh kết quả (HTTP ${imgRes.status}).`, 502);
      const mimeType = imgRes.headers.get("content-type")?.split(";")[0] || "image/png";
      const base64 = Buffer.from(await imgRes.arrayBuffer()).toString("base64");
      return `data:${mimeType};base64,${base64}`;
    }
  }

  throw new TryOnError("Máy chủ thử đồ ngắt kết nối trước khi có kết quả. Vui lòng thử lại.", 504);
}
