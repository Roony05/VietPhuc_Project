import React, { useState } from "react";
import { useApp } from "../state/AppContext";
import { outfits } from "../data/outfits";
import { garmentTypeLabels, genderLabels } from "../data/labels";
import { OutfitCard } from "../components/OutfitCard";
import { FlowHeader } from "../components/Flow";
import { Chip, PageTitle } from "../components/ui";
import { ColorTag, GarmentType, Gender, Outfit } from "../types";

const GARMENTS: GarmentType[] = ["ao_dai", "ao_dai_cach_tan", "ao_tu_than", "ao_ngu_than", "ao_ba_ba", "ao_tac"];

const SHOWCASE_COLORS: ColorTag[] = ["do", "xanh_lam", "vang", "hong_sen", "xanh_la", "tim", "cam", "den", "trang", "nau", "be"];

export const GalleryScreen: React.FC = () => {
  const { goTo, filters, updateFilters, setSelectedOutfitId } = useApp();
  const [gender, setGender] = useState<Gender | null>(filters.gender);
  const [garment, setGarment] = useState<GarmentType | null>(null);

  const list = outfits.filter(
    (o) =>
      (!gender || o.gender === gender || o.gender === "unisex") && (!garment || o.garmentType === garment)
  );
  const families = [...new Set(list.map((item) => item.familyId))].map((id, i) => {
    const variants = list.filter((item) => item.familyId === id);
    // ưu tiên màu người dùng thích; không có thì mỗi kiểu áo khoe một màu khác nhau cho thư viện bớt đơn điệu
    const showcase = SHOWCASE_COLORS[i % SHOWCASE_COLORS.length];
    const preferred =
      variants.find((item) => filters.colors.includes(item.colors[0])) ||
      variants.find((item) => item.colors[0] === showcase) ||
      variants[0];
    return { preferred, variants };
  });
  // chỉ hiện loại trang phục đang có trong thư viện
  const garmentsInLibrary = GARMENTS.filter((g) => outfits.some((o) => o.garmentType === g));

  const choose = (o: Outfit) => {
    setSelectedOutfitId(o.id);
    if (!filters.gender) updateFilters({ gender: o.gender === "unisex" ? null : o.gender });
    goTo("studio");
  };

  return (
    <>
      <FlowHeader current={1} back={() => (window.history.length > 1 ? window.history.back() : goTo("home"))} />
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-10">
      <PageTitle
        title="Thư viện Việt phục"
        description="Chọn một bộ bạn thích để mặc thử lên ảnh của mình."
      />

      <div className="flex flex-col gap-3 mb-8">
        <div className="flex flex-wrap gap-2">
          <Chip selected={gender === null} onClick={() => setGender(null)}>
            Tất cả
          </Chip>
          {(["nu", "nam"] as Gender[]).map((g) => (
            <Chip key={g} selected={gender === g} onClick={() => setGender(g)}>
              {genderLabels[g]}
            </Chip>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Chip selected={garment === null} onClick={() => setGarment(null)}>
            Mọi loại
          </Chip>
          {garmentsInLibrary.map((g) => (
            <Chip key={g} selected={garment === g} onClick={() => setGarment(g)}>
              {garmentTypeLabels[g]}
            </Chip>
          ))}
        </div>
      </div>

      <p className="text-sm text-muc-nhat mb-4">{families.length} kiểu · {list.length} màu</p>
      {families.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {families.map(({ preferred, variants }) => (
            <OutfitCard key={preferred.familyId} outfit={preferred} variants={variants} onSelect={choose} />
          ))}
        </div>
      ) : (
        <p className="text-muc-nhat py-10 text-center">Chưa có bộ nào thuộc nhóm này.</p>
      )}
    </div>
    </>
  );
};
