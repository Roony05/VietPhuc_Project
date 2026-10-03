/**
 * Luật phối phụ kiện (code thường, không dùng AI).
 * Gợi ý lấy từ BỘ PHỐI CHUẨN do nhóm đặt sẵn (src/data/accessoryPresets.ts);
 * phần này chỉ lọc bớt món không hợp dịp và liệt kê món không nên phối thêm.
 */
import { accessories, Accessory } from "../data/accessories";
import { ACCESSORY_PRESETS, FamilyKey } from "../data/accessoryPresets";
import { eventLabels, garmentTypeLabels } from "../data/labels";
import { ColorTag, EventTag, GarmentType } from "../types";

export interface AccessoryInput {
  garmentType: GarmentType;
  gender: "nam" | "nu" | null;
  event: EventTag | null;
}

export interface AccessoryPick {
  id: string;
  reason: string;
  color?: ColorTag; // màu cố định của bộ phối (nếu nhóm có đặt)
}

export interface AccessoryAdvice {
  note: string;           // câu giải thích chung cho cả bộ
  picks: AccessoryPick[]; // bộ phối chuẩn (đã bỏ món không hợp dịp)
  avoid: AccessoryPick[]; // không nên phối thêm
}

const fitsGender = (a: Accessory, gender: AccessoryInput["gender"]) => !gender || a.genders.includes(gender);

/** Những món không nên phối thêm với bộ này, kèm lý do */
export function accessoriesToAvoid(input: AccessoryInput, limit = 4): AccessoryPick[] {
  const garment = garmentTypeLabels[input.garmentType].toLowerCase();
  const out: AccessoryPick[] = [];
  for (const a of accessories) {
    if (!fitsGender(a, input.gender)) continue;
    if (!a.garmentTypes.includes(input.garmentType) && a.avoidNote) {
      out.push({ id: a.id, reason: a.avoidNote });
    } else if (input.event && a.avoidEvents?.includes(input.event)) {
      out.push({ id: a.id, reason: `${a.name} hợp với ${garment} nhưng ít hợp dịp ${eventLabels[input.event].toLowerCase()}, nên để dành cho dịp khác.` });
    }
  }
  return out.slice(0, limit);
}

/** Bộ phối chuẩn cho bộ đồ đang thử */
export function presetAdvice(input: AccessoryInput): AccessoryAdvice {
  const gender = input.gender ?? "nu";
  const preset = ACCESSORY_PRESETS[`${input.garmentType}-${gender}` as FamilyKey];
  const picks = (preset?.items ?? [])
    .map((id) => accessories.find((a) => a.id === id))
    .filter((a): a is Accessory => Boolean(a))
    .filter((a) => !input.event || !a.avoidEvents?.includes(input.event))
    .map((a) => ({ id: a.id, reason: a.note, color: preset?.colors?.[a.id] }));
  return {
    note: preset?.note ?? "Bộ này đẹp nhất khi để tối giản.",
    picks,
    avoid: accessoriesToAvoid(input),
  };
}
