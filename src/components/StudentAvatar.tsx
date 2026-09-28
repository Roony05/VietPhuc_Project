import React from "react";
import { AgeRange } from "../types";

/**
 * Nhân vật chibi anime học đường vẽ bằng SVG, đổi trang phục/kiểu tóc theo giới tính và độ tuổi.
 * Không cần file ảnh, nét sắc ở mọi kích thước.
 */

type Look = {
  label: string;
  top: string; // màu áo chính
  lower: string; // màu quần/váy
  jacket?: string; // áo khoác mở (blazer, cardigan)
  hoodie?: boolean;
  scarf?: boolean; // khăn quàng đỏ
  badge?: boolean; // phù hiệu trường
  lanyard?: boolean; // thẻ sinh viên
  backpack?: boolean;
  glasses?: boolean;
  scale: number; // nhỏ tuổi thì dáng nhỏ hơn
};

const LOOKS: Record<AgeRange, { nam: Look; nu: Look }> = {
  duoi_16: {
    nam: { label: "Học sinh THCS", top: "#FFFFFF", lower: "#26324A", scarf: true, backpack: true, scale: 0.88 },
    nu: { label: "Học sinh THCS", top: "#FFFFFF", lower: "#26324A", scarf: true, backpack: true, scale: 0.88 },
  },
  "16_18": {
    nam: { label: "Học sinh THPT", top: "#FFFFFF", lower: "#26324A", badge: true, backpack: true, scale: 0.94 },
    nu: { label: "Học sinh THPT", top: "#FFFFFF", lower: "#26324A", badge: true, backpack: true, scale: 0.94 },
  },
  "19_22": {
    nam: { label: "Sinh viên", top: "#1F6F6A", lower: "#3E5C8A", hoodie: true, lanyard: true, scale: 1 },
    nu: { label: "Sinh viên", top: "#E9A6B5", lower: "#D8C3A5", hoodie: true, lanyard: true, scale: 1 },
  },
  "23_30": {
    nam: { label: "Người đi làm trẻ", top: "#FFFFFF", lower: "#2B2118", jacket: "#D8C3A5", scale: 1 },
    nu: { label: "Người đi làm trẻ", top: "#FFF3E0", lower: "#FFF3E0", jacket: "#E0A526", scale: 1 },
  },
  tren_30: {
    nam: { label: "Người trưởng thành", top: "#FFFFFF", lower: "#26324A", jacket: "#26324A", glasses: true, scale: 1 },
    nu: { label: "Người trưởng thành", top: "#FFFFFF", lower: "#26324A", jacket: "#26324A", glasses: true, scale: 1 },
  },
};

const SKIN = "#FFE0C7";
const HAIR = "#3B2A20";
const LINE = "#2B2118";

export function avatarLabel(gender: "nam" | "nu", age: AgeRange | null) {
  return LOOKS[age ?? "16_18"][gender].label;
}

export const StudentAvatar: React.FC<{
  gender: "nam" | "nu";
  age: AgeRange | null;
  className?: string;
}> = ({ gender, age, className = "" }) => {
  const ageKey: AgeRange = age ?? "16_18";
  const look = LOOKS[ageKey][gender];
  const isGirl = gender === "nu";
  const s = look.scale;

  return (
    <svg viewBox="0 0 120 150" className={className} role="img" aria-label={`Nhân vật ${isGirl ? "nữ" : "nam"} – ${look.label}`}>
      <ellipse cx="60" cy="143" rx="28" ry="4" fill="#000" opacity="0.08" />
      <g transform={`translate(${60 - 60 * s} ${146 - 146 * s}) scale(${s})`}>
        {/* tóc phía sau (nữ) */}
        {isGirl && ageKey === "duoi_16" && (
          <>
            <ellipse cx="25" cy="62" rx="9" ry="19" fill={HAIR} />
            <ellipse cx="95" cy="62" rx="9" ry="19" fill={HAIR} />
            <circle cx="30" cy="44" r="3.5" fill="#B83227" />
            <circle cx="90" cy="44" r="3.5" fill="#B83227" />
          </>
        )}
        {isGirl && (ageKey === "16_18" || ageKey === "19_22") && (
          <path d="M28 46 Q28 15 60 15 Q92 15 92 46 L95 98 Q82 104 74 94 L46 94 Q38 104 25 98 Z" fill={HAIR} />
        )}
        {isGirl && ageKey === "23_30" && <path d="M28 46 Q28 15 60 15 Q92 15 92 46 L92 76 L28 76 Z" fill={HAIR} />}
        {isGirl && ageKey === "tren_30" && <circle cx="60" cy="15" r="10" fill={HAIR} />}

        {/* quần / váy + chân + giày */}
        {isGirl ? (
          <>
            <rect x="47" y="124" width="8" height="14" rx="3" fill={SKIN} />
            <rect x="65" y="124" width="8" height="14" rx="3" fill={SKIN} />
            <rect x="47" y="131" width="8" height="7" fill="#FFFFFF" />
            <rect x="65" y="131" width="8" height="7" fill="#FFFFFF" />
            <path d={ageKey === "23_30" || ageKey === "tren_30" ? "M40 106 L80 106 L84 132 L36 132 Z" : "M40 106 L80 106 L87 126 L33 126 Z"} fill={look.lower} />
          </>
        ) : (
          <>
            <rect x="44" y="106" width="15" height="32" rx="4" fill={look.lower} />
            <rect x="61" y="106" width="15" height="32" rx="4" fill={look.lower} />
          </>
        )}
        <ellipse cx="51" cy="139" rx="8" ry="4" fill={LINE} />
        <ellipse cx="69" cy="139" rx="8" ry="4" fill={LINE} />

        {/* tay */}
        <rect x="29" y="78" width="11" height="30" rx="5.5" fill={look.jacket || look.top} stroke="#E4D9CC" strokeWidth="1" />
        <rect x="80" y="78" width="11" height="30" rx="5.5" fill={look.jacket || look.top} stroke="#E4D9CC" strokeWidth="1" />
        <circle cx="34.5" cy="110" r="5" fill={SKIN} />
        <circle cx="85.5" cy="110" r="5" fill={SKIN} />

        {/* thân áo */}
        <rect x="38" y="74" width="44" height="36" rx="10" fill={look.top} stroke="#E4D9CC" strokeWidth="1" />
        {look.hoodie && (
          <>
            <path d="M44 74 Q60 86 76 74" fill="none" stroke="#00000022" strokeWidth="3" />
            <line x1="55" y1="80" x2="54" y2="92" stroke="#FFFFFF" strokeWidth="1.5" />
            <line x1="65" y1="80" x2="66" y2="92" stroke="#FFFFFF" strokeWidth="1.5" />
            <rect x="48" y="96" width="24" height="9" rx="3" fill="#00000014" />
          </>
        )}
        {!look.hoodie && (
          <>
            <path d="M52 74 L60 82 L68 74 Z" fill="#FFFFFF" stroke="#E4D9CC" strokeWidth="1" />
            <line x1="60" y1="82" x2="60" y2="108" stroke="#E4D9CC" strokeWidth="1" />
          </>
        )}
        {look.jacket && (
          <>
            <path d="M38 84 Q38 74 48 74 L56 76 L52 110 L40 110 Q38 110 38 106 Z" fill={look.jacket} />
            <path d="M82 84 Q82 74 72 74 L64 76 L68 110 L80 110 Q82 110 82 106 Z" fill={look.jacket} />
          </>
        )}
        {look.scarf && (
          <>
            <path d="M51 75 L60 94 L69 75 Z" fill="#D7263D" />
            <circle cx="60" cy="79" r="3.5" fill="#B31B30" />
          </>
        )}
        {look.badge && <rect x="67" y="84" width="9" height="6" rx="1.5" fill="#1F6F6A" />}
        {look.badge && isGirl && <path d="M54 76 L60 80 L66 76 L66 83 L60 80 L54 83 Z" fill="#B83227" />}
        {look.lanyard && (
          <>
            <path d="M50 75 L57 96 M70 75 L63 96" stroke="#E0A526" strokeWidth="1.5" fill="none" />
            <rect x="54" y="95" width="12" height="9" rx="1.5" fill="#FFFFFF" stroke="#E4D9CC" />
          </>
        )}
        {look.backpack && (
          <>
            <line x1="44" y1="75" x2="42" y2="104" stroke="#B83227" strokeWidth="3" strokeLinecap="round" />
            <line x1="76" y1="75" x2="78" y2="104" stroke="#B83227" strokeWidth="3" strokeLinecap="round" />
          </>
        )}

        {/* cổ + đầu */}
        <rect x="55" y="68" width="10" height="9" fill={SKIN} />
        {!isGirl && <ellipse cx="60" cy="42" rx="30" ry="26" fill={HAIR} />}
        <ellipse cx="60" cy="48" rx="27" ry="28" fill={SKIN} />

        {/* tóc phía trước */}
        {isGirl ? (
          <path d="M32 47 Q33 20 60 20 Q87 20 88 47 Q80 34 70 37 Q64 28 58 37 Q50 31 44 39 Q38 37 32 47 Z" fill={HAIR} />
        ) : ageKey === "tren_30" ? (
          <path d="M33 45 Q34 21 60 20 Q86 21 87 45 Q78 30 52 34 Q42 36 33 45 Z" fill={HAIR} />
        ) : (
          <path d="M32 46 Q35 21 60 19 Q85 21 88 46 L81 37 L75 45 L69 34 L62 44 L56 34 L50 44 L44 36 L38 45 Z" fill={HAIR} />
        )}

        {/* mặt anime: mắt to có đốm sáng, má hồng */}
        <path d="M44 42 Q49 39 54 42" stroke={HAIR} strokeWidth="1.6" fill="none" strokeLinecap="round" />
        <path d="M66 42 Q71 39 76 42" stroke={HAIR} strokeWidth="1.6" fill="none" strokeLinecap="round" />
        <ellipse cx="49" cy="52" rx="4.6" ry="6.2" fill={LINE} />
        <ellipse cx="71" cy="52" rx="4.6" ry="6.2" fill={LINE} />
        <circle cx="50.8" cy="49.3" r="1.7" fill="#FFFFFF" />
        <circle cx="72.8" cy="49.3" r="1.7" fill="#FFFFFF" />
        <circle cx="47.8" cy="54.8" r="0.9" fill="#FFFFFF" />
        <circle cx="69.8" cy="54.8" r="0.9" fill="#FFFFFF" />
        {isGirl && (
          <>
            <path d="M44 47 L42.5 45.5 M54 47 L55.5 45.5" stroke={LINE} strokeWidth="1" />
            <path d="M66 47 L64.5 45.5 M76 47 L77.5 45.5" stroke={LINE} strokeWidth="1" />
          </>
        )}
        <ellipse cx="42" cy="61" rx="4.5" ry="2.3" fill="#F7A1A1" opacity="0.65" />
        <ellipse cx="78" cy="61" rx="4.5" ry="2.3" fill="#F7A1A1" opacity="0.65" />
        <path d="M56 63 Q60 67 64 63" stroke={LINE} strokeWidth="1.6" fill="none" strokeLinecap="round" />
        {look.glasses && (
          <>
            <circle cx="49" cy="52" r="8" fill="none" stroke={LINE} strokeWidth="1.3" />
            <circle cx="71" cy="52" r="8" fill="none" stroke={LINE} strokeWidth="1.3" />
            <line x1="57" y1="52" x2="63" y2="52" stroke={LINE} strokeWidth="1.3" />
          </>
        )}
      </g>
    </svg>
  );
};
