/**
 * Gọi API thử đồ CatVTON (đã fine-tune cho Việt phục) chạy trên Modal.
 * Chạy phía server, Modal-Key/Modal-Secret không bao giờ gửi xuống trình duyệt.
 * Code phía Modal: train_model_VTTon/deploy/modal_app.py
 */
export type MaskType = "upper" | "lower" | "overall";
/** original: thay đồ, giữ nền ảnh gốc · white: tách người ra nền trắng */
export type TryOnBackground = "original" | "white";

/** Lỗi trả về giao diện kèm mã HTTP phù hợp */
export class TryOnError extends Error {
  status: number;
  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
  }
}

export function getModalConfig(): { url: string; key: string; secret: string } | null {
  // Đọc sau khi server đã nạp .env.local / .env.
  const url = process.env.MODAL_TRYON_URL?.trim();
  const key = process.env.MODAL_TRYON_KEY?.trim();
  const secret = process.env.MODAL_TRYON_SECRET?.trim();
  if (!url || !key || !secret) return null;
  return { url, key, secret };
}

/**
 * Ghép ảnh bộ đồ lên ảnh người. Trả về data URL của ảnh kết quả.
 * Lần đầu sau khi máy GPU nghỉ có thể mất 1–2 phút để khởi động.
 */
export async function catvtonTryOn(params: {
  personDataUrl: string;
  garmentDataUrl: string;
  maskType?: MaskType;
  background?: TryOnBackground;
}): Promise<string> {
  const config = getModalConfig();
  if (!config) throw new TryOnError("Máy chủ chưa cấu hình MODAL_TRYON_URL / KEY / SECRET.", 500);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5 * 60_000);
  let res: Response;
  try {
    res = await fetch(config.url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Modal-Key": config.key, "Modal-Secret": config.secret },
      body: JSON.stringify({
        person: params.personDataUrl,
        garment: params.garmentDataUrl,
        mask_type: params.maskType || "overall",
        background: params.background || "original",
      }),
      signal: controller.signal,
    });
  } catch {
    throw controller.signal.aborted
      ? new TryOnError("Máy chủ thử đồ phản hồi quá lâu. Vui lòng thử lại.", 504)
      : new TryOnError("Không kết nối được máy chủ thử đồ (Modal).", 502);
  } finally {
    clearTimeout(timer);
  }

  const data = (await res.json().catch(() => ({}))) as { image?: string; detail?: string };
  if (res.status === 401 || res.status === 403) {
    throw new TryOnError("Sai MODAL_TRYON_KEY hoặc MODAL_TRYON_SECRET trong file .env.", 500);
  }
  if (!res.ok) {
    throw new TryOnError(data.detail || `Máy chủ thử đồ báo lỗi (HTTP ${res.status}).`, res.status === 429 ? 429 : 502);
  }
  if (!data.image) throw new TryOnError("Máy chủ thử đồ không trả về ảnh.", 502);
  return data.image;
}
