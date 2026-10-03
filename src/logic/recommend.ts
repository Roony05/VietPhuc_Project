import { Outfit, UserFilters } from "../types";
import { colorLabels, eventLabels, styleLabels } from "../data/labels";
import { weatherAdvice } from "./weather";

export interface RecommendResult {
  outfit: Outfit;
  score: number;
  reasons: string[];
}

/**
 * Lọc và chấm điểm gợi ý tối đa 3 bộ đồ (code thuần, KHÔNG dùng AI).
 * A — loại bộ khác giới tính (giữ unisex) và khác loại trang phục (nếu có chọn).
 * B — chấm điểm: +3 đúng sự kiện, +2 mỗi phong cách trùng, +2 mỗi màu trùng,
 *     cộng/trừ theo thời tiết ngày mặc (kiểu áo ít/nhiều lớp, màu dễ bẩn khi mưa).
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

  const advice = filters.weather ? weatherAdvice(filters.weather) : null;

  const scored = candidates.map((outfit) => {
    let score = 0;
    const reasons: string[] = [];

    if (advice) {
      const w = advice.garmentScore[outfit.garmentType] ?? 0;
      score += w;
      if (w > 0) reasons.push(advice.garmentReason);
      if (outfit.colors.some((c) => advice.avoidColors.includes(c))) score -= 2;
    }

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
  const bestByFamily = new Map<string, RecommendResult>();
  for (const result of scored) {
    const previous = bestByFamily.get(result.outfit.familyId);
    if (!previous || result.score > previous.score) bestByFamily.set(result.outfit.familyId, result);
  }
  return [...bestByFamily.values()].sort((a, b) => b.score - a.score).slice(0, 3);
}
