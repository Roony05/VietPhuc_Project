/**
 * Thời tiết ngày mặc để gợi ý trang phục (Open-Meteo, miễn phí, không cần key, gọi thẳng từ trình duyệt).
 * - Trong 16 ngày tới: dự báo thật.
 * - Xa hơn: ước tính theo mùa = trung bình cùng thời điểm (±3 ngày) của 3 năm trước, ghi rõ không phải dự báo.
 */
import { ColorTag, GarmentType } from "../types";

export interface Place {
  id: string;
  name: string;
  lat: number;
  lon: number;
}

export const PLACES: Place[] = [
  { id: "ha-noi", name: "Hà Nội", lat: 21.03, lon: 105.85 },
  { id: "hai-phong", name: "Hải Phòng", lat: 20.86, lon: 106.68 },
  { id: "sa-pa", name: "Sa Pa", lat: 22.34, lon: 103.84 },
  { id: "hue", name: "Huế", lat: 16.46, lon: 107.59 },
  { id: "da-nang", name: "Đà Nẵng", lat: 16.05, lon: 108.2 },
  { id: "hoi-an", name: "Hội An", lat: 15.88, lon: 108.33 },
  { id: "nha-trang", name: "Nha Trang", lat: 12.24, lon: 109.19 },
  { id: "da-lat", name: "Đà Lạt", lat: 11.94, lon: 108.44 },
  { id: "tp-hcm", name: "TP. Hồ Chí Minh", lat: 10.78, lon: 106.7 },
  { id: "can-tho", name: "Cần Thơ", lat: 10.03, lon: 105.78 },
];

export type WeatherKind = "nong" | "am" | "mat" | "lanh";

export interface WeatherInfo {
  placeId: string;
  date: string; // yyyy-mm-dd
  source: "forecast" | "seasonal";
  tMax: number;
  tMin: number;
  rainChance: number; // 0–100
  kind: WeatherKind;
  rainy: boolean;
}

export const kindLabels: Record<WeatherKind, string> = {
  nong: "Nắng nóng",
  am: "Ấm",
  mat: "Mát mẻ",
  lanh: "Lạnh",
};

const FORECAST_DAYS = 15;
const DAILY = "temperature_2m_max,temperature_2m_min";

/** Ngày hôm nay theo giờ Việt Nam, dạng yyyy-mm-dd */
export function todayISO(): string {
  return new Date(Date.now() + 7 * 3600_000).toISOString().slice(0, 10);
}

function shiftDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

const avg = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / Math.max(xs.length, 1);

function classify(tMax: number): WeatherKind {
  if (tMax >= 33) return "nong";
  if (tMax >= 26) return "am";
  if (tMax >= 19) return "mat";
  return "lanh";
}

async function getJson(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function getWeather(placeId: string, date: string): Promise<WeatherInfo> {
  const place = PLACES.find((p) => p.id === placeId);
  if (!place) throw new Error("Chưa chọn nơi mặc.");
  const days = Math.round((Date.parse(date) - Date.parse(todayISO())) / 86_400_000);
  const base = `latitude=${place.lat}&longitude=${place.lon}&timezone=Asia%2FBangkok`;

  let tMax: number;
  let tMin: number;
  let rainChance: number;
  let source: WeatherInfo["source"];

  if (days >= 0 && days <= FORECAST_DAYS) {
    const data = await getJson(
      `https://api.open-meteo.com/v1/forecast?${base}&daily=${DAILY},precipitation_probability_max&start_date=${date}&end_date=${date}`
    );
    tMax = data.daily.temperature_2m_max[0];
    tMin = data.daily.temperature_2m_min[0];
    rainChance = data.daily.precipitation_probability_max[0] ?? 0;
    source = "forecast";
  } else {
    // cùng ngày đó của 3 năm trước, lấy ±3 ngày cho bớt ngẫu nhiên
    const years = [1, 2, 3].map((y) => {
      const d = new Date(`${date}T00:00:00Z`);
      d.setUTCFullYear(Number(todayISO().slice(0, 4)) - y);
      return d.toISOString().slice(0, 10);
    });
    const series = await Promise.all(
      years.map((d) =>
        getJson(
          `https://archive-api.open-meteo.com/v1/archive?${base}&daily=${DAILY},precipitation_sum&start_date=${shiftDays(d, -3)}&end_date=${shiftDays(d, 3)}`
        )
      )
    );
    const maxes = series.flatMap((s) => s.daily.temperature_2m_max).filter((v: unknown) => typeof v === "number");
    const mins = series.flatMap((s) => s.daily.temperature_2m_min).filter((v: unknown) => typeof v === "number");
    const rain = series.flatMap((s) => s.daily.precipitation_sum).filter((v: unknown) => typeof v === "number");
    if (!maxes.length) throw new Error("Không có dữ liệu khí hậu cho ngày này.");
    tMax = avg(maxes);
    tMin = avg(mins);
    rainChance = (rain.filter((r: number) => r >= 1).length / Math.max(rain.length, 1)) * 100;
    source = "seasonal";
  }

  return {
    placeId,
    date,
    source,
    tMax: Math.round(tMax),
    tMin: Math.round(tMin),
    rainChance: Math.round(rainChance),
    kind: classify(tMax),
    rainy: rainChance >= 55,
  };
}

/**
 * Thời tiết ảnh hưởng gợi ý thế nào (gợi ý thực dụng, không phải quy tắc văn hóa):
 * - garmentScore: cộng/trừ điểm theo độ dày, số lớp của từng kiểu áo
 * - avoidColors: màu dễ lộ vết bẩn, ướt khi mưa
 */
export interface WeatherAdvice {
  headline: string;
  tips: string[];
  garmentScore: Partial<Record<GarmentType, number>>;
  garmentReason: string;
  avoidColors: ColorTag[];
}

export function weatherAdvice(w: WeatherInfo): WeatherAdvice {
  const place = PLACES.find((p) => p.id === w.placeId)?.name ?? "";
  const headline = `${place}: ${w.tMin}–${w.tMax}°C, ${kindLabels[w.kind].toLowerCase()}${w.rainy ? ", dễ có mưa" : ""}`;
  const tips: string[] = [];
  let garmentScore: WeatherAdvice["garmentScore"] = {};
  let garmentReason = "";

  if (w.kind === "nong") {
    garmentScore = { ao_ba_ba: 2, ao_dai_cach_tan: 1, ao_dai: 0, ao_tu_than: -1, ao_ngu_than: -1, ao_tac: -2 };
    garmentReason = "Ít lớp, dễ mặc khi trời nóng";
    tips.push("Chọn kiểu áo ít lớp, vải mỏng như áo bà ba, áo dài cách tân; áo tấc nhiều lớp dễ bị nóng.");
    tips.push("Mang nón lá hoặc quạt: vừa che nắng vừa làm đạo cụ chụp ảnh.");
    tips.push("Chụp ngoài trời nên chọn sáng sớm hoặc chiều muộn để da không bị cháy sáng.");
  } else if (w.kind === "am") {
    garmentScore = { ao_dai: 1, ao_dai_cach_tan: 1, ao_ba_ba: 1 };
    garmentReason = "Hợp thời tiết ấm áp";
    tips.push("Thời tiết dễ chịu, hầu hết kiểu áo đều mặc được; áo nhiều lớp nên chụp trong nhà hoặc lúc chiều mát.");
  } else if (w.kind === "mat") {
    garmentScore = { ao_dai: 1, ao_ngu_than: 1, ao_tac: 1, ao_tu_than: 1 };
    garmentReason = "Hợp trời mát, mặc nhiều lớp vẫn thoải mái";
    tips.push("Trời mát là lúc đẹp nhất để mặc áo ngũ thân, áo tấc nhiều lớp mà không bị nóng.");
  } else {
    garmentScore = { ao_ngu_than: 2, ao_tac: 2, ao_dai: 1, ao_ba_ba: -2, ao_dai_cach_tan: -1 };
    garmentReason = "Nhiều lớp, giữ ấm tốt khi trời lạnh";
    tips.push("Chọn áo ngũ thân, áo tấc có thể mặc thêm áo giữ nhiệt mỏng bên trong mà không lộ.");
    tips.push("Khăn đóng, khăn vấn vừa hợp lễ phục vừa giữ ấm đầu.");
  }

  const avoidColors: ColorTag[] = w.rainy ? ["trang", "be"] : [];
  if (w.rainy) {
    tips.push("Có khả năng mưa: tránh áo trắng, be vì dễ lộ vết ướt và bùn; xắn gọn tà áo khi di chuyển.");
    tips.push("Ô giấy chỉ để làm đạo cụ chụp ảnh, mưa thật nên mang thêm ô thường hoặc áo mưa.");
  }
  if (w.source === "seasonal") {
    tips.push("Ngày mặc còn xa nên đây là ước tính theo mùa (trung bình 3 năm trước), hãy xem lại dự báo khi gần ngày.");
  }
  return { headline, tips, garmentScore, garmentReason, avoidColors };
}
