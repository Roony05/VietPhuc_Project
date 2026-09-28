import React from "react";
import { useApp } from "../state/AppContext";
import { Sparkles, Compass, Grid, ArrowRight } from "lucide-react";

export const HomeScreen: React.FC = () => {
  const { goTo } = useApp();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
      {/* Hero Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 border border-red-200/60 text-red-800 text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5 text-red-600" />
          <span>Thời trang di sản phong cách thế hệ mới</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-stone-900 tracking-tight font-serif mb-4 leading-tight">
          Việt Phục Remix
        </h1>
        <p className="text-base text-stone-600 leading-relaxed">
          Khám phá và phối trang phục truyền thống Việt Nam (áo dài, áo ngũ thân, áo tứ thân, áo bà ba...) 
          theo phong cách Gen Z năng động và trải nghiệm thử đồ AI trực quan.
        </p>
      </div>

      {/* 2 Main Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {/* Cách 1: Gợi ý cho tôi */}
        <button
          onClick={() => goTo("filter")}
          className="group relative p-7 rounded-2xl bg-gradient-to-b from-[#FFFDF9] to-[#FBF7F0] border-2 border-[#E7DECD] hover:border-[#991B1B] text-left transition-all duration-200 shadow-sm hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between"
        >
          <div>
            <div className="w-13 h-13 rounded-2xl bg-red-100/80 text-[#991B1B] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-inner">
              <Compass className="w-7 h-7" />
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-red-700 mb-1">
              Cách 1 • Cá nhân hóa
            </div>
            <h2 className="text-2xl font-bold text-stone-900 mb-2 font-serif group-hover:text-[#991B1B] transition-colors">
              Gợi ý cho tôi
            </h2>
            <p className="text-sm text-stone-600 leading-relaxed mb-6">
              Chọn sự kiện, phong cách, màu sắc và dáng người. Hệ thống sẽ chọn lọc và gợi ý tối đa 3 bộ đồ phù hợp nhất với bạn.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 text-sm font-bold text-[#991B1B] group-hover:translate-x-1 transition-transform">
            <span>Bắt đầu chọn lọc</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </button>

        {/* Cách 2: Tự chọn mẫu */}
        <button
          onClick={() => goTo("gallery")}
          className="group relative p-7 rounded-2xl bg-gradient-to-b from-[#FFFDF9] to-[#FBF7F0] border-2 border-[#E7DECD] hover:border-amber-600 text-left transition-all duration-200 shadow-sm hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between"
        >
          <div>
            <div className="w-13 h-13 rounded-2xl bg-amber-100/80 text-amber-800 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-inner">
              <Grid className="w-7 h-7" />
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-amber-800 mb-1">
              Cách 2 • Tự do khám phá
            </div>
            <h2 className="text-2xl font-bold text-stone-900 mb-2 font-serif group-hover:text-amber-800 transition-colors">
              Tự chọn mẫu
            </h2>
            <p className="text-sm text-stone-600 leading-relaxed mb-6">
              Khám phá toàn bộ danh mục cổ phục Việt Nam từ Áo dài, Áo ngũ thân đến Áo tấc và chọn ngay bộ đồ bạn yêu thích.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 text-sm font-bold text-amber-800 group-hover:translate-x-1 transition-transform">
            <span>Mở thư viện mẫu</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </button>
      </div>
    </div>
  );
};
