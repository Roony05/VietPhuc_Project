import React, { useMemo, useState } from "react";
import { useApp } from "../state/AppContext";
import { outfits } from "../data/outfits";
import { GarmentType, Gender, Outfit } from "../types";
import { garmentTypeLabels, genderLabels } from "../data/labels";
import { OutfitCard } from "../components/OutfitCard";
import { ArrowLeft, Grid, Sparkles, Filter } from "lucide-react";

type GenderFilter = "all" | Gender;
type GarmentFilter = "all" | GarmentType;

export const GalleryScreen: React.FC = () => {
  const { filters, setFilters, setSelectedOutfitId, goTo } = useApp();

  // Khởi tạo bộ lọc nhanh từ filters nếu đã có sẵn
  const [selectedGenderFilter, setSelectedGenderFilter] = useState<GenderFilter>(
    filters.gender ? filters.gender : "all"
  );
  const [selectedGarmentFilter, setSelectedGarmentFilter] = useState<GarmentFilter>(
    filters.garmentType ? filters.garmentType : "all"
  );

  // Lọc ngay khi bấm, không cần nút submit
  const filteredOutfits = useMemo(() => {
    return outfits.filter((outfit) => {
      // Lọc theo giới tính
      if (selectedGenderFilter !== "all") {
        if (outfit.gender !== selectedGenderFilter && outfit.gender !== "unisex") {
          return false;
        }
      }

      // Lọc theo loại trang phục
      if (selectedGarmentFilter !== "all") {
        if (outfit.garmentType !== selectedGarmentFilter) {
          return false;
        }
      }

      return true;
    });
  }, [selectedGenderFilter, selectedGarmentFilter]);

  // Xử lý khi bấm "Chọn bộ này"
  const handleSelectOutfit = (outfit: Outfit) => {
    setSelectedOutfitId(outfit.id);

    // Gán filters.gender = gender của bộ đồ nếu filters.gender đang null
    setFilters((prev) => ({
      ...prev,
      gender: prev.gender ? prev.gender : outfit.gender,
      garmentType: outfit.garmentType,
    }));

    // Chuyển sang màn hình studio
    goTo("studio");
  };

  const garmentTypes: GarmentType[] = [
    "ao_dai",
    "ao_dai_cach_tan",
    "ao_tu_than",
    "ao_ngu_than",
    "ao_ba_ba",
    "ao_tac",
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-10">
      {/* Tiêu đề & Nút quay lại */}
      <div className="mb-6 sm:mb-8">
        <button
          type="button"
          onClick={() => goTo("home")}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-800 mb-3 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Về trang chủ</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 shadow-xs">
              <Grid className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 font-serif">
                Thư viện cổ phục Việt Nam
              </h1>
              <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
                Duyệt chọn mẫu áo truyền thống hoặc cách tân ưng ý để thử đồ trong phòng thử ảo
              </p>
            </div>
          </div>

          <div className="text-xs text-stone-500 bg-[#FFFDF9] border border-[#E7DECD] px-3.5 py-2 rounded-xl self-start sm:self-auto flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>
              Hiển thị: <strong className="text-stone-800">{filteredOutfits.length}</strong> / {outfits.length} bộ
            </span>
          </div>
        </div>
      </div>

      {/* THANH LỌC NHANH TRÊN CÙNG: Giới tính & Loại trang phục (Lọc tức thì) */}
      <div className="bg-[#FFFDF9] border border-[#E7DECD] rounded-2xl p-4 sm:p-5 mb-8 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
          <Filter className="w-4 h-4 text-stone-500" />
          <span className="text-xs font-bold uppercase tracking-wider text-stone-700">
            Lọc nhanh danh mục
          </span>
        </div>

        {/* Lọc Giới tính: Tất cả / Nam / Nữ */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <span className="text-xs font-semibold text-stone-700 shrink-0 min-w-28">
            Giới tính:
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedGenderFilter("all")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer border ${
                selectedGenderFilter === "all"
                  ? "bg-[#991B1B] text-white border-[#991B1B] shadow-xs"
                  : "bg-white text-stone-700 border-stone-200 hover:border-stone-300 hover:bg-stone-50"
              }`}
            >
              Tất cả
            </button>
            <button
              type="button"
              onClick={() => setSelectedGenderFilter("nam")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer border ${
                selectedGenderFilter === "nam"
                  ? "bg-[#991B1B] text-white border-[#991B1B] shadow-xs"
                  : "bg-white text-stone-700 border-stone-200 hover:border-stone-300 hover:bg-stone-50"
              }`}
            >
              {genderLabels.nam}
            </button>
            <button
              type="button"
              onClick={() => setSelectedGenderFilter("nu")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer border ${
                selectedGenderFilter === "nu"
                  ? "bg-[#991B1B] text-white border-[#991B1B] shadow-xs"
                  : "bg-white text-stone-700 border-stone-200 hover:border-stone-300 hover:bg-stone-50"
              }`}
            >
              {genderLabels.nu}
            </button>
          </div>
        </div>

        {/* Lọc Loại trang phục: Tất cả + các GarmentType */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 pt-1">
          <span className="text-xs font-semibold text-stone-700 shrink-0 min-w-28">
            Loại trang phục:
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedGarmentFilter("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer border ${
                selectedGarmentFilter === "all"
                  ? "bg-stone-800 text-white border-stone-800 shadow-xs"
                  : "bg-white text-stone-700 border-stone-200 hover:border-stone-300 hover:bg-stone-50"
              }`}
            >
              Tất cả
            </button>
            {garmentTypes.map((type) => {
              const isSelected = selectedGarmentFilter === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedGarmentFilter(type)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer border ${
                    isSelected
                      ? "bg-stone-800 text-white border-stone-800 shadow-xs"
                      : "bg-white text-stone-700 border-stone-200 hover:border-stone-300 hover:bg-stone-50"
                  }`}
                >
                  {garmentTypeLabels[type]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* LƯỚI BỘ ĐỒ (OUTFIT CARD) */}
      {filteredOutfits.length === 0 ? (
        <div className="bg-[#FFFDF9] border border-[#E7DECD] rounded-2xl p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
            <Grid className="w-6 h-6" />
          </div>
          <h3 className="text-base font-serif font-bold text-stone-800">
            Không tìm thấy bộ đồ nào
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Không có trang phục nào phù hợp với sự kết hợp bộ lọc hiện tại. Bạn vui lòng đổi tiêu chí lọc.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedGenderFilter("all");
              setSelectedGarmentFilter("all");
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-stone-100 text-stone-800 hover:bg-stone-200 transition-colors cursor-pointer"
          >
            Đặt lại bộ lọc
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
          {filteredOutfits.map((outfit) => (
            <OutfitCard
              key={outfit.id}
              outfit={outfit}
              showReasons={false}
              actionLabel="Chọn bộ này"
              onSelect={handleSelectOutfit}
            />
          ))}
        </div>
      )}
    </div>
  );
};
