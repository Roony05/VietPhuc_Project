import { OOTD_CATEGORY } from "../config";
import { GarmentType } from "../types";

/** Server đã cấu hình những gì (HF_TOKEN cho ghép ảnh, GEMINI_API_KEY cho lời khuyên) */
export async function getAiStatus(): Promise<{ tryOn: boolean; tips: boolean }> {
  try {
    const res = await fetch("/api/status");
    if (!res.ok) throw new Error(String(res.status));
    return await res.json();
  } catch {
    return { tryOn: false, tips: false };
  }
}

/** Gửi ảnh người + ảnh bộ đồ lên server để ghép bằng OOTDiffusion. Trả về data URL ảnh kết quả. */
export async function tryOnOutfit(params: {
  personDataUrl: string;
  outfitDataUrl: string;
  garmentType: GarmentType;
}): Promise<string> {
  let res: Response;
  try {
    res = await fetch("/api/try-on", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        personDataUrl: params.personDataUrl,
        outfitDataUrl: params.outfitDataUrl,
        category: OOTD_CATEGORY[params.garmentType],
      }),
    });
  } catch {
    throw new Error("Không kết nối được máy chủ. Hãy kiểm tra mạng rồi thử lại.");
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.dataUrl) {
    throw new Error(data.error || "Ghép ảnh không thành công. Vui lòng thử lại.");
  }
  return data.dataUrl;
}
