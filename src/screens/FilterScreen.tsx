import React, { useEffect, useState } from "react";
import { filtersFromProfile, useApp } from "../state/AppContext";
import { AgeRange, ColorTag, EventTag, GarmentType, Gender, StyleTag, WearerProfile } from "../types";
import {
  ageRangeLabels,
  colorLabels,
  eventLabels,
  garmentTypeLabels,
  genderLabels,
  styleLabels,
  filterSummary,
} from "../data/labels";
import { FlowHeader } from "../components/Flow";
import { Button, Card, Chip, PageTitle } from "../components/ui";
import { FolkAvatar, avatarLabel } from "../components/FolkAvatar";
import { ArrowRight, Check, ChevronDown, CloudSun, Loader2, Save, UserRound } from "lucide-react";
import { getWeather, kindLabels, PLACES, todayISO, WeatherInfo } from "../logic/weather";

const GENDERS: Gender[] = ["nu", "nam"];
const EVENTS: EventTag[] = ["tet", "ky_yeu", "le_tot_nghiep", "khai_giang", "le_hoi", "di_chua", "dao_pho", "chup_anh", "dam_cuoi"];
const GARMENTS: GarmentType[] = ["ao_dai", "ao_dai_cach_tan", "ao_tu_than", "ao_ngu_than", "ao_ba_ba", "ao_tac"];
const STYLES: StyleTag[] = ["truyen_thong", "toi_gian", "gen_z", "sang_trong"];
const COLORS: ColorTag[] = ["do", "vang", "xanh_lam", "xanh_la", "hong_sen", "tim", "nau", "den", "trang", "be", "cam"];
const AGES: AgeRange[] = ["duoi_16", "16_18", "19_22", "23_30", "tren_30"];

const toggle = <T,>(list: T[], item: T) => (list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);

/** Một nhóm lựa chọn có tiêu đề */
const Group: React.FC<{ title: string; hint?: string; required?: boolean; children: React.ReactNode }> = ({
  title,
  hint,
  required,
  children,
}) => (
  <Card className="p-5 sm:p-6">
    <div className="flex items-baseline justify-between gap-3 mb-4">
      <h2 className="text-lg font-bold text-muc">
        {title} {required && <span className="text-son">*</span>}
      </h2>
      {hint && <span className="text-xs text-muc-nhat">{hint}</span>}
    </div>
    {children}
  </Card>
);

export const FilterScreen: React.FC = () => {
  const { filters, setFilters, goTo, account, profiles, activeProfile, setActiveProfileId, upsertProfile } = useApp();

  const [gender, setGender] = useState<Gender | null>(filters.gender);
  const [event, setEvent] = useState<EventTag | null>(filters.event);
  const [garment, setGarment] = useState<GarmentType | null>(filters.garmentType);
  const [styles, setStyles] = useState<StyleTag[]>(filters.styles);
  const [colors, setColors] = useState<ColorTag[]>(filters.colors);
  const [bodyOpen, setBodyOpen] = useState(Boolean(filters.ageRange || filters.heightCm || filters.weightKg));
  const [ageRange, setAgeRange] = useState<AgeRange | null>(filters.ageRange);
  const [heightCm, setHeightCm] = useState<number | null>(filters.heightCm);
  const [weightKg, setWeightKg] = useState<number | null>(filters.weightKg);

  const isValid = Boolean(gender && event);
  // ngày + nơi mặc (không bắt buộc) để gợi ý theo thời tiết
  const [wearDate, setWearDate] = useState<string | null>(filters.wearDate);
  const [placeId, setPlaceId] = useState<string | null>(filters.placeId);
  const [weather, setWeather] = useState<WeatherInfo | null>(filters.weather);
  const [weatherState, setWeatherState] = useState<"idle" | "loading" | "error">("idle");

  useEffect(() => {
    if (!wearDate || !placeId) {
      setWeather(null);
      return;
    }
    if (weather && weather.date === wearDate && weather.placeId === placeId) return;
    let alive = true;
    setWeatherState("loading");
    getWeather(placeId, wearDate)
      .then((w) => alive && (setWeather(w), setWeatherState("idle")))
      .catch(() => alive && (setWeather(null), setWeatherState("error")));
    return () => {
      alive = false;
    };
  }, [wearDate, placeId]);
  // null = đang nhập tay cho người khác (không gắn hồ sơ)
  const [wearerId, setWearerId] = useState<string | null>(activeProfile?.id ?? null);
  const [savedNote, setSavedNote] = useState(false);

  /** Chọn hồ sơ: điền sẵn giới tính, số đo, màu, phong cách của người đó */
  const pickProfile = (p: WearerProfile | null) => {
    setWearerId(p?.id ?? null);
    setSavedNote(false);
    if (!p) return;
    setActiveProfileId(p.id);
    const f = filtersFromProfile(p);
    setGender(f.gender ?? null);
    setAgeRange(f.ageRange ?? null);
    setHeightCm(f.heightCm ?? null);
    setWeightKg(f.weightKg ?? null);
    setStyles(f.styles ?? []);
    setColors(f.colors ?? []);
    setBodyOpen(Boolean(f.ageRange || f.heightCm || f.weightKg));
  };

  const wearer = profiles.find((p) => p.id === wearerId) ?? null;
  const saveToProfile = () => {
    if (!wearer) return;
    upsertProfile({ ...wearer, gender: gender === "nam" || gender === "nu" ? gender : null, ageRange, heightCm, weightKg, styles, colors });
    setSavedNote(true);
  };

  const chooseGender = (g: Gender) => {
    setGender(g);
  };

  const submit = () => {
    if (!isValid) return;
    setFilters({ gender, event, garmentType: garment, styles, colors, ageRange, heightCm, weightKg, wearDate, placeId, weather });
    goTo("recommend");
  };

  const summary = filterSummary({ gender, event, garmentType: garment, styles, colors });

  const numberInput = (value: number | null, set: (v: number | null) => void, placeholder: string) => (
    <input
      type="number"
      inputMode="numeric"
      value={value ?? ""}
      onChange={(e) => set(e.target.value ? Number(e.target.value) : null)}
      placeholder={placeholder}
      className="w-full px-4 py-2.5 rounded-xl border border-vien bg-kem focus:outline-none focus:border-son"
    />
  );

  return (
    <>
      <FlowHeader current={0} back={() => goTo("home")} next={{ label: "Xem gợi ý", onClick: submit, disabled: !isValid }} />
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-10">
      <PageTitle
        title="Gu của bạn thế nào?"
        description="Chọn dịp mặc và giới tính là đủ để bắt đầu. Các mục còn lại giúp gợi ý sát hơn."
      />

      <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
        <div className="space-y-4">
          {/* chọn đồ cho ai: hồ sơ đã lưu điền sẵn thông tin, "Người khác" thì nhập tay */}
          <Card className="p-5 sm:p-6">
            <div className="flex items-baseline justify-between gap-3 mb-4">
              <h2 className="text-lg font-bold text-muc">Chọn đồ cho ai?</h2>
              <button type="button" onClick={() => goTo("profile")} className="text-xs text-nghe hover:underline cursor-pointer">
                {account ? "Quản lý hồ sơ" : "Đăng nhập để lưu hồ sơ"}
              </button>
            </div>
            {account && profiles.length > 0 ? (
              <>
                <div className="flex flex-wrap gap-2">
                  {profiles.map((p) => (
                    <Chip key={p.id} selected={wearerId === p.id} onClick={() => pickProfile(p)}>
                      <UserRound className="w-4 h-4" /> {p.name}
                    </Chip>
                  ))}
                  <Chip selected={wearerId === null} onClick={() => pickProfile(null)}>
                    Người khác (nhập tay)
                  </Chip>
                </div>
                {wearer && (
                  <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-muc-nhat">
                    <span>Đã điền sẵn thông tin của {wearer.name}, bạn vẫn sửa được bên dưới.</span>
                    <button type="button" onClick={saveToProfile} className="inline-flex items-center gap-1 text-nghe hover:underline cursor-pointer">
                      {savedNote ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                      {savedNote ? "Đã lưu vào hồ sơ" : `Lưu thay đổi vào hồ sơ ${wearer.name}`}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-muc-nhat">
                Đang nhập cho bạn. {account ? "Tạo hồ sơ để lần sau khỏi nhập lại, hoặc chọn đồ giúp người khác." : "Đăng nhập để lưu thông tin cho lần sau."}
              </p>
            )}
          </Card>

          <Group title="Giới tính" required>
            <div className="flex flex-wrap gap-2">
              {GENDERS.map((g) => (
                <Chip key={g} selected={gender === g} onClick={() => chooseGender(g)}>
                  {genderLabels[g]}
                </Chip>
              ))}
            </div>
          </Group>

          <Group title="Bạn mặc đi đâu?" required>
            <div className="flex flex-wrap gap-2">
              {EVENTS.map((e) => (
                <Chip key={e} selected={event === e} onClick={() => setEvent(e)}>
                  {eventLabels[e]}
                </Chip>
              ))}
            </div>
          </Group>

          <Group title="Mặc ngày nào, ở đâu?" hint="Không bắt buộc · để gợi ý theo thời tiết">
            <div className="grid sm:grid-cols-2 gap-3">
              <label className="text-sm text-muc-nhat space-y-1.5">
                <span>Ngày mặc</span>
                <input
                  type="date"
                  min={todayISO()}
                  value={wearDate ?? ""}
                  onChange={(e) => setWearDate(e.target.value || null)}
                  className="w-full px-4 py-2.5 rounded-xl border border-vien bg-kem text-muc focus:outline-none focus:border-son"
                />
              </label>
              <label className="text-sm text-muc-nhat space-y-1.5">
                <span>Nơi mặc</span>
                <select
                  value={placeId ?? ""}
                  onChange={(e) => setPlaceId(e.target.value || null)}
                  className="w-full px-4 py-2.5 rounded-xl border border-vien bg-kem text-muc focus:outline-none focus:border-son"
                >
                  <option value="">Chọn tỉnh, thành</option>
                  {PLACES.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {weatherState === "loading" && (
              <p className="flex items-center gap-2 text-sm text-muc-nhat mt-3">
                <Loader2 className="w-4 h-4 animate-spin" /> Đang xem thời tiết…
              </p>
            )}
            {weatherState === "error" && (
              <p className="text-sm text-son mt-3">Chưa lấy được thời tiết (cần mạng). Bạn vẫn xem gợi ý bình thường được.</p>
            )}
            {weather && weatherState === "idle" && (
              <p className="flex items-center gap-2 text-sm text-muc mt-3">
                <CloudSun className="w-4 h-4 text-nghe shrink-0" />
                <span>
                  {weather.tMin}–{weather.tMax}°C · {kindLabels[weather.kind]} · khả năng mưa {weather.rainChance}%
                  <span className="text-xs text-muc-nhat ml-2">
                    {weather.source === "forecast" ? "Dự báo" : "Ước tính theo mùa (trung bình 3 năm trước)"}
                  </span>
                </span>
              </p>
            )}
          </Group>

          <Group title="Loại trang phục" hint="Chọn một, hoặc để app gợi ý">
            <div className="flex flex-wrap gap-2">
              <Chip selected={garment === null} onClick={() => setGarment(null)}>
                Để app gợi ý
              </Chip>
              {GARMENTS.map((g) => (
                <Chip key={g} selected={garment === g} onClick={() => setGarment(g)}>
                  {garmentTypeLabels[g]}
                </Chip>
              ))}
            </div>
          </Group>

          <Group title="Phong cách" hint="Chọn nhiều">
            <div className="flex flex-wrap gap-2">
              {STYLES.map((s) => (
                <Chip key={s} selected={styles.includes(s)} onClick={() => setStyles(toggle(styles, s))}>
                  {styleLabels[s]}
                </Chip>
              ))}
            </div>
          </Group>

          <Group title="Màu yêu thích" hint="Chọn nhiều">
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <Chip key={c} selected={colors.includes(c)} onClick={() => setColors(toggle(colors, c))}>
                  <span
                    className="w-4 h-4 rounded-full border border-white/30"
                    style={{ backgroundColor: colorLabels[c].hex }}
                  />
                  {colorLabels[c].label}
                </Chip>
              ))}
            </div>
          </Group>

          <Card className="p-5 sm:p-6">
            <button
              type="button"
              onClick={() => setBodyOpen(!bodyOpen)}
              className="w-full flex items-center justify-between cursor-pointer"
              aria-expanded={bodyOpen}
            >
              <h2 className="text-lg font-bold text-muc">Vóc dáng (không bắt buộc)</h2>
              <ChevronDown className={`w-5 h-5 text-muc-nhat transition-transform ${bodyOpen ? "rotate-180" : ""}`} />
            </button>
            {bodyOpen && (
              <div className="mt-4 space-y-4">
                <div className="grid sm:grid-cols-3 gap-3">
                  <label className="text-sm text-muc-nhat space-y-1.5">
                    <span>Độ tuổi</span>
                    <select
                      value={ageRange ?? ""}
                      onChange={(e) => setAgeRange((e.target.value || null) as AgeRange | null)}
                      className="w-full px-4 py-2.5 rounded-xl border border-vien bg-kem text-muc focus:outline-none focus:border-son"
                    >
                      <option value="">Không chọn</option>
                      {AGES.map((a) => (
                        <option key={a} value={a}>
                          {ageRangeLabels[a]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-sm text-muc-nhat space-y-1.5">
                    <span>Chiều cao (cm)</span>
                    {numberInput(heightCm, setHeightCm, "VD: 160")}
                  </label>
                  <label className="text-sm text-muc-nhat space-y-1.5">
                    <span>Cân nặng (kg)</span>
                    {numberInput(weightKg, setWeightKg, "VD: 50")}
                  </label>
                </div>
                <p className="text-xs text-muc-nhat">Chỉ dùng để gợi ý bằng chữ, không dùng để chỉnh ảnh của bạn.</p>
              </div>
            )}
          </Card>
          <div className="lg:hidden pt-2">
            {!isValid && <p className="text-xs text-son text-center mb-2">Cần chọn Giới tính và Dịp mặc.</p>}
            <Button className="w-full" size="lg" disabled={!isValid} onClick={submit}>
              Xem gợi ý <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Tóm tắt: dính bên phải trên màn rộng */}
        <aside className="hidden lg:block sticky top-24">
          <Card className="p-6">
            <h2 className="text-lg font-bold text-muc mb-4">Lựa chọn của bạn</h2>
            {(gender === "nam" || gender === "nu") && (
              <div className="flex items-center gap-3 mb-4 p-3 rounded-2xl bg-kem">
                <FolkAvatar gender={gender} age={ageRange} className="w-16 h-20 shrink-0" />
                <p className="text-sm text-muc-nhat">
                  Đây là bạn nè: <span className="font-semibold text-muc">{avatarLabel(gender, ageRange)}</span>
                  {!ageRange && <span className="block text-xs mt-0.5">Chọn độ tuổi ở mục Vóc dáng để đổi nhân vật</span>}
                </p>
              </div>
            )}
            {summary.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 mb-5">
                {summary.map((s) => (
                  <span key={s} className="px-3 py-1 rounded-full bg-kem border border-vien text-sm text-muc">
                    {s}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muc-nhat mb-5">Chưa chọn gì.</p>
            )}
            {weather && (
              <p className="flex items-center gap-2 text-sm text-muc-nhat mb-4">
                <CloudSun className="w-4 h-4 text-nghe" /> {PLACES.find((p) => p.id === weather.placeId)?.name}: {weather.tMin}–{weather.tMax}°C
              </p>
            )}
            {!isValid && <p className="text-xs text-son mb-3">Cần chọn Giới tính và Dịp mặc.</p>}
            <Button className="w-full" size="lg" disabled={!isValid} onClick={submit}>
              Xem gợi ý <ArrowRight className="w-5 h-5" />
            </Button>
          </Card>
        </aside>
      </div>

    </div>
    </>
  );
};
