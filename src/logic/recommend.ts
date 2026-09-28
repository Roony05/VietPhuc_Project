import { Outfit, UserFilters } from "../types";
import { colorLabels, eventLabels, styleLabels } from "../data/labels";

export interface RecommendResult {
  outfit: Outfit;
  score: number;
  reasons: string[];
}

/**
 * Lọc và chấm điểm gợi ý tối đa 3 bộ đồ (code thuần, KHÔNG dùng AI).
 * A — loại bộ khác giới tính (giữ unisex) và khác loại trang phục (nếu có chọn).
 * B — chấm điểm: +3 đúng sự kiện, +2 mỗi phong cách trùng, +2 mỗi màu trùng.
 * C — sắp xếp giảm dần, lấy tối đa 3; không bịa thêm cho đủ.
 */
export function recommendOutfits(filters: UserFilters, outfits: Outfit[]): RecommendResult[] {
  const candidates = outfits.filter((outfit) => {
    if (filters.gender && outfit.gender !== "unisex" && outfit.gender !== filters.gender) {
      return false;
    }
    if (filters.garmentType && outfit.garmentType !== filters.garmentType) {
      return false;
    }
    return true;
  });

  const scored = candidates.map((outfit) => {
    let score = 0;
    const reasons: string[] = [];

    if (filters.event && outfit.events.includes(filters.event)) {
      score += 3;
      reasons.push(`Hợp dịp ${eventLabels[filters.event]}`);
    }

    filters.styles.forEach((style) => {
      if (outfit.styles.includes(style)) {
        score += 2;
        reasons.push(`Đúng phong cách ${styleLabels[style]}`);
      }
    });

    filters.colors.forEach((color) => {
      if (outfit.colors.includes(color)) {
        score += 2;
        reasons.push(`Có màu ${colorLabels[color].label}`);
      }
    });

    return { outfit, score, reasons };
  });

  // sort ổn định: cùng điểm thì giữ thứ tự trong catalog
  return scored.sort((a, b) => b.score - a.score).slice(0, 3);
}
