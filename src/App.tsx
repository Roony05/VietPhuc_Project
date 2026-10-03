/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AnimatePresence, motion } from "motion/react";
import { AppProvider, useApp } from "./state/AppContext";
import { Header } from "./components/Header";
import { HomeScreen } from "./screens/HomeScreen";
import { FilterScreen } from "./screens/FilterScreen";
import { RecommendScreen } from "./screens/RecommendScreen";
import { GalleryScreen } from "./screens/GalleryScreen";
import { StudioScreen } from "./screens/StudioScreen";
import { ResultScreen } from "./screens/ResultScreen";
import { FinishScreen } from "./screens/FinishScreen";
import { LookbookScreen } from "./screens/LookbookScreen";
import { ProfileScreen } from "./screens/ProfileScreen";

function AppContent() {
  const { screen } = useApp();

  const screens = {
    home: <HomeScreen />,
    filter: <FilterScreen />,
    recommend: <RecommendScreen />,
    gallery: <GalleryScreen />,
    studio: <StudioScreen />,
    result: <ResultScreen />,
    finish: <FinishScreen />,
    lookbook: <LookbookScreen />,
    profile: <ProfileScreen />,
  };

  return (
    <div className="min-h-screen flex flex-col overflow-x-clip">
      <Header />
      <main className="flex-1 w-full pb-16 md:pb-0">
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
      <footer className="border-t border-white/5 py-8 px-4 mb-16 md:mb-0 text-center text-xs text-muc-nhat">
        <p className="font-display italic text-sm text-muc mb-1">Việt Phục Remix</p>
        Mặc Việt phục, chất theo cách của bạn
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
