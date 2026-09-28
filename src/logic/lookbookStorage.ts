import { LookbookItem } from "../types";
import { MAX_LOOKBOOK_ITEMS } from "../config";
import { compressDataUrl } from "./imageUtils";

const STORAGE_KEY = "vietphuc_lookbook";

/** Đọc lookbook từ localStorage. Lỗi hoặc chưa có dữ liệu thì trả []. */
export function loadLookbook(): LookbookItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLookbook(items: LookbookItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (err: any) {
    if (err?.name === "QuotaExceededError") {
      throw new Error("Bộ nhớ trình duyệt đã đầy. Hãy xóa bớt bộ phối trong lookbook.");
    }
    throw new Error("Không lưu được lookbook trên trình duyệt này.");
  }
}

/** Lưu một bộ phối (ảnh được nén về 768px JPEG 0.8). Ném Error tiếng Việt nếu không lưu được. */
export async function saveLookbookItem(item: LookbookItem): Promise<void> {
  const items = loadLookbook();
  if (items.length >= MAX_LOOKBOOK_ITEMS) {
    throw new Error("Lookbook đã đầy, hãy xóa bớt");
  }
  const imageDataUrl = await compressDataUrl(item.imageDataUrl, 768, 0.8);
  writeLookbook([...items, { ...item, imageDataUrl }]);
}

export function deleteLookbookItem(id: string): void {
  writeLookbook(loadLookbook().filter((item) => item.id !== id));
}
