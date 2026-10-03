/** Server đã cấu hình những gì (MODAL_TRYON_* cho ghép ảnh, GEMINI_API_KEY cho phần chữ) */
export async function getAiStatus(): Promise<{ tryOn: boolean; tips: boolean }> {
  try {
    const res = await fetch("/api/status");
    if (!res.ok) throw new Error(String(res.status));
    return await res.json();
  } catch {
    return { tryOn: false, tips: false };
  }
}

/** original: thay đồ, giữ nền ảnh gốc · white: tách người ra nền trắng */
export type TryOnBackground = "original" | "white";

/** Gửi ảnh người + ảnh bộ đồ lên server để ghép. Trả về data URL ảnh kết quả. */
export async function tryOnOutfit(params: {
  personDataUrl: string;
  outfitDataUrl: string;
  background: TryOnBackground;
}): Promise<string> {
  let res: Response;
  try {
    res = await fetch("/api/try-on", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        personDataUrl: params.personDataUrl,
        outfitDataUrl: params.outfitDataUrl,
        background: params.background,
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
