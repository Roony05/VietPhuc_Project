import { MAX_IMAGE_SIDE } from "../config";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

function readAsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Không đọc được tệp ảnh."));
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}

/**
 * Nén một data URL ảnh về cạnh dài tối đa maxSide, xuất JPEG.
 * Nền trắng để ảnh PNG trong suốt không bị đen khi chuyển sang JPEG.
 */
export function compressDataUrl(dataUrl: string, maxSide: number, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onerror = () => reject(new Error("Không thể phân tích dữ liệu hình ảnh."));
    img.onload = () => {
      const ratio = Math.min(1, maxSide / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * ratio);
      canvas.height = Math.round(img.height * ratio);
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Trình duyệt không hỗ trợ xử lý ảnh."));
        return;
      }
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.src = dataUrl;
  });
}

/** Ảnh người dùng tải lên: kiểm tra định dạng, dung lượng rồi nén về cạnh dài tối đa maxSide. */
export async function fileToCompressedDataUrl(file: File, maxSide: number = MAX_IMAGE_SIDE): Promise<string> {
  if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
    throw new Error("Định dạng ảnh không hợp lệ. Vui lòng chọn ảnh JPG, PNG hoặc WEBP.");
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error("Dung lượng ảnh vượt quá 10MB. Vui lòng chọn ảnh nhẹ hơn.");
  }
  return compressDataUrl(await readAsDataUrl(file), maxSide, 0.9);
}

/** Tải ảnh từ URL (ví dụ public/img) và chuyển thành data URL. */
export async function urlToDataUrl(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await readAsDataUrl(await response.blob());
  } catch {
    throw new Error("Không tải được ảnh: " + url);
  }
}
