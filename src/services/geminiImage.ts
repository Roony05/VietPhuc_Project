import { IMAGE_MODEL } from "../config";

export interface TryOnAccessoryParam {
  name: string;
  promptEn: string;
  dataUrl: string | null;
}

export interface TryOnParams {
  personDataUrl: string;
  outfitDataUrl: string;
  accessories: TryOnAccessoryParam[];
  garmentNameEn: string;
}

/**
 * Thử trang phục lên ảnh người dùng thông qua server-side endpoint /api/try-on.
 * Tránh lỗi "An API Key must be set when running in a browser" và bảo mật API key.
 */
export async function tryOnOutfit(params: {
  personDataUrl: string;
  outfitDataUrl: string;
  accessories: { name: string; promptEn: string; dataUrl: string | null }[];
  garmentNameEn: string;
}): Promise<string> {
  const startTime = Date.now();
  console.log(`[geminiImage client] Gửi yêu cầu try-on tới server với model: ${IMAGE_MODEL}...`);

  try {
    const res = await fetch("/api/try-on", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personDataUrl: params.personDataUrl,
        outfitDataUrl: params.outfitDataUrl,
        accessories: params.accessories,
        garmentNameEn: params.garmentNameEn,
        model: IMAGE_MODEL,
      }),
    });

    const elapsed = Date.now() - startTime;
    console.log(`[geminiImage client] Nhận phản hồi sau ${elapsed}ms, status: ${res.status}`);

    if (!res.ok) {
      let errorMsg = "Lỗi khi gọi máy chủ tạo ảnh";
      try {
        const errorData = await res.json();
        errorMsg = errorData.error || errorMsg;
      } catch {
        errorMsg = await res.text();
      }
      throw new Error(errorMsg);
    }

    const data = await res.json();
    if (!data.dataUrl) {
      throw new Error("AI không trả về ảnh. Hãy thử lại hoặc dùng ảnh khác.");
    }

    return data.dataUrl;
  } catch (error: any) {
    console.error("[geminiImage client] Lỗi:", error);
    if (error instanceof Error && error.message.includes("AI không trả về ảnh")) {
      throw error;
    }
    const errMsg = error?.message || "Đã xảy ra lỗi khi tạo ảnh bằng AI.";
    throw new Error(`Ghép ảnh không thành công: ${errMsg}`);
  }
}

/**
 * Chỉnh sửa ảnh hiện tại theo yêu cầu người dùng (instructionVi).
 * Giữ nguyên nhận dạng khuôn mặt, người và trang phục Việt, chỉ thêm/sửa phụ kiện hoặc bối cảnh.
 */
export async function editImage(
  currentDataUrl: string,
  instructionVi: string
): Promise<string> {
  const startTime = Date.now();
  console.log(`[editImage client] Gửi yêu cầu chỉnh sửa ảnh tới server: "${instructionVi}"...`);

  try {
    const res = await fetch("/api/edit-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        currentDataUrl,
        instructionVi,
        model: IMAGE_MODEL,
      }),
    });

    const elapsed = Date.now() - startTime;
    console.log(`[editImage client] Nhận phản hồi sau ${elapsed}ms, status: ${res.status}`);

    if (!res.ok) {
      let errorMsg = "Lỗi khi gọi máy chủ chỉnh sửa ảnh";
      try {
        const errorData = await res.json();
        errorMsg = errorData.error || errorMsg;
      } catch {
        errorMsg = await res.text();
      }
      throw new Error(errorMsg);
    }

    const data = await res.json();
    if (!data.dataUrl) {
      throw new Error("AI không trả về ảnh. Hãy thử lại hoặc dùng ảnh khác.");
    }

    return data.dataUrl;
  } catch (error: any) {
    console.error("[editImage client] Lỗi:", error);
    if (error instanceof Error && error.message.includes("AI không trả về ảnh")) {
      throw error;
    }
    const errMsg = error?.message || "Đã xảy ra lỗi khi chỉnh sửa ảnh bằng AI.";
    throw new Error(`Chỉnh sửa ảnh không thành công: ${errMsg}`);
  }
}

