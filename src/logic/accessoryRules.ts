import { AccessoryRule, EventTag, GarmentType, RuleLevel } from "../types";
import { accessoryRules } from "../data/rules";

/**
 * Tra cứu mức độ phù hợp và lý do phối phụ kiện theo loại trang phục và sự kiện.
 * - Lọc các rule có cùng garmentType và accessoryId.
 * - Rule có onlyForEvents: chỉ áp dụng khi event != null VÀ event nằm trong onlyForEvents.
 * - Nếu có nhiều rule thỏa mãn: ưu tiên "nen_tranh" -> "hop_truyen_thong" -> "remix_duoc".
 * - Không có rule nào: trả về "chua_co_du_lieu".
 */
export function getAccessoryLevel(
  garmentType: GarmentType,
  accessoryId: string,
  event: EventTag | null
): { level: RuleLevel; reason: string } {
  // Tìm các quy tắc ứng với trang phục và phụ kiện
  const matchingRules = accessoryRules.filter(
    (rule) =>
      rule.garmentType === garmentType && rule.accessoryId === accessoryId
  );

  if (matchingRules.length === 0) {
    return {
      level: "chua_co_du_lieu",
      reason: "Chưa có dữ liệu cho cách phối này.",
    };
  }

  // Lọc các rule hợp lệ theo ngữ cảnh sự kiện
  const applicableRules = matchingRules.filter((rule) => {
    if (!rule.onlyForEvents || rule.onlyForEvents.length === 0) {
      // Rule chung, luôn áp dụng
      return true;
    }
    // Rule có điều kiện sự kiện: chỉ dùng khi event khác null VÀ nằm trong onlyForEvents
    return event !== null && rule.onlyForEvents.includes(event);
  });

  if (applicableRules.length === 0) {
    // Không có rule nào khớp với sự kiện hiện tại
    return {
      level: "chua_co_du_lieu",
      reason: "Chưa có dữ liệu cho cách phối này trong dịp sự kiện được chọn.",
    };
  }

  // Thứ tự ưu tiên: nen_tranh > hop_truyen_thong > remix_duoc > chua_co_du_lieu
  const nenTranh = applicableRules.find((r) => r.level === "nen_tranh");
  if (nenTranh) {
    return {
      level: "nen_tranh",
      reason: nenTranh.reason,
    };
  }

  const hopTruyenThong = applicableRules.find((r) => r.level === "hop_truyen_thong");
  if (hopTruyenThong) {
    return {
      level: "hop_truyen_thong",
      reason: hopTruyenThong.reason,
    };
  }

  const remixDuoc = applicableRules.find((r) => r.level === "remix_duoc");
  if (remixDuoc) {
    return {
      level: "remix_duoc",
      reason: remixDuoc.reason,
    };
  }

  return {
    level: "chua_co_du_lieu",
    reason: "Chưa có dữ liệu cho cách phối này.",
  };
}
