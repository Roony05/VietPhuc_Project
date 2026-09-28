/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { AnimatePresence, motion } from "motion/react";
import { AppProvider, useApp } from "./state/AppContext";
import { Header } from "./components/Header";
import { HomeScreen } from "./screens/HomeScreen";
import { FilterScreen } from "./screens/FilterScreen";
import { RecommendScreen } from "./screens/RecommendScreen";
import { GalleryScreen } from "./screens/GalleryScreen";
import { StudioScreen } from "./screens/StudioScreen";
import { LookbookScreen } from "./screens/LookbookScreen";

function AppContent() {
  const { screen } = useApp();

  const screens = {
    home: <HomeScreen />,
    filter: <FilterScreen />,
    recommend: <RecommendScreen />,
    gallery: <GalleryScreen />,
    studio: <StudioScreen />,
    lookbook: <LookbookScreen />,
  };

  return (
    <div className="min-h-screen flex flex-col overflow-x-clip">
      <Header />
      <main className="flex-1 w-full">
        {/* chuyển màn mờ dần như cắt cảnh phim */}
        <AnimatePresence mode="wait">
          <motion.div
            key={screen}
            initial={{ opacity: 0, filter: "blur(6px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(6px)" }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            {screens[screen] ?? <HomeScreen />}
          </motion.div>
        </AnimatePresence>
      </main>
      <footer className="border-t border-white/5 py-8 px-4 text-center text-xs text-muc-nhat">
        <p className="font-display italic text-sm text-muc mb-1">Việt Phục Remix</p>
        Thông tin văn hóa do đội tổng hợp và ghi nguồn · Ảnh thử đồ là ảnh minh họa do AI tạo
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
