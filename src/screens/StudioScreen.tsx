import React, { useState, useRef, useEffect } from "react";
import { useApp } from "../state/AppContext";
import { outfits } from "../data/outfits";
import { accessories } from "../data/accessories";
import { avatars } from "../data/avatars";
import {
  garmentTypeLabels,
  genderLabels,
  eventLabels,
  styleLabels,
  ageRangeLabels,
  ruleLevelLabels,
} from "../data/labels";
import { getAccessoryLevel } from "../logic/accessoryRules";
import {
  fileToCompressedDataUrl,
  urlToDataUrl,
} from "../logic/imageUtils";
import { tryOnOutfit, editImage } from "../services/geminiImage";
import { checkUserRequest, getStylingTips, StylingTips } from "../services/geminiText";
import { saveLookbookItem } from "../logic/lookbookStorage";
import { MAX_GENERATIONS_PER_SESSION } from "../config";
import { GarmentType, RuleLevel } from "../types";
import { ImageWithFallback } from "../components/ImageWithFallback";
import { AccessoryChip } from "../components/AccessoryChip";
import { CultureCard } from "../components/CultureCard";
import { LoadingOverlay } from "../components/LoadingOverlay";
import { ErrorBox } from "../components/ErrorBox";
import {
  Sparkles,
  Upload,
  User,
  Trash2,
  RefreshCw,
  Download,
  AlertCircle,
  Wand2,
  ArrowLeft,
  ChevronRight,
  RotateCcw,
  Send,
  AlertTriangle,
  XCircle,
  BookmarkPlus,
  Check,
} from "lucide-react";

// Bảng tên tiếng Anh cho garmentNameEn theo đặc tả
const garmentEnglishMap: Record<GarmentType, string> = {
  ao_dai: "Vietnamese ao dai",
  ao_dai_cach_tan: "modern Vietnamese ao dai (cach tan)",
  ao_tu_than: "Vietnamese ao tu than four-panel dress",
  ao_ngu_than: "Vietnamese ao ngu than five-panel robe",
  ao_ba_ba: "Vietnamese ao ba ba",
  ao_tac: "Vietnamese ao tac ceremonial robe",
};

export const StudioScreen: React.FC = () => {
  const {
    selectedOutfitId,
    selectedAccessoryIds,
    toggleAccessoryId,
    personImageDataUrl,
    setPersonImageDataUrl,
    filters,
    history,
    addGeneratedImage,
    generationCount,
    incrementGenerationCount,
    goTo,
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Trạng thái cục bộ
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Đang ghép ảnh, khoảng 10–30 giây...");
  const [generateError, setGenerateError] = useState<string | null>(null);

  // Ảnh đang xem trong dải history (nếu null thì mặc định lấy ảnh cuối cùng)
  const [selectedHistoryIndex, setSelectedHistoryIndex] = useState<number | null>(null);

  // Ô nhập chỉnh sửa ảnh
  const [editPrompt, setEditPrompt] = useState("");
  const [blockMessage, setBlockMessage] = useState<string | null>(null);
  const [warnMessage, setWarnMessage] = useState<string | null>(null);
  const [pendingInstruction, setPendingInstruction] = useState<string | null>(null);

  // Lời khuyên AI cho Thẻ văn hóa
  const [aiTips, setAiTips] = useState<StylingTips | null>(null);
  const [aiTipsLoading, setAiTipsLoading] = useState(false);

  // Lưu lookbook
  const [lookbookNote, setLookbookNote] = useState("");
  const [lookbookStatus, setLookbookStatus] = useState<{ ok: boolean; message: string } | null>(null);

  // 1. Kiểm tra selectedOutfitId: nếu null thì báo chưa chọn bộ đồ
  const currentOutfit = outfits.find((o) => o.id === selectedOutfitId);

  // Gọi AI viết lời khuyên khi vào màn hình và 1 giây sau lần đổi phụ kiện cuối
  useEffect(() => {
    if (!currentOutfit) return;
    let cancelled = false;
    setAiTipsLoading(true);

    const timer = setTimeout(async () => {
      try {
        const tips = await getStylingTips({
          outfitName: currentOutfit.name,
          garmentTypeLabel: garmentTypeLabels[currentOutfit.garmentType],
          eventLabel: filters.event ? eventLabels[filters.event] : null,
          styleLabels: filters.styles.map((st) => styleLabels[st]),
          selectedAccessories: accessories
            .filter((acc) => selectedAccessoryIds.includes(acc.id))
            .map((acc) => {
              const { level, reason } = getAccessoryLevel(currentOutfit.garmentType, acc.id, filters.event);
              return { name: acc.name, levelLabel: ruleLevelLabels[level], reason };
            }),
          ageRangeLabel: filters.ageRange ? ageRangeLabels[filters.ageRange] : null,
          heightCm: filters.heightCm,
          weightKg: filters.weightKg,
        });
        if (!cancelled) setAiTips(tips);
      } catch (err) {
        console.warn("[StudioScreen] Không lấy được lời khuyên AI:", err);
        if (!cancelled) setAiTips(null);
      } finally {
        if (!cancelled) setAiTipsLoading(false);
      }
    }, 1000);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [currentOutfit?.id, selectedAccessoryIds.join(","), filters.event]);

  if (!currentOutfit) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold font-serif text-stone-900 mb-2">
          Bạn chưa chọn bộ đồ
        </h2>
        <p className="text-sm text-stone-600 mb-6">
          Vui lòng chọn một bộ cổ phục từ Thư viện mẫu hoặc Bộ lọc gợi ý để bắt đầu thử đồ trong Studio.
        </p>
        <button
          onClick={() => goTo("gallery")}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#991B1B] text-white font-semibold hover:bg-red-800 transition-colors shadow-sm cursor-pointer"
        >
          <span>Khám phá bộ sưu tập</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Xác định "ảnh đang xem"
  const activeImageIndex =
    selectedHistoryIndex !== null && selectedHistoryIndex < history.length
      ? selectedHistoryIndex
      : history.length > 0
      ? history.length - 1
      : null;

  const activeImage = activeImageIndex !== null ? history[activeImageIndex] : null;
  const remainingGenerations = Math.max(0, MAX_GENERATIONS_PER_SESSION - generationCount);

  // 2. Xử lý tải ảnh người dùng
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setIsProcessingImage(true);

    try {
      const compressedDataUrl = await fileToCompressedDataUrl(file);
      setPersonImageDataUrl(compressedDataUrl);
    } catch (err: any) {
      setUploadError(err.message || "Không thể xử lý ảnh tải lên.");
    } finally {
      setIsProcessingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // 3. Xử lý chọn người mẫu có sẵn
  const handleSelectAvatar = async (avatarUrl: string) => {
    setUploadError(null);
    setIsProcessingImage(true);
    try {
      const dataUrl = await urlToDataUrl(avatarUrl);
      setPersonImageDataUrl(dataUrl);
    } catch (err: any) {
      console.warn("Avatar url to dataUrl fallback:", err);
      try {
        const res = await fetch(avatarUrl);
        const blob = await res.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          setPersonImageDataUrl(reader.result as string);
        };
        reader.readAsDataURL(blob);
      } catch {
        setUploadError("Không thể tải ảnh người mẫu có sẵn.");
      }
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleClearPersonImage = () => {
    setPersonImageDataUrl(null);
    setUploadError(null);
  };

  // 4. Lọc phụ kiện: cùng giới tính của bộ đồ hoặc unisex
  const visibleAccessories = accessories.filter(
    (acc) => acc.gender === "unisex" || acc.gender === currentOutfit.gender
  );

  // 5. Danh sách avatar có sẵn: ưu tiên avatar cùng giới tính lên đầu
  const sortedAvatars = [...avatars].sort((a, b) => {
    if (a.gender === currentOutfit.gender && b.gender !== currentOutfit.gender) {
      return -1;
    }
    if (b.gender === currentOutfit.gender && a.gender !== currentOutfit.gender) {
      return 1;
    }
    return 0;
  });

  // Nút "Đổi bộ khác"
  const handleBackToSelect = () => {
    if (filters.event) {
      goTo("recommend");
    } else {
      goTo("gallery");
    }
  };

  // 6. Xử lý ghép ảnh lần đầu với AI
  const handleTryOn = async () => {
    if (generationCount >= MAX_GENERATIONS_PER_SESSION) {
      setGenerateError("Bạn đã dùng hết lượt tạo ảnh của phiên này (tối đa 10 lượt).");
      return;
    }

    if (!personImageDataUrl) {
      setUploadError("Vui lòng tải ảnh của bạn hoặc chọn người mẫu trước khi ghép.");
      return;
    }

    setGenerateError(null);
    setBlockMessage(null);
    setWarnMessage(null);
    setLoadingMessage("Đang ghép ảnh, khoảng 10–30 giây...");
    setIsGenerating(true);

    try {
      let outfitDataUrl = "";
      try {
        outfitDataUrl = await urlToDataUrl(currentOutfit.image);
      } catch (err) {
        console.warn("Tạo canvas placeholder cho bộ đồ:", err);
        const canvas = document.createElement("canvas");
        canvas.width = 400;
        canvas.height = 600;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "#FAF7F2";
          ctx.fillRect(0, 0, 400, 600);
          ctx.fillStyle = "#991B1B";
          ctx.font = "bold 24px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(currentOutfit.name, 200, 300);
        }
        outfitDataUrl = canvas.toDataURL("image/jpeg", 0.9);
      }

      const selectedAccObjects = accessories.filter((acc) =>
        selectedAccessoryIds.includes(acc.id)
      );

      const accessoryParams = await Promise.all(
        selectedAccObjects.map(async (acc) => {
          let accDataUrl: string | null = null;
          try {
            accDataUrl = await urlToDataUrl(acc.image);
          } catch {
            accDataUrl = null;
          }
          return {
            name: acc.name,
            promptEn: acc.promptEn,
            dataUrl: accDataUrl,
          };
        })
      );

      const garmentNameEn =
        garmentEnglishMap[currentOutfit.garmentType] || "Vietnamese traditional outfit";

      const resultDataUrl = await tryOnOutfit({
        personDataUrl: personImageDataUrl,
        outfitDataUrl,
        accessories: accessoryParams,
        garmentNameEn,
      });

      addGeneratedImage({
        id: `gen-${Date.now()}`,
        dataUrl: resultDataUrl,
        instruction: "Ghép lần đầu",
        createdAt: Date.now(),
      });
      incrementGenerationCount();
      // Chuyển tiêu điểm xem vào ảnh mới nhất
      setSelectedHistoryIndex(null);
    } catch (err: any) {
      console.error("Lỗi khi ghép ảnh:", err);
      setGenerateError(err.message || "Đã xảy ra lỗi khi ghép ảnh bằng AI. Vui lòng thử lại.");
    } finally {
      setIsGenerating(false);
    }
  };

  // 7. Thực hiện chỉnh sửa ảnh bằng AI (editImage)
  const executeEditImage = async (instruction: string) => {
    if (generationCount >= MAX_GENERATIONS_PER_SESSION) {
      setGenerateError("Bạn đã dùng hết lượt tạo ảnh của phiên này (tối đa 10 lượt).");
      return;
    }

    if (!activeImage) {
      setGenerateError("Chưa có ảnh nền tảng để chỉnh sửa.");
      return;
    }

    setGenerateError(null);
    setBlockMessage(null);
    setWarnMessage(null);
    setPendingInstruction(null);
    setLoadingMessage("Đang chỉnh sửa ảnh theo yêu cầu, khoảng 10–25 giây...");
    setIsGenerating(true);

    try {
      const resultDataUrl = await editImage(activeImage.dataUrl, instruction);

      addGeneratedImage({
        id: `gen-${Date.now()}`,
        dataUrl: resultDataUrl,
        instruction,
        createdAt: Date.now(),
      });
      incrementGenerationCount();
      setEditPrompt("");
      // Đặt xem ảnh mới nhất vừa tạo
      setSelectedHistoryIndex(null);
    } catch (err: any) {
      console.error("Lỗi khi chỉnh sửa ảnh:", err);
      setGenerateError(err.message || "Đã xảy ra lỗi khi chỉnh sửa ảnh bằng AI. Vui lòng thử lại.");
    } finally {
      setIsGenerating(false);
    }
  };

  // 8. Bấm nút "Tạo" từ ô yêu cầu chỉnh sửa
  const handleEditSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const instruction = editPrompt.trim();
    if (!instruction) return;

    // a) Kiểm tra lượt tạo còn lại
    if (generationCount >= MAX_GENERATIONS_PER_SESSION) {
      setGenerateError("Bạn đã dùng hết lượt tạo ảnh của phiên này.");
      return;
    }

    // Chuẩn bị danh sách quy tắc phụ kiện cho AI lọc
    const rulesForCheck: { accessoryName: string; level: RuleLevel; reason: string }[] =
      visibleAccessories.map((acc) => {
        const { level, reason } = getAccessoryLevel(
          currentOutfit.garmentType,
          acc.id,
          filters.event
        );
        return {
          accessoryName: acc.name,
          level,
          reason,
        };
      });

    setBlockMessage(null);
    setWarnMessage(null);
    setPendingInstruction(null);

    // b) Gọi checkUserRequest
    const checkResult = await checkUserRequest({
      request: instruction,
      garmentTypeLabel: garmentTypeLabels[currentOutfit.garmentType],
      eventLabel: filters.event ? eventLabels[filters.event] : null,
      rules: rulesForCheck,
    });

    // c) block: hiện message màu đỏ, không tạo ảnh
    if (checkResult.status === "block") {
      setBlockMessage(
        checkResult.message ||
          "Yêu cầu không phù hợp (hệ thống giữ nguyên nhận dạng cơ thể và khuôn mặt, không hỗ trợ chỉnh sửa nhạy cảm hoặc không liên quan)."
      );
      return;
    }

    // d) warn: hiện hộp màu cam với message và 2 nút "Vẫn tạo" / "Thôi"
    if (checkResult.status === "warn") {
      setWarnMessage(
        checkResult.message || "Phụ kiện này có thể chưa phù hợp với dịp lễ truyền thống."
      );
      setPendingInstruction(instruction);
      return;
    }

    // e) ok: gọi editImage
    await executeEditImage(instruction);
  };

  // Tải ảnh kết quả về máy (file PNG)
  const handleDownloadImage = (dataUrl: string) => {
    try {
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `viet-phuc-remix-${currentOutfit.id}-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      console.error("Lỗi khi tải ảnh:", e);
    }
  };

  // Lưu ảnh đang xem vào lookbook
  const handleSaveLookbook = async () => {
    if (!activeImage) return;
    setLookbookStatus(null);
    try {
      await saveLookbookItem({
        id: `look-${Date.now()}`,
        outfitId: currentOutfit.id,
        accessoryIds: selectedAccessoryIds,
        imageDataUrl: activeImage.dataUrl,
        note: lookbookNote.trim(),
        createdAt: Date.now(),
      });
      setLookbookNote("");
      setLookbookStatus({ ok: true, message: "Đã lưu ✓" });
    } catch (err: any) {
      setLookbookStatus({ ok: false, message: err.message || "Không lưu được lookbook." });
    }
  };

  // 4 gợi ý nhanh
  const quickSuggestions = [
    "Thêm nón lá",
    "Cầm quạt giấy",
    "Nền phố cổ Hội An",
    "Nền hoa sen",
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Loading Overlay khi AI đang xử lý */}
      {isGenerating && <LoadingOverlay message={loadingMessage} />}

      {/* Tiêu đề & thông tin chung */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#E7DECD]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-red-100 text-[#991B1B] flex items-center justify-center shrink-0">
              <Wand2 className="w-4 h-4" />
            </span>
            Phòng thử đồ AI
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Phối phụ kiện, gắn ảnh chân dung và sáng tạo phong cách cổ phục cùng Gemini
          </p>
        </div>

        <button
          onClick={handleBackToSelect}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-stone-300 text-stone-700 text-xs sm:text-sm font-medium hover:bg-stone-50 transition-colors self-start cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Đổi bộ khác</span>
        </button>
      </div>

      {/* Thông báo lỗi nếu có */}
      {generateError && (
        <div className="mb-6">
          <ErrorBox
            message={generateError}
            onRetry={generationCount < MAX_GENERATIONS_PER_SESSION ? handleTryOn : undefined}
          />
        </div>
      )}

      {/* BỐ CỤC CHÍNH: 2 CỘT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* CỘT TRÁI (7 CỘT): Điều khiển chọn ảnh & phụ kiện */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. BỘ ĐỒ ĐÃ CHỌN */}
          <div className="bg-[#FFFDF9] border border-[#E7DECD] rounded-2xl p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-16 h-20 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                  <ImageWithFallback
                    src={currentOutfit.image}
                    alt={currentOutfit.name}
                    fallbackTitle={currentOutfit.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#991B1B] bg-red-50 border border-red-200 px-2 py-0.5 rounded-full inline-block mb-1">
                    {garmentTypeLabels[currentOutfit.garmentType]}
                  </span>
                  <h3 className="text-base font-bold text-stone-900 font-serif">
                    {currentOutfit.name}
                  </h3>
                  <p className="text-xs text-stone-500">
                    Dành cho: {genderLabels[currentOutfit.gender]}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleBackToSelect}
                className="text-xs font-semibold text-[#991B1B] hover:text-red-900 underline underline-offset-4 cursor-pointer shrink-0"
              >
                Chọn mẫu khác
              </button>
            </div>
          </div>

          {/* 2. ẢNH CỦA BẠN */}
          <div className="bg-[#FFFDF9] border border-[#E7DECD] rounded-2xl p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900 flex items-center gap-2">
                <User className="w-4 h-4 text-[#991B1B]" />
                Ảnh của bạn
              </h3>
              {personImageDataUrl && (
                <button
                  type="button"
                  onClick={handleClearPersonImage}
                  className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-800 font-medium cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa ảnh</span>
                </button>
              )}
            </div>

            {uploadError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{uploadError}</span>
              </div>
            )}

            {personImageDataUrl ? (
              <div className="flex items-center gap-4 p-3 rounded-xl bg-stone-50 border border-stone-200">
                <div className="w-20 h-24 rounded-lg overflow-hidden bg-white shrink-0 border border-stone-300">
                  <img
                    src={personImageDataUrl}
                    alt="Ảnh người mẫu"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-stone-800">
                    Ảnh chân dung sẵn sàng
                  </div>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Hệ thống sẽ giữ trọn nét mặt, tư thế và tỷ lệ vóc dáng của bạn.
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2 inline-flex items-center gap-1 text-xs text-[#991B1B] font-medium hover:underline cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Thay ảnh khác</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/jpg"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessingImage}
                    className="w-full p-4 rounded-xl border-2 border-dashed border-[#C5B79F] hover:border-[#991B1B] bg-stone-50/50 hover:bg-stone-50 transition-colors flex flex-col items-center justify-center text-center cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-full bg-red-50 text-[#991B1B] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                      <Upload className="w-5 h-5" />
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-stone-800">
                      Tải ảnh của bạn lên
                    </span>
                    <span className="text-[11px] text-stone-400 mt-0.5">
                      Định dạng JPG, PNG, WEBP (tối đa 10MB)
                    </span>
                  </button>
                  <p className="text-[11px] text-stone-500 mt-2 italic text-center sm:text-left">
                    * Nên dùng ảnh toàn thân, đứng thẳng, đủ sáng. Ảnh chỉ dùng để tạo kết quả, không được lưu trên máy chủ.
                  </p>
                </div>

                <div className="pt-2 border-t border-stone-200">
                  <span className="text-xs font-semibold text-stone-700 block mb-2.5">
                    Hoặc chọn nhanh người mẫu thử nghiệm:
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    {sortedAvatars.map((avt) => (
                      <button
                        key={avt.id}
                        type="button"
                        onClick={() => handleSelectAvatar(avt.image)}
                        className="flex items-center gap-2.5 p-2 rounded-xl border border-stone-200 bg-white hover:border-[#991B1B] hover:bg-red-50/30 transition-all text-left cursor-pointer"
                      >
                        <div className="w-10 h-12 rounded-lg overflow-hidden bg-stone-100 shrink-0 border border-stone-100">
                          <ImageWithFallback
                            src={avt.image}
                            alt={avt.name}
                            fallbackTitle={avt.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-stone-800 truncate">
                            {avt.name}
                          </div>
                          <div className="text-[10px] text-stone-400">
                            Mẫu {genderLabels[avt.gender]}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3. PHỤ KIỆN */}
          <div className="bg-[#FFFDF9] border border-[#E7DECD] rounded-2xl p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#991B1B]" />
                Phụ kiện phối kèm ({selectedAccessoryIds.length})
              </h3>
              <span className="text-xs text-stone-400">Tùy chọn phối</span>
            </div>
            <p className="text-xs text-stone-500 mb-4">
              Mỗi phụ kiện được đánh giá mức độ phù hợp truyền thống hoặc phá cách theo dáng áo đã chọn:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {visibleAccessories.map((acc) => {
                const { level, reason } = getAccessoryLevel(
                  currentOutfit.garmentType,
                  acc.id,
                  filters.event
                );
                const isSelected = selectedAccessoryIds.includes(acc.id);

                return (
                  <AccessoryChip
                    key={acc.id}
                    accessory={acc}
                    level={level}
                    reason={reason}
                    selected={isSelected}
                    onToggle={toggleAccessoryId}
                  />
                );
              })}
            </div>
          </div>

          {/* 4. NÚT GHÉP ẢNH BAN ĐẦU */}
          <div className="pt-2">
            <button
              type="button"
              disabled={!personImageDataUrl || isGenerating}
              onClick={handleTryOn}
              className={`w-full py-4 px-6 rounded-2xl font-bold text-base flex items-center justify-center gap-2.5 transition-all shadow-md ${
                personImageDataUrl && !isGenerating
                  ? "bg-[#991B1B] text-white hover:bg-red-800 shadow-red-900/20 cursor-pointer active:scale-[0.99]"
                  : "bg-stone-200 text-stone-400 cursor-not-allowed shadow-none"
              }`}
            >
              <Wand2 className="w-5 h-5" />
              <span>{history.length > 0 ? "Ghép ảnh mới từ đầu" : "Ghép ảnh với AI"}</span>
            </button>

            {!personImageDataUrl ? (
              <p className="text-center text-xs text-amber-700 mt-2 font-medium">
                * Vui lòng tải ảnh của bạn hoặc chọn 1 người mẫu ở trên để mở khóa nút Ghép ảnh
              </p>
            ) : (
              <p className="text-center text-xs text-stone-500 mt-2">
                Còn <strong className="text-[#991B1B]">{remainingGenerations}</strong> lượt tạo ảnh trong phiên này
              </p>
            )}
          </div>
        </div>

        {/* CỘT PHẢI (5 CỘT): Khung kết quả, Ô yêu cầu chỉnh sửa & Thẻ văn hóa */}
        <div className="lg:col-span-5 space-y-6">
          {/* KHUNG KẾT QUẢ */}
          <div className="bg-[#FFFDF9] border border-[#E7DECD] rounded-2xl p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#991B1B]" />
                Kết quả thử đồ AI
              </h3>
              {activeImage && (
                <span className="text-[11px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  Ảnh đang xem #{((activeImageIndex ?? 0) + 1)}
                </span>
              )}
            </div>

            {activeImage ? (
              <div className="space-y-4">
                {/* Khung ảnh kết quả */}
                <div className="relative aspect-3/4 rounded-xl overflow-hidden bg-stone-900 border border-stone-200 shadow-sm group">
                  <img
                    src={activeImage.dataUrl}
                    alt="Kết quả thử đồ AI"
                    className="w-full h-full object-cover"
                  />
                  {/* Nhãn góc ảnh */}
                  <span className="absolute top-2.5 right-2.5 z-10 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-black/60 text-white backdrop-blur-xs border border-white/20">
                    Ảnh minh họa AI
                  </span>
                </div>

                {/* Dưới ảnh ghi thông tin & số lượt */}
                <div className="flex items-center justify-between text-xs text-stone-500 pt-1">
                  <span>
                    Còn <strong>{remainingGenerations}</strong> lượt tạo ảnh
                  </span>
                  <span className="text-[11px] text-stone-600 font-medium truncate max-w-[200px]" title={activeImage.instruction}>
                    {activeImage.instruction}
                  </span>
                </div>

                {/* DẢI ẢNH NHỎ TRONG HISTORY */}
                {history.length > 1 && (
                  <div className="pt-2">
                    <span className="text-[11px] font-semibold text-stone-600 block mb-1.5">
                      Lịch sử ảnh ({history.length}):
                    </span>
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
                      {history.map((item, index) => {
                        const isCurrentActive =
                          (activeImageIndex === null && index === history.length - 1) ||
                          activeImageIndex === index;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setSelectedHistoryIndex(index)}
                            className={`relative shrink-0 w-14 h-18 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                              isCurrentActive
                                ? "border-[#991B1B] ring-2 ring-red-200 scale-105"
                                : "border-stone-200 opacity-70 hover:opacity-100"
                            }`}
                          >
                            <img
                              src={item.dataUrl}
                              alt={`Phiên bản ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute bottom-0 inset-x-0 bg-black/70 text-white text-[9px] text-center font-bold">
                              #{index + 1}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Hàng nút "Tải ảnh về" và "Ghép lại" */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => handleDownloadImage(activeImage.dataUrl)}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-stone-300 text-stone-800 text-xs sm:text-sm font-semibold hover:bg-stone-50 transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Tải ảnh về</span>
                  </button>

                  <button
                    type="button"
                    disabled={isGenerating || remainingGenerations <= 0}
                    onClick={handleTryOn}
                    className={`inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                      remainingGenerations > 0 && !isGenerating
                        ? "bg-stone-800 text-white hover:bg-stone-900"
                        : "bg-stone-200 text-stone-400 cursor-not-allowed"
                    }`}
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Tạo lại từ đầu</span>
                  </button>
                </div>

                {/* LƯU VÀO LOOKBOOK */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={lookbookNote}
                      onChange={(e) => setLookbookNote(e.target.value)}
                      maxLength={80}
                      placeholder="Ghi chú ngắn (không bắt buộc)"
                      className="flex-1 min-w-0 px-3 py-2 text-xs rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#991B1B]/30"
                    />
                    <button
                      type="button"
                      onClick={handleSaveLookbook}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1F6F6A] text-white text-xs font-semibold hover:opacity-90 cursor-pointer shrink-0"
                    >
                      <BookmarkPlus className="w-4 h-4" />
                      <span>Lưu vào lookbook</span>
                    </button>
                  </div>
                  {lookbookStatus && (
                    <p className={`text-xs flex items-center gap-1 ${lookbookStatus.ok ? "text-emerald-700" : "text-red-700"}`}>
                      {lookbookStatus.ok && <Check className="w-3.5 h-3.5" />}
                      <span>{lookbookStatus.message}</span>
                      {lookbookStatus.ok && (
                        <button type="button" onClick={() => goTo("lookbook")} className="underline ml-1 cursor-pointer">
                          Xem lookbook
                        </button>
                      )}
                    </p>
                  )}
                </div>

                {/* Ô YÊU CẦU CHỈNH SỬA (CHỈ HIỆN KHI CÓ ÍT NHẤT 1 ẢNH TRONG HISTORY) */}
                <div className="mt-4 pt-4 border-t border-[#E7DECD] space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#991B1B]" />
                      <span>Bạn muốn thêm hoặc đổi gì?</span>
                    </label>
                    <span className="text-[10px] text-stone-400">
                      Sửa trên ảnh #{((activeImageIndex ?? 0) + 1)}
                    </span>
                  </div>

                  {/* Form nhập yêu cầu */}
                  <form onSubmit={handleEditSubmit} className="space-y-2">
                    <div className="relative">
                      <input
                        type="text"
                        value={editPrompt}
                        onChange={(e) => setEditPrompt(e.target.value)}
                        placeholder="Ví dụ: thêm quạt giấy, đổi nền thành phố cổ Hội An"
                        className="w-full pl-3.5 pr-20 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#991B1B]/30 focus:border-[#991B1B]"
                      />
                      <button
                        type="submit"
                        disabled={isGenerating || !editPrompt.trim() || remainingGenerations <= 0}
                        className={`absolute right-1.5 top-1.5 bottom-1.5 px-3.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                          !isGenerating && editPrompt.trim() && remainingGenerations > 0
                            ? "bg-[#991B1B] text-white hover:bg-red-800 shadow-2xs"
                            : "bg-stone-200 text-stone-400 cursor-not-allowed"
                        }`}
                      >
                        <Send className="w-3 h-3" />
                        <span>Tạo</span>
                      </button>
                    </div>

                    {/* 4 Nút gợi ý nhanh */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[11px] text-stone-400 mr-1">Gợi ý nhanh:</span>
                      {quickSuggestions.map((sug) => (
                        <button
                          key={sug}
                          type="button"
                          onClick={() => setEditPrompt(sug)}
                          className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-medium transition-colors cursor-pointer border border-stone-200"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  </form>

                  {/* Thông báo BLOCK màu đỏ */}
                  {blockMessage && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 flex items-start gap-2 animate-fadeIn">
                      <XCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                      <div className="flex-1">
                        <span className="font-bold">Yêu cầu bị từ chối: </span>
                        <span>{blockMessage}</span>
                      </div>
                    </div>
                  )}

                  {/* Cảnh báo WARN màu cam kèm nút "Vẫn tạo" / "Thôi" */}
                  {warnMessage && pendingInstruction && (
                    <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-950 space-y-2.5 animate-fadeIn">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                        <div className="flex-1">
                          <span className="font-bold">Lưu ý văn hóa: </span>
                          <span>{warnMessage}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setWarnMessage(null);
                            setPendingInstruction(null);
                          }}
                          className="px-3 py-1.5 rounded-lg border border-stone-300 text-stone-700 bg-white text-xs font-medium hover:bg-stone-50 cursor-pointer"
                        >
                          Thôi
                        </button>
                        <button
                          type="button"
                          onClick={() => executeEditImage(pendingInstruction)}
                          className="px-3.5 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold shadow-2xs cursor-pointer"
                        >
                          Vẫn tạo
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Khung trống khi chưa ghép */
              <div className="aspect-3/4 rounded-xl border-2 border-dashed border-[#E2D9C8] bg-[#FDFBF7] flex flex-col items-center justify-center p-6 text-center">
                <div className="w-14 h-14 rounded-full bg-[#F3ECE1] text-[#9E896A] flex items-center justify-center mb-3">
                  <Wand2 className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-semibold text-stone-700 mb-1">
                  Ảnh ghép sẽ hiện ở đây
                </h4>
                <p className="text-xs text-stone-400 max-w-xs leading-relaxed">
                  Sau khi tải ảnh người mẫu và bấm "Ghép ảnh với AI", ảnh tạo ra sẽ hiển thị tại khung này để bạn tinh chỉnh và tải về.
                </p>
                <div className="mt-4 text-[11px] font-medium text-stone-400">
                  Còn {remainingGenerations} lượt tạo ảnh trong phiên
                </div>
              </div>
            )}
          </div>

          {/* THẺ VĂN HÓA (100% TỪ DỮ LIỆU) */}
          <CultureCard
            outfit={currentOutfit}
            event={filters.event}
            selectedAccessoryIds={selectedAccessoryIds}
            aiTips={aiTips}
            aiTipsLoading={aiTipsLoading}
          />
        </div>
      </div>
    </div>
  );
};
