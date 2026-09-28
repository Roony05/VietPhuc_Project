import { MAX_IMAGE_SIDE } from "../config";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

/**
 * Đọc file ảnh, kiểm tra định dạng và kích thước,
 * sau đó thu nhỏ cạnh dài về tối đa maxSide bằng Canvas và xuất JPEG chất lượng 0.9.
 */
export async function fileToCompressedDataUrl(
  file: File,
  maxSide: number = MAX_IMAGE_SIDE
): Promise<string> {
  // 1. Kiểm tra loại file
  if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
    throw new Error(
      "Định dạng ảnh không hợp lệ. Vui lòng chọn ảnh định dạng JPG, JPEG, PNG hoặc WEBP."
    );
  }

  // 2. Kiểm tra dung lượng file
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(
      "Dung lượng ảnh vượt quá giới hạn 10MB. Vui lòng chọn ảnh nhẹ hơn."
    );
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => {
      reject(new Error("Không thể đọc tệp ảnh vừa tải lên."));
    };

    reader.onload = () => {
      const dataUrl = reader.result as string;
      const img = new Image();

      img.onerror = () => {
        reject(new Error("Không thể phân tích dữ liệu hình ảnh."));
      };

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Tính tỉ lệ thu nhỏ nếu cạnh dài vượt quá maxSide
        if (width > maxSide || height > maxSide) {
          if (width > height) {
            height = Math.round((height * maxSide) / width);
            width = maxSide;
          } else {
            width = Math.round((width * maxSide) / height);
            height = maxSide;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Không thể khởi tạo bộ xử lý hình ảnh trên trình duyệt."));
          return;
        }

        // Vẽ ảnh lên canvas với kích thước tối ưu
        ctx.drawImage(img, 0, 0, width, height);

        // Xuất ra JPEG chất lượng 0.9
        const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.9);
        resolve(compressedDataUrl);
      };

      img.src = dataUrl;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Tải ảnh từ URL (ví dụ đường dẫn public/img) và chuyển đổi thành Data URL.
 */
export async function urlToDataUrl(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Mã phản hồi HTTP: ${response.status}`);
    }

    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => {
        reject(new Error("Không thể chuyển đổi dữ liệu ảnh từ URL."));
      };
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    throw new Error("Không tải được ảnh: " + url);
  }
}

/**
 * Tách dataUrl thành mimeType và phần chuỗi base64 thuần túy.
 */
export function dataUrlToInlineData(dataUrl: string): {
  mimeType: string;
  data: string;
} {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
  if (!match) {
    // Thử tách đơn giản nếu format khác một chút
    const parts = dataUrl.split(",");
    const mimeMatch = parts[0]?.match(/:(.*?);/);
    const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
    const data = parts[1] || "";
    return { mimeType, data };
  }

  return {
    mimeType: match[1],
    data: match[2],
  };
}

/**
 * Nén một data URL ảnh về cạnh dài tối đa maxSide, xuất JPEG.
 * Dùng khi lưu lookbook để không vượt giới hạn localStorage.
 */
export function compressDataUrl(
  dataUrl: string,
  maxSide: number,
  quality = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onerror = () => reject(new Error("Không thể đọc ảnh để nén."));
    img.onload = () => {
      const ratio = Math.min(1, maxSide / Math.max(img.width, img.height));
      const width = Math.round(img.width * ratio);
      const height = Math.round(img.height * ratio);

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Không thể khởi tạo bộ xử lý hình ảnh trên trình duyệt."));
        return;
      }
      // Nền trắng để ảnh PNG trong suốt không bị đen khi chuyển sang JPEG
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.src = dataUrl;
  });
}
