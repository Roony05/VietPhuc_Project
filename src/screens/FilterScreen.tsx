import React, { useState } from "react";
import { useApp } from "../state/AppContext";
import {
  Gender,
  GarmentType,
  EventTag,
  StyleTag,
  ColorTag,
  AgeRange,
} from "../types";
import {
  genderLabels,
  garmentTypeLabels,
  eventLabels,
  styleLabels,
  colorLabels,
  ageRangeLabels,
} from "../data/labels";
import { accessories } from "../data/accessories";
import { ImageWithFallback } from "../components/ImageWithFallback";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  Sliders,
  Sparkles,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

export const FilterScreen: React.FC = () => {
  const { filters, setFilters, setSelectedAccessoryIds, goTo } = useApp();

  // Khởi tạo state từ filters có sẵn trong context
  const [selectedGender, setSelectedGender] = useState<Gender | null>(filters.gender);
  const [selectedEvent, setSelectedEvent] = useState<EventTag | null>(filters.event);
  const [selectedGarment, setSelectedGarment] = useState<GarmentType | null>(filters.garmentType);
  const [selectedStyles, setSelectedStyles] = useState<StyleTag[]>(filters.styles || []);
  const [selectedColors, setSelectedColors] = useState<ColorTag[]>(filters.colors || []);
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>(filters.accessoryIds || []);

  // Khối thu gọn vóc dáng
  const [isBodyInfoOpen, setIsBodyInfoOpen] = useState<boolean>(
    Boolean(filters.ageRange || filters.heightCm || filters.weightKg)
  );
  const [ageRange, setAgeRange] = useState<AgeRange | null>(filters.ageRange);
  const [heightCm, setHeightCm] = useState<number | null>(filters.heightCm);
  const [weightKg, setWeightKg] = useState<number | null>(filters.weightKg);

  // Đổi giới tính -> cập nhật và dọn các phụ kiện không còn phù hợp
  const handleGenderSelect = (gender: Gender) => {
    setSelectedGender(gender);
    // Lọc lại các phụ kiện đã chọn nếu nó chỉ dành riêng cho giới tính khác
    setSelectedAccessories((prev) =>
      prev.filter((id) => {
        const item = accessories.find((a) => a.id === id);
        if (!item) return false;
        return item.gender === "unisex" || item.gender === gender;
      })
    );
  };

  // Toggle phong cách (chọn nhiều)
  const toggleStyle = (style: StyleTag) => {
    setSelectedStyles((prev) =>
      prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style]
    );
  };

  // Toggle màu sắc (chọn nhiều)
  const toggleColor = (color: ColorTag) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  // Toggle phụ kiện (chọn nhiều)
  const toggleAccessory = (id: string) => {
    setSelectedAccessories((prev) =>
      prev.includes(id) ? prev.filter((accId) => accId !== id) : [...prev, id]
    );
  };

  // Danh sách phụ kiện hiển thị theo giới tính đã chọn
  // Nếu chưa chọn giới tính, tạm thời hiển thị toàn bộ hoặc hiển thị unisex kèm nhắc chọn giới tính
  const visibleAccessories = accessories.filter((acc) => {
    if (!selectedGender) return true;
    return acc.gender === "unisex" || acc.gender === selectedGender;
  });

  // Kiểm tra điều kiện bắt buộc
  const isValid = Boolean(selectedGender && selectedEvent);

  const handleSubmit = () => {
    if (!isValid) return;

    // Lưu toàn bộ vào context filters
    setFilters({
      gender: selectedGender,
      event: selectedEvent,
      garmentType: selectedGarment,
      styles: selectedStyles,
      colors: selectedColors,
      accessoryIds: selectedAccessories,
      ageRange,
      heightCm,
      weightKg,
    });

    // Gán selectedAccessoryIds = filters.accessoryIds
    setSelectedAccessoryIds(selectedAccessories);

    // Chuyển màn hình recommend
    goTo("recommend");
  };

  const availableGenders: Gender[] = ["nam", "nu"];
  const availableEvents: EventTag[] = [
    "tet",
    "ky_yeu",
    "le_tot_nghiep",
    "khai_giang",
    "le_hoi",
    "di_chua",
    "dao_pho",
    "chup_anh",
    "dam_cuoi",
  ];
  const availableGarments: GarmentType[] = [
    "ao_dai",
    "ao_dai_cach_tan",
    "ao_tu_than",
    "ao_ngu_than",
    "ao_ba_ba",
    "ao_tac",
  ];
  const availableStyles: StyleTag[] = [
    "truyen_thong",
    "toi_gian",
    "gen_z",
    "sang_trong",
  ];
  const availableColors: ColorTag[] = [
    "trang",
    "do",
    "vang",
    "xanh_lam",
    "xanh_la",
    "hong",
    "tim",
    "nau",
    "den",
    "be",
  ];
  const availableAges: AgeRange[] = [
    "duoi_16",
    "16_18",
    "19_22",
    "23_30",
    "tren_30",
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-10">
      {/* Header thanh điều hướng & giới thiệu */}
      <div className="mb-8">
        <button
          onClick={() => goTo("home")}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-800 mb-3 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Về trang chủ</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 text-[#991B1B] flex items-center justify-center shrink-0 shadow-xs">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 font-serif">
              Bộ lọc &amp; Gợi ý phối đồ
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
              Cung cấp các tiêu chí mong muốn để hệ thống đề xuất tối đa 3 bộ cổ phục chuẩn vibe nhất
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* NHÓM 1: GIỚI TÍNH (BẮT BUỘC) */}
        <section className="bg-[#FFFDF9] border border-[#E7DECD] rounded-2xl p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-red-100 text-[#991B1B] text-xs font-bold flex items-center justify-center">
                1
              </span>
              <h2 className="text-base font-bold text-stone-900 font-serif">
                Giới tính
              </h2>
              <span className="text-xs font-medium text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                Bắt buộc
              </span>
            </div>
            {!selectedGender && (
              <span className="text-xs text-amber-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Chưa chọn
              </span>
            )}
          </div>
          <p className="text-xs text-stone-500 mb-4">
            Chọn giới tính để định hình kiểu dáng trang phục và phụ kiện phù hợp:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {availableGenders.map((g) => {
              const isSelected = selectedGender === g;
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => handleGenderSelect(g)}
                  className={`flex items-center justify-center gap-2.5 px-6 py-3 rounded-full text-sm font-semibold transition-all cursor-pointer border ${
                    isSelected
                      ? "bg-[#991B1B] text-white border-[#991B1B] shadow-sm ring-2 ring-red-200"
                      : "bg-white text-stone-700 border-stone-200 hover:border-stone-300 hover:bg-stone-50"
                  }`}
                >
                  {isSelected && <Check className="w-4 h-4 stroke-[2.5]" />}
                  <span>{genderLabels[g]}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* NHÓM 2: SỰ KIỆN (BẮT BUỘC) */}
        <section className="bg-[#FFFDF9] border border-[#E7DECD] rounded-2xl p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-red-100 text-[#991B1B] text-xs font-bold flex items-center justify-center">
                2
              </span>
              <h2 className="text-base font-bold text-stone-900 font-serif">
                Sự kiện tham dự
              </h2>
              <span className="text-xs font-medium text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                Bắt buộc
              </span>
            </div>
            {!selectedEvent && (
              <span className="text-xs text-amber-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Chưa chọn
              </span>
            )}
          </div>
          <p className="text-xs text-stone-500 mb-4">
            Mỗi sự kiện có tính chất nghi lễ hoặc sự thoải mái riêng để phối trang phục đúng bối cảnh:
          </p>

          <div className="flex flex-wrap gap-2.5">
            {availableEvents.map((evt) => {
              const isSelected = selectedEvent === evt;
              return (
                <button
                  key={evt}
                  type="button"
                  onClick={() => setSelectedEvent(evt)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer border ${
                    isSelected
                      ? "bg-[#991B1B] text-white border-[#991B1B] shadow-xs"
                      : "bg-white text-stone-700 border-stone-200 hover:border-stone-300 hover:bg-stone-50"
                  }`}
                >
                  {eventLabels[evt]}
                </button>
              );
            })}
          </div>
        </section>

        {/* NHÓM 3: LOẠI TRANG PHỤC (KHÔNG BẮT BUỘC) */}
        <section className="bg-[#FFFDF9] border border-[#E7DECD] rounded-2xl p-5 sm:p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-3.5">
            <span className="w-6 h-6 rounded-full bg-stone-100 text-stone-700 text-xs font-bold flex items-center justify-center">
              3
            </span>
            <h2 className="text-base font-bold text-stone-900 font-serif">
              Loại trang phục
            </h2>
            <span className="text-xs text-stone-400">Tùy chọn</span>
          </div>
          <p className="text-xs text-stone-500 mb-4">
            Bạn có thể chọn dáng trang phục mong muốn hoặc để hệ thống tự do đề xuất:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            <button
              type="button"
              onClick={() => setSelectedGarment(null)}
              className={`p-3 rounded-xl text-xs sm:text-sm font-medium text-left border transition-all cursor-pointer ${
                selectedGarment === null
                  ? "bg-[#991B1B] text-white border-[#991B1B] shadow-xs"
                  : "bg-white text-stone-700 border-stone-200 hover:border-stone-300 hover:bg-stone-50"
              }`}
            >
              <div className="font-semibold">Để app gợi ý</div>
              <div
                className={`text-[11px] mt-0.5 ${
                  selectedGarment === null ? "text-red-100" : "text-stone-400"
                }`}
              >
                Tối ưu theo tiêu chí
              </div>
            </button>

            {availableGarments.map((g) => {
              const isSelected = selectedGarment === g;
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => setSelectedGarment(g)}
                  className={`p-3 rounded-xl text-xs sm:text-sm font-medium text-left border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#991B1B] text-white border-[#991B1B] shadow-xs"
                      : "bg-white text-stone-700 border-stone-200 hover:border-stone-300 hover:bg-stone-50"
                  }`}
                >
                  <div className="font-semibold">{garmentTypeLabels[g]}</div>
                  <div
                    className={`text-[11px] mt-0.5 ${
                      isSelected ? "text-red-100" : "text-stone-400"
                    }`}
                  >
                    Cổ phục Việt
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* NHÓM 4: PHONG CÁCH (CHỌN NHIỀU) */}
        <section className="bg-[#FFFDF9] border border-[#E7DECD] rounded-2xl p-5 sm:p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-3.5">
            <span className="w-6 h-6 rounded-full bg-stone-100 text-stone-700 text-xs font-bold flex items-center justify-center">
              4
            </span>
            <h2 className="text-base font-bold text-stone-900 font-serif">
              Phong cách
            </h2>
            <span className="text-xs text-stone-400">Chọn nhiều</span>
          </div>
          <p className="text-xs text-stone-500 mb-4">
            Định hướng phong thái bạn hướng tới (có thể chọn kết hợp nhiều phong cách):
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {availableStyles.map((style) => {
              const isSelected = selectedStyles.includes(style);
              return (
                <button
                  key={style}
                  type="button"
                  onClick={() => toggleStyle(style)}
                  className={`flex items-center justify-between p-3 rounded-xl text-xs sm:text-sm font-medium border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-amber-50 text-amber-950 border-amber-400 shadow-xs"
                      : "bg-white text-stone-700 border-stone-200 hover:border-stone-300 hover:bg-stone-50"
                  }`}
                >
                  <span>{styleLabels[style]}</span>
                  <div
                    className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                      isSelected
                        ? "bg-amber-700 border-amber-700 text-white"
                        : "border-stone-300 bg-white"
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* NHÓM 5: MÀU YÊU THÍCH (CHỌN NHIỀU, Ô TRÒN HEX + TÊN) */}
        <section className="bg-[#FFFDF9] border border-[#E7DECD] rounded-2xl p-5 sm:p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-3.5">
            <span className="w-6 h-6 rounded-full bg-stone-100 text-stone-700 text-xs font-bold flex items-center justify-center">
              5
            </span>
            <h2 className="text-base font-bold text-stone-900 font-serif">
              Màu yêu thích
            </h2>
            <span className="text-xs text-stone-400">Chọn nhiều</span>
          </div>
          <p className="text-xs text-stone-500 mb-4">
            Lựa chọn những gam màu bạn muốn xuất hiện chủ đạo trên trang phục:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {availableColors.map((c) => {
              const isSelected = selectedColors.includes(c);
              const info = colorLabels[c];
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleColor(c)}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? "bg-stone-100 border-stone-400 ring-2 ring-stone-300 shadow-xs"
                      : "bg-white border-stone-200 hover:border-stone-300 hover:bg-stone-50"
                  }`}
                >
                  <span
                    className="w-6 h-6 rounded-full shrink-0 shadow-inner flex items-center justify-center"
                    style={{
                      backgroundColor: info.hex,
                      border: info.border ? `1px solid ${info.border}` : "1px solid rgba(0,0,0,0.12)",
                    }}
                  >
                    {isSelected && (
                      <Check
                        className={`w-3.5 h-3.5 stroke-[3] ${
                          c === "trang" || c === "be" || c === "vang"
                            ? "text-stone-800"
                            : "text-white"
                        }`}
                      />
                    )}
                  </span>
                  <span className="text-xs font-medium text-stone-800 truncate">
                    {info.label}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* NHÓM 6: PHỤ KIỆN MUỐN DÙNG */}
        <section className="bg-[#FFFDF9] border border-[#E7DECD] rounded-2xl p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-stone-100 text-stone-700 text-xs font-bold flex items-center justify-center">
                6
              </span>
              <h2 className="text-base font-bold text-stone-900 font-serif">
                Phụ kiện muốn dùng
              </h2>
              <span className="text-xs text-stone-400">Chọn nhiều</span>
            </div>
            {selectedGender && (
              <span className="text-xs text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md">
                Phù hợp cho: {genderLabels[selectedGender]} &amp; Unisex
              </span>
            )}
          </div>
          <p className="text-xs text-stone-500 mb-4">
            Chọn các món phụ kiện bạn dự định phối cùng. Chỉ hiển thị phụ kiện theo giới tính đã chọn:
          </p>

          {!selectedGender && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-xs text-amber-800">
              <HelpCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>
                Vui lòng chọn <strong>Giới tính</strong> ở bước 1 để hiển thị danh sách phụ kiện chính xác nhất.
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {visibleAccessories.map((acc) => {
              const isSelected = selectedAccessories.includes(acc.id);
              return (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => toggleAccessory(acc.id)}
                  className={`flex flex-col p-2.5 rounded-xl border text-left transition-all cursor-pointer relative ${
                    isSelected
                      ? "bg-red-50/60 border-[#991B1B] ring-2 ring-red-200 shadow-xs"
                      : "bg-white border-stone-200 hover:border-stone-300 hover:bg-stone-50"
                  }`}
                >
                  <div className="w-full aspect-square rounded-lg overflow-hidden bg-stone-100 mb-2 relative">
                    <ImageWithFallback
                      src={acc.image}
                      alt={acc.name}
                      fallbackTitle={acc.name}
                      className="w-full h-full object-contain p-2"
                    />
                    <div
                      className={`absolute top-1.5 right-1.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors shadow-xs ${
                        isSelected
                          ? "bg-[#991B1B] border-[#991B1B] text-white"
                          : "border-stone-300 bg-white/90 text-transparent"
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  </div>
                  <div className="text-xs font-semibold text-stone-800 truncate">
                    {acc.name}
                  </div>
                  <div className="text-[10px] text-stone-400 mt-0.5">
                    {acc.gender === "unisex" ? "Unisex" : genderLabels[acc.gender]}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* NHÓM 7: KHỐI THU GỌN - THÔNG TIN VÓC DÁNG (KHÔNG BẮT BUỘC) */}
        <section className="bg-[#FFFDF9] border border-[#E7DECD] rounded-2xl p-5 sm:p-6 shadow-xs transition-all">
          <button
            type="button"
            onClick={() => setIsBodyInfoOpen(!isBodyInfoOpen)}
            className="w-full flex items-center justify-between text-left cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-stone-100 text-stone-700 text-xs font-bold flex items-center justify-center">
                7
              </span>
              <h2 className="text-base font-bold text-stone-900 font-serif">
                Thông tin vóc dáng
              </h2>
              <span className="text-xs text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">
                Không bắt buộc
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-stone-500 hover:text-stone-800 font-medium">
              <span>{isBodyInfoOpen ? "Thu gọn" : "Mở rộng"}</span>
              {isBodyInfoOpen ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
          </button>

          {isBodyInfoOpen && (
            <div className="mt-5 pt-4 border-t border-stone-200 space-y-4">
              {/* Độ tuổi */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-2">
                  Độ tuổi:
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableAges.map((age) => {
                    const isSelected = ageRange === age;
                    return (
                      <button
                        key={age}
                        type="button"
                        onClick={() => setAgeRange(isSelected ? null : age)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-stone-800 text-white border-stone-800"
                            : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50"
                        }`}
                      >
                        {ageRangeLabels[age]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Chiều cao & Cân nặng */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Chiều cao (cm):
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={100}
                      max={220}
                      value={heightCm ?? ""}
                      onChange={(e) => {
                        const val = e.target.value ? parseInt(e.target.value, 10) : null;
                        setHeightCm(isNaN(val as number) ? null : val);
                      }}
                      placeholder="Ví dụ: 165"
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#991B1B]/30 focus:border-[#991B1B]"
                    />
                    <span className="absolute right-3.5 top-2.5 text-xs text-stone-400 font-medium">
                      cm
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Cân nặng (kg):
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={30}
                      max={150}
                      value={weightKg ?? ""}
                      onChange={(e) => {
                        const val = e.target.value ? parseInt(e.target.value, 10) : null;
                        setWeightKg(isNaN(val as number) ? null : val);
                      }}
                      placeholder="Ví dụ: 52"
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#991B1B]/30 focus:border-[#991B1B]"
                    />
                    <span className="absolute right-3.5 top-2.5 text-xs text-stone-400 font-medium">
                      kg
                    </span>
                  </div>
                </div>
              </div>

              {/* Dòng ghi chú nhỏ bảo mật / vóc dáng */}
              <p className="text-[11px] text-stone-500 italic pt-1">
                * Chỉ dùng để gợi ý bằng chữ, không dùng để chỉnh ảnh của bạn.
              </p>
            </div>
          )}
        </section>
      </div>

      {/* KHỐI NÚT HOÀN TẤT & NHẮC CHỌN */}
      <div className="mt-8 pt-6 border-t border-stone-200">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-stone-500 text-center sm:text-left">
            {!isValid ? (
              <span className="text-amber-700 font-medium flex items-center justify-center sm:justify-start gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                Vui lòng chọn đủ <strong>Giới tính</strong> và <strong>Sự kiện</strong> để tiếp tục
              </span>
            ) : (
              <span className="text-emerald-700 font-medium flex items-center justify-center sm:justify-start gap-1.5">
                <Check className="w-4 h-4 shrink-0" />
                Đã sẵn sàng tạo đề xuất trang phục cá nhân hóa
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => goTo("home")}
              className="w-1/2 sm:w-auto px-5 py-3 rounded-xl border border-stone-300 text-stone-700 text-sm font-medium hover:bg-stone-50 transition-colors cursor-pointer text-center"
            >
              Hủy
            </button>
            <button
              type="button"
              disabled={!isValid}
              onClick={handleSubmit}
              className={`w-1/2 sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl text-sm font-semibold transition-all shadow-sm ${
                isValid
                  ? "bg-[#991B1B] text-white hover:bg-red-800 cursor-pointer shadow-md shadow-red-900/10 active:scale-[0.99]"
                  : "bg-stone-200 text-stone-400 cursor-not-allowed opacity-75"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Xem gợi ý</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
