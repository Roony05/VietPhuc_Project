/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
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

  const renderScreen = () => {
    switch (screen) {
      case "home":
        return <HomeScreen />;
      case "filter":
        return <FilterScreen />;
      case "recommend":
        return <RecommendScreen />;
      case "gallery":
        return <GalleryScreen />;
      case "studio":
        return <StudioScreen />;
      case "lookbook":
        return <LookbookScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-stone-900 flex flex-col font-sans selection:bg-[#991B1B] selection:text-white">
      <Header />
      <main className="flex-1 w-full">{renderScreen()}</main>
      <footer className="border-t border-[#E8DEC8] py-6 text-center text-xs text-stone-500 bg-[#FAF7F2]">
        <p className="font-serif font-medium text-stone-700">
          Việt Phục Remix — Phối cổ phục &amp; Thử đồ AI
        </p>
        <p className="text-[11px] text-stone-400 mt-1">
          Dự án gìn giữ và lan tỏa di sản văn hóa Việt Nam dành cho giới trẻ
        </p>
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
