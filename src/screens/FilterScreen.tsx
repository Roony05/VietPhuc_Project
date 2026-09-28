import React, { useState } from "react";
import { useApp } from "../state/AppContext";
import { AgeRange, ColorTag, EventTag, GarmentType, Gender, StyleTag } from "../types";
import {
  ageRangeLabels,
  colorLabels,
  eventLabels,
  garmentTypeLabels,
  genderLabels,
  styleLabels,
  filterSummary,
} from "../data/labels";
import { Button, Card, Chip, PageTitle } from "../components/ui";
import { StudentAvatar, avatarLabel } from "../components/StudentAvatar";
import { ArrowRight, ChevronDown } from "lucide-react";

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
  const { filters, setFilters, goTo } = useApp();

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

  const chooseGender = (g: Gender) => {
    setGender(g);
  };

  const submit = () => {
    if (!isValid) return;
    setFilters({ gender, event, garmentType: garment, styles, colors, ageRange, heightCm, weightKg });
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
    <div className="max-w-6xl mx-auto px-4 py-10 pb-28 lg:pb-10">
      <PageTitle
        eyebrow="Bước 1 / 3"
        title="Gu của bạn thế nào?"
        description="Chọn dịp mặc và giới tính là đủ để bắt đầu. Các mục còn lại giúp gợi ý sát hơn."
      />

      <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
        <div className="space-y-4">
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
                    className="w-4 h-4 rounded-full border border-black/10"
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
        </div>

        {/* Tóm tắt: dính bên phải trên màn rộng */}
        <aside className="hidden lg:block sticky top-24">
          <Card className="p-6">
            <h2 className="text-lg font-bold text-muc mb-4">Lựa chọn của bạn</h2>
            {(gender === "nam" || gender === "nu") && (
              <div className="flex items-center gap-3 mb-4 p-3 rounded-2xl bg-kem">
                <StudentAvatar gender={gender} age={ageRange} className="w-16 h-20 shrink-0" />
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
            {!isValid && <p className="text-xs text-son mb-3">Cần chọn Giới tính và Dịp mặc.</p>}
            <Button className="w-full" size="lg" disabled={!isValid} onClick={submit}>
              Xem gợi ý <ArrowRight className="w-5 h-5" />
            </Button>
          </Card>
        </aside>
      </div>

      {/* Nút dính dưới đáy trên điện thoại */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-kem/95 backdrop-blur border-t border-vien p-4">
        {!isValid && <p className="text-xs text-son text-center mb-2">Cần chọn Giới tính và Dịp mặc.</p>}
        <Button className="w-full" size="lg" disabled={!isValid} onClick={submit}>
          Xem gợi ý <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};
