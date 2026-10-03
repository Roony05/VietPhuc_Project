import React from "react";
import { motion } from "motion/react";
import { useApp } from "../state/AppContext";
import { outfits } from "../data/outfits";
import { presetLooks } from "../data/presetLooks";
import { FRAMES } from "../logic/frames";
import { Button, Reveal } from "../components/ui";
import { Sparkles, LayoutGrid, SlidersHorizontal, Shirt, Camera, Frame, BookHeart, ArrowRight } from "lucide-react";

const howItWorks = [
  { icon: SlidersHorizontal, title: "Chọn gu", text: "Dịp mặc, phong cách, màu sắc bạn thích." },
  { icon: Shirt, title: "Chọn bộ", text: "App gợi ý 3 bộ hợp nhất, hoặc bạn tự chọn trong thư viện." },
  { icon: Camera, title: "Lên đồ", text: "Tải ảnh của bạn lên, AI mặc thử bộ đồ rồi phối thêm nón, quạt, trâm cài." },
  { icon: Frame, title: "Đóng khung", text: `Chọn 1 trong ${FRAMES.length} khung lookbook điện ảnh rồi tải về khoe liền.` },
];

const pick = (familyId: string, color: string) => outfits.find((o) => o.familyId === familyId && o.colors[0] === color);

// 3 bộ đứng trên sân khấu ở hero
const STAGE = [pick("ao-ngu-than-nu", "vang"), pick("ao-dai-nu", "do"), pick("ao-tac-nam", "xanh_lam")].filter(Boolean);
// dải phim chạy ngang: mỗi dòng áo một màu khác nhau
const REEL = outfits.filter((_, i) => i % 5 === 0).slice(0, 16);

const ease = [0.22, 1, 0.36, 1] as const;

export const HomeScreen: React.FC = () => {
  const { goTo, resetSession } = useApp();
  const familyCount = new Set(outfits.map((o) => o.garmentType)).size;

  const start = (screen: "filter" | "gallery") => {
    resetSession();
    goTo(screen);
  };

  return (
    <div>
      {/* HERO: sân khấu có đèn chiếu */}
      <section className="relative max-w-6xl mx-auto px-4 grid lg:grid-cols-[1.05fr_1fr] gap-10 items-center min-h-[calc(100vh-4rem)] py-12">
        <div className="relative z-10">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
            className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-nghe mb-7"
          >
            <span className="w-10 h-px bg-nghe" /> Việt phục × Gen Z
          </motion.p>

          <h1 className="text-5xl sm:text-7xl font-bold leading-[1.02] text-muc">
            <motion.span
              className="block"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.1, ease }}
            >
              Mặc Việt phục,
            </motion.span>
            <motion.span
              className="block"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.25, ease }}
            >
              <span className="text-gold italic">chất</span> theo cách
            </motion.span>
            <motion.span
              className="block"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.4, ease }}
            >
              của bạn
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.7 }}
            className="text-lg text-muc-nhat mt-7 max-w-md"
          >
            Chọn bộ hợp dịp, mặc thử lên chính ảnh của bạn, hiểu ý nghĩa từng tà áo và đóng khung khoảnh khắc ấy.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.85, ease }}
            className="flex flex-wrap gap-3 mt-9"
          >
            <Button size="lg" onClick={() => start("filter")}>
              <Sparkles className="w-5 h-5" /> Gợi ý cho tôi
            </Button>
            <Button size="lg" variant="secondary" onClick={() => start("gallery")}>
              <LayoutGrid className="w-5 h-5" /> Tự chọn mẫu
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.1 }}
            className="flex gap-8 mt-12"
          >
            {[
              [outfits.length, "bộ trang phục"],
              [familyCount, "dòng áo"],
              [FRAMES.length, "khung lookbook"],
            ].map(([n, label]) => (
              <div key={label}>
                <p className="font-display text-3xl font-bold text-gold">{n}</p>
                <p className="text-xs text-muc-nhat uppercase tracking-wider mt-1">{label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* sân khấu */}
        <div className="relative h-[520px] sm:h-[600px]">
          {/* luồng đèn chiếu từ trên xuống */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-24 w-[150%] h-[120%] pointer-events-none blur-2xl bg-[conic-gradient(from_150deg_at_50%_0%,transparent_0deg,rgba(255,232,180,0.32)_26deg,rgba(255,240,205,0.5)_30deg,rgba(255,232,180,0.32)_34deg,transparent_60deg)]" />
          {/* sàn sân khấu */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-6 w-[90%] h-24 rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgba(255,220,160,0.35),transparent_70%)]" />
          {STAGE.map((o, i) => (
            <motion.div
              key={o!.id}
              initial={{ opacity: 0, y: 60, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 1.1, delay: 0.3 + i * 0.2, ease }}
              className={`absolute bottom-10 ${
                ["left-0 w-[40%] z-0", "left-1/2 -translate-x-1/2 w-[50%] z-10", "right-0 w-[40%] z-0"][i]
              }`}
            >
              <img
                src={o!.image}
                alt={o!.name}
                className="w-full animate-float drop-shadow-[0_30px_40px_rgba(0,0,0,0.7)]"
                style={{ animationDelay: `${i * 1.3}s` }}
              />
            </motion.div>
          ))}
        </div>
      </section>

      {/* DẢI PHIM chạy vô tận */}
      <section className="relative py-6 bg-black/60 border-y border-white/5 overflow-hidden" aria-label="Một vài bộ trong thư viện">
        <div className="absolute inset-x-0 top-1.5 h-3 bg-[repeating-linear-gradient(90deg,rgba(245,235,221,0.25)_0_14px,transparent_14px_34px)]" />
        <div className="absolute inset-x-0 bottom-1.5 h-3 bg-[repeating-linear-gradient(90deg,rgba(245,235,221,0.25)_0_14px,transparent_14px_34px)]" />
        <div className="flex w-max animate-marquee gap-4 py-3">
          {[...REEL, ...REEL].map((o, i) => (
            <button
              key={`${o.id}-${i}`}
              onClick={() => start("gallery")}
              className="w-36 h-48 shrink-0 rounded-xl spotlight overflow-hidden cursor-pointer opacity-80 hover:opacity-100 transition-opacity"
              title={o.name}
            >
              <img src={o.image} alt={o.name} loading="lazy" className="w-full h-full object-contain p-2" />
            </button>
          ))}
        </div>
      </section>

      {/* CÁCH HOẠT ĐỘNG */}
      <section className="max-w-6xl mx-auto px-4 py-24">
        <Reveal>
          <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-nghe mb-3">
            <span className="w-10 h-px bg-nghe" /> Kịch bản
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold text-muc mb-12">Bốn cảnh quay là có bộ ảnh</h2>
        </Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {howItWorks.map((step, i) => (
            <Reveal key={step.title} delay={i * 0.1}>
              <div className="group relative h-full glass border border-white/8 rounded-3xl p-7 overflow-hidden transition-all duration-500 hover:-translate-y-1.5 hover:border-nghe/40">
                <span className="absolute -right-3 -top-6 font-display text-[7rem] font-bold text-white/[0.04] group-hover:text-nghe/10 transition-colors">
                  {i + 1}
                </span>
                <span className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-son to-son-dam text-white flex items-center justify-center shadow-lg shadow-son/30 mb-6">
                  <step.icon className="w-5 h-5" />
                </span>
                <p className="relative text-xs font-semibold text-nghe uppercase tracking-[0.2em]">Cảnh {i + 1}</p>
                <h3 className="relative text-xl font-bold text-muc mt-1">{step.title}</h3>
                <p className="relative text-sm text-muc-nhat mt-2">{step.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* LỜI MỜI CUỐI TRANG */}
      <section className="max-w-6xl mx-auto px-4 pb-24">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 p-10 sm:p-16 text-center bg-[radial-gradient(ellipse_at_top,rgba(216,69,58,0.35),transparent_60%),radial-gradient(ellipse_at_bottom,rgba(233,180,76,0.18),transparent_60%)]">
            <h2 className="text-4xl sm:text-6xl font-bold text-muc">
              Sẵn sàng <span className="text-gold italic">lên hình</span>?
            </h2>
            <p className="text-muc-nhat mt-4 max-w-lg mx-auto">
              Chưa biết mặc gì? Xem {presetLooks.length} lookbook dựng sẵn, hoặc để app gợi ý giúp bạn một bộ.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              <Button size="lg" onClick={() => start("filter")}>
                Bắt đầu ngay <ArrowRight className="w-5 h-5" />
              </Button>
              <Button size="lg" variant="secondary" onClick={() => goTo("lookbook")}>
                <BookHeart className="w-5 h-5" /> Xem lookbook mẫu
              </Button>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
};
