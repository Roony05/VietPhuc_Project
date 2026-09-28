import { GarmentType } from "./types";

export const MAX_GENERATIONS_PER_SESSION = 10;
export const MAX_IMAGE_SIDE = 1024; // nén ảnh về cạnh dài tối đa 1024px trước khi gửi đi ghép
export const MAX_LOOKBOOK_ITEMS = 6;

// Loại vùng thay đồ khi ghép bằng OOTDiffusion. Việt phục đều là đồ dài toàn thân nên dùng "Dress".
export const OOTD_CATEGORY: Record<GarmentType, "Upper-body" | "Lower-body" | "Dress"> = {
  ao_dai: "Dress",
  ao_dai_cach_tan: "Dress",
  ao_tu_than: "Dress",
  ao_ngu_than: "Dress",
  ao_ba_ba: "Dress",
  ao_tac: "Dress",
};
