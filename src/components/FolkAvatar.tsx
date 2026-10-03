import React, { useId } from "react";
import { AgeRange } from "../types";

/**
 * Nhân vật chibi nét truyện tranh dân gian (viền mực đậm, màu phẳng, đầu to), mặc đồ thời xưa,
 * đổi theo giới tính và độ tuổi. Có sẵn khung giấy dó viền son, góc mây cuộn. Vẽ bằng SVG.
 */

type Outfit = "aodai" | "tuthan" | "kid";
type Head = "traidao" | "haichom" | "khandong" | "moqua" | "tocdai" | "quaithao" | "khanvan";

type Look = {
  label: string;
  outfit: Outfit;
  head: Head;
  coat: string; // áo ngoài
  pants: string; // quần / váy
  hat?: string; // khăn đóng, khăn vấn
  yem?: string; // yếm (áo tứ thân)
  sash?: string; // thắt lưng (áo tứ thân)
  prop?: "quat" | "cuon"; // quạt giấy, cuộn giấy
  beard?: boolean;
  blackTeeth?: boolean; // nhuộm răng đen
  scale: number; // nhỏ tuổi thì dáng nhỏ hơn
};

const LOOKS: Record<AgeRange, { nam: Look; nu: Look }> = {
  duoi_16: {
    nam: { label: "Cậu bé tóc trái đào", outfit: "kid", head: "traidao", coat: "#9B6B43", pants: "#2E2622", scale: 0.86 },
    nu: { label: "Cô bé tóc hai chỏm", outfit: "kid", head: "haichom", coat: "#E7BE5C", pants: "#2E2622", scale: 0.86 },
  },
  "16_18": {
    nam: { label: "Thư sinh", outfit: "aodai", head: "khandong", coat: "#2F5C8C", pants: "#F6F1E6", hat: "#22344F", scale: 0.93 },
    nu: {
      label: "Cô thôn nữ",
      outfit: "tuthan",
      head: "moqua",
      coat: "#8A5A35",
      pants: "#2E2622",
      yem: "#C93A2B",
      sash: "#5C8F4E",
      scale: 0.93,
    },
  },
  "19_22": {
    nam: { label: "Sĩ tử", outfit: "aodai", head: "khandong", coat: "#F4EFE4", pants: "#F4EFE4", hat: "#2A2522", prop: "cuon", scale: 1 },
    nu: { label: "Tiểu thư", outfit: "aodai", head: "tocdai", coat: "#E8909F", pants: "#F6F1E6", scale: 1 },
  },
  "23_30": {
    nam: { label: "Thầy đồ", outfit: "aodai", head: "khandong", coat: "#2E2622", pants: "#F6F1E6", hat: "#2A2522", prop: "quat", scale: 1 },
    nu: {
      label: "Liền chị quan họ",
      outfit: "tuthan",
      head: "quaithao",
      coat: "#A8473A",
      pants: "#2E2622",
      yem: "#F0B7A8",
      sash: "#2F7A6E",
      scale: 1,
    },
  },
  tren_30: {
    nam: { label: "Ông đồ", outfit: "aodai", head: "khandong", coat: "#2E2622", pants: "#F6F1E6", hat: "#2A2522", beard: true, prop: "quat", scale: 1 },
    nu: { label: "Bà đồ", outfit: "aodai", head: "khanvan", coat: "#7A5236", pants: "#2E2622", hat: "#3B2B22", blackTeeth: true, scale: 1 },
  },
};

const INK = "#1F1712";
const SKIN = "#F9D5B0";
const PAPER = "#F3E4C2";
const SON = "#8E2A1E";
const LIGHT = "#F4E2B0"; // giấy, quạt
const FOLD = { stroke: "#FFFFFF", strokeOpacity: 0.28, strokeWidth: 1.2, fill: "none" } as const;

export function avatarLabel(gender: "nam" | "nu", age: AgeRange | null) {
  return LOOKS[age ?? "16_18"][gender].label;
}

/** Tay áo + bàn tay (áo dài, áo tứ thân) */
const LongSleeves: React.FC<{ color: string }> = ({ color }) => (
  <>
    <path d="M44 72 Q31 82 31 108 L40 108 Q41 92 47 84 Z" fill={color} />
    <path d="M76 72 Q89 82 89 108 L80 108 Q79 92 73 84 Z" fill={color} />
    <circle cx="35.5" cy="111" r="5" fill={SKIN} />
    <circle cx="84.5" cy="111" r="5" fill={SKIN} />
  </>
);

const Body: React.FC<{ look: Look }> = ({ look }) => {
  if (look.outfit === "kid") {
    return (
      <>
        {/* quần lửng, ống chân, bàn chân trần */}
        <rect x="45" y="114" width="8" height="17" rx="3" fill={SKIN} />
        <rect x="67" y="114" width="8" height="17" rx="3" fill={SKIN} />
        <ellipse cx="48.5" cy="132.5" rx="6" ry="2.6" fill={SKIN} />
        <ellipse cx="71.5" cy="132.5" rx="6" ry="2.6" fill={SKIN} />
        <path d="M42 100 L41 117 L58 117 L59 104 Z" fill={look.pants} />
        <path d="M78 100 L79 117 L62 117 L61 104 Z" fill={look.pants} />
        {/* áo cánh ngắn */}
        <path d="M45 73 Q36 80 35 97 L42 97 Q43 86 48 82 Z" fill={look.coat} />
        <path d="M75 73 Q84 80 85 97 L78 97 Q77 86 72 82 Z" fill={look.coat} />
        <circle cx="38.5" cy="101" r="5" fill={SKIN} />
        <circle cx="81.5" cy="101" r="5" fill={SKIN} />
        <path d="M44 72 Q60 68 76 72 L80 104 Q60 107 40 104 Z" fill={look.coat} />
        <path d="M60 72 L60 105" fill="none" strokeWidth="1.4" />
        {[80, 88, 96].map((y) => (
          <circle key={y} cx="60" cy={y} r="1.3" fill={INK} stroke="none" />
        ))}
      </>
    );
  }

  if (look.outfit === "tuthan") {
    return (
      <>
        {/* váy đen dài tới chân */}
        <ellipse cx="51" cy="135.5" rx="6" ry="2.4" fill={INK} />
        <ellipse cx="69" cy="135.5" rx="6" ry="2.4" fill={INK} />
        <path d="M41 104 L36 134 L84 134 L79 104 Z" fill={look.pants} />
        <LongSleeves color={look.coat} />
        {/* áo tứ thân mở vạt, lộ yếm và váy */}
        <path d="M43 71 Q60 66 77 71 L83 120 Q60 124 37 120 Z" fill={look.coat} />
        <path d="M53 71 L67 71 L65.5 96 L54.5 96 Z" fill={look.yem} />
        <path d="M55 101 L65 101 L69 121.5 L51 121.5 Z" fill={look.pants} />
        <rect x="40" y="95.5" width="40" height="6" rx="2" fill={look.sash} />
        <path d="M64 101 L66 117 L70.5 116 L68.5 101 Z" fill={look.sash} />
      </>
    );
  }

  // áo dài: tay áo, thân dài, cổ đứng, đường cài khuy chéo
  return (
    <>
      <ellipse cx="50" cy="135.5" rx="7" ry="2.6" fill={INK} />
      <ellipse cx="70" cy="135.5" rx="7" ry="2.6" fill={INK} />
      <path d="M44 122 L42 134 L57 134 L59 126 Z" fill={look.pants} />
      <path d="M76 122 L78 134 L63 134 L61 126 Z" fill={look.pants} />
      <LongSleeves color={look.coat} />
      <path d="M43 71 Q60 66 77 71 L85 126 Q60 131 35 126 Z" fill={look.coat} />
      <path d="M60 71 Q67 74 71 80 L71 86" fill="none" strokeWidth="1.4" />
      <path d="M60 104 L60 128" fill="none" strokeWidth="1.2" />
    </>
  );
};

/** Tóc / khăn phía sau thân (vẽ trước thân) */
const HeadBack: React.FC<{ look: Look }> = ({ look }) =>
  look.head === "tocdai" ? <path d="M35 44 Q34 20 60 20 Q86 20 85 44 L88 100 Q74 106 66 96 L54 96 Q46 106 32 100 Z" fill={INK} /> : null;

/** Tóc, khăn, nón phía trước đầu */
const HeadTop: React.FC<{ look: Look }> = ({ look }) => {
  switch (look.head) {
    case "traidao": // trọc, chừa một chỏm trước trán
      return <path d="M55 27.5 Q56 17 64 18.5 Q61 23 65 27.5 Q60 30 55 27.5 Z" fill={INK} />;
    case "haichom":
      return (
        <>
          <circle cx="41" cy="28" r="7.5" fill={INK} />
          <circle cx="79" cy="28" r="7.5" fill={INK} />
          <path d="M36.5 45 Q38 26 60 25.5 Q82 26 83.5 45 Q76 36 66 37 Q60 32 54 37 Q44 36 36.5 45 Z" fill={INK} />
          <path d="M44 20 L49 23 L44 26 Z M76 20 L71 23 L76 26 Z" fill="#C93A2B" strokeWidth="1.2" />
        </>
      );
    case "khandong": // khăn đóng / khăn xếp
      return (
        <>
          <path d="M35 44 Q34 21 60 20 Q86 21 85 44 Q60 35 35 44 Z" fill={look.hat} />
          <path d="M37.5 38 Q60 30 82.5 38" {...FOLD} />
          <path d="M39.5 31.5 Q60 24 80.5 31.5" {...FOLD} />
        </>
      );
    case "moqua": // khăn mỏ quạ: vòng qua cằm, chóp nhọn trên đỉnh
      return (
        <>
          <path d="M36 46 Q37 69 60 72.5 Q83 69 84 46" fill="none" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M34 46 Q33 21 60 20 Q87 21 86 46 Q76 38 60 39 Q44 38 34 46 Z" fill={INK} />
          <path d="M53.5 22 L60 11 L66.5 22 Z" fill={INK} />
        </>
      );
    case "tocdai": // tóc dài rẽ ngôi, cài hoa
      return (
        <>
          <path d="M36 46 Q36 22 60 22 Q84 22 84 46 Q74 30 58 32 Q46 34 36 46 Z" fill={INK} />
          <circle cx="78" cy="31" r="4.2" fill="#F2C14E" />
          <circle cx="78" cy="31" r="1.5" fill="#C93A2B" stroke="none" />
        </>
      );
    case "quaithao": // tóc vấn + nón quai thao, quai và tua đỏ
      return (
        <>
          <path d="M36 44 Q60 32 84 44 Q84 30 60 28 Q36 30 36 44 Z" fill={INK} />
          <path d="M27 29 Q30 64 54 73" fill="none" strokeWidth="1.6" />
          <path d="M93 29 Q90 64 66 73" fill="none" strokeWidth="1.6" />
          <circle cx="54.5" cy="74" r="2.2" fill="#C93A2B" strokeWidth="1.2" />
          <circle cx="65.5" cy="74" r="2.2" fill="#C93A2B" strokeWidth="1.2" />
          <path d="M46 23 L48.5 15.5 L71.5 15.5 L74 23 Z" fill="#E8C77B" />
          <ellipse cx="60" cy="26" rx="41" ry="7.5" fill="#E8C77B" />
          <ellipse cx="60" cy="25" rx="27" ry="3.8" fill="none" strokeWidth="1.1" />
        </>
      );
    case "khanvan": // khăn vấn, tóc mai bạc
      return (
        <>
          <path d="M36 44 Q36 52 38.5 56 L41 45 Z M84 44 Q84 52 81.5 56 L79 45 Z" fill="#9C958F" strokeWidth="1.2" />
          <path d="M34 44 Q34 24 60 23 Q86 24 86 44 Q60 33 34 44 Z" fill={look.hat} />
          <path d="M37 38 Q60 29 83 38" {...FOLD} />
          <path d="M40 31.5 Q60 25 80 31.5" {...FOLD} />
        </>
      );
  }
};

const Face: React.FC<{ look: Look }> = ({ look }) => {
  const brow = look.beard ? { stroke: "#EDEAE2", strokeWidth: 2.4 } : { strokeWidth: 1.6 };
  return (
    <g stroke={INK} strokeLinecap="round">
      <path d="M47 45.5 Q51 43.5 55 45.5" fill="none" {...brow} />
      <path d="M65 45.5 Q69 43.5 73 45.5" fill="none" {...brow} />
      <ellipse cx="51" cy="51" rx="2.3" ry="3" fill={INK} stroke="none" />
      <ellipse cx="69" cy="51" rx="2.3" ry="3" fill={INK} stroke="none" />
      <circle cx="51.8" cy="50" r="0.8" fill="#FFFFFF" stroke="none" />
      <circle cx="69.8" cy="50" r="0.8" fill="#FFFFFF" stroke="none" />
      <circle cx="45.5" cy="58" r="3.6" fill="#EE8C82" opacity="0.45" stroke="none" />
      <circle cx="74.5" cy="58" r="3.6" fill="#EE8C82" opacity="0.45" stroke="none" />
      <path d="M59.5 54.5 Q61.5 56 59.5 57" fill="none" strokeWidth="1.2" />
      {look.blackTeeth ? (
        <path d="M56 60 Q60 66 64 60 Z" fill={INK} strokeWidth="1.4" strokeLinejoin="round" />
      ) : (
        <path d="M56 60.5 Q60 64.5 64 60.5" fill="none" strokeWidth="1.6" />
      )}
      {look.beard && (
        <>
          <path d="M51 63 Q60 86 69 63 Q60 69 51 63 Z" fill="#EDEAE2" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M52 60.5 Q56 57.5 60 60 Q64 57.5 68 60.5 Q64 61.8 60 61.2 Q56 61.8 52 60.5 Z" fill="#EDEAE2" strokeWidth="1.2" />
        </>
      )}
    </g>
  );
};

const Prop: React.FC<{ look: Look }> = ({ look }) => {
  if (look.prop === "quat") {
    return (
      <>
        <path d="M84.5 110 L92 91 A17 17 0 0 1 101 103 Z" fill={LIGHT} strokeLinejoin="round" />
        <path d="M84.5 110 L95 93 M84.5 110 L98 96.5 M84.5 110 L100 100" fill="none" strokeWidth="0.9" />
      </>
    );
  }
  if (look.prop === "cuon") {
    return <rect x="27" y="104" width="15" height="6" rx="2.5" fill={LIGHT} transform="rotate(-18 34.5 107)" />;
  }
  return null;
};

export const FolkAvatar: React.FC<{
  gender: "nam" | "nu";
  age: AgeRange | null;
  className?: string;
  framed?: boolean; // false: chỉ vẽ nhân vật, nền trong suốt (dùng trong khung ảnh lookbook)
}> = ({ gender, age, className = "", framed = true }) => {
  const look = LOOKS[age ?? "16_18"][gender];
  const s = look.scale;
  const clip = `fa-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const corner = <path d="M11 26 Q11 11 26 11 M16 21 a4 4 0 1 1 4 4" fill="none" stroke={SON} strokeWidth="1.4" strokeLinecap="round" />;

  return (
    <svg viewBox="0 0 120 150" className={className} role="img" aria-label={`Nhân vật ${look.label}`}>
      {/* khung giấy dó, viền son hai lớp, góc mây cuộn */}
      {framed && (
        <>
          <defs>
            <clipPath id={clip}>
              <rect x="8" y="8" width="104" height="134" rx="10" />
            </clipPath>
          </defs>
          <rect x="2.5" y="2.5" width="115" height="145" rx="14" fill={PAPER} stroke={SON} strokeWidth="3" />
          <g clipPath={`url(#${clip})`}>
            <circle cx="60" cy="54" r="34" fill="#EBC98C" opacity="0.5" />
            <path d="M0 130 Q28 116 52 126 Q76 114 120 126 L120 150 L0 150 Z" fill="#E1CB9C" />
          </g>
          <rect x="8" y="8" width="104" height="134" rx="10" fill="none" stroke={SON} strokeWidth="1" opacity="0.6" />
          {corner}
          <g transform="translate(120 0) scale(-1 1)">{corner}</g>
          <g transform="translate(0 150) scale(1 -1)">{corner}</g>
          <g transform="translate(120 150) scale(-1 -1)">{corner}</g>
        </>
      )}

      <ellipse cx="60" cy="137" rx="26" ry="3.5" fill={INK} opacity="0.15" />

      {/* nhân vật: viền mực đậm, màu phẳng */}
      <g
        transform={`translate(${60 - 60 * s} ${137 - 137 * s}) scale(${s})`}
        stroke={INK}
        strokeWidth="2.4"
        strokeLinejoin="round"
      >
        <HeadBack look={look} />
        <Body look={look} />
        <Prop look={look} />
        <rect x="55.5" y="64" width="9" height="9" fill={SKIN} />
        <circle cx="36" cy="52" r="4.5" fill={SKIN} />
        <circle cx="84" cy="52" r="4.5" fill={SKIN} />
        <ellipse cx="60" cy="48" rx="24" ry="22.5" fill={SKIN} />
        <Face look={look} />
        <HeadTop look={look} />
      </g>
    </svg>
  );
};
