import React, { useEffect, useRef, useState } from "react";
import { useApp } from "../state/AppContext";
import { outfits } from "../data/outfits";
import { avatars } from "../data/avatars";
import { ageRangeLabels, colorLabels, eventLabels, garmentTypeLabels, styleLabels } from "../data/labels";
import { fileToCompressedDataUrl, urlToDataUrl } from "../logic/imageUtils";
import { saveLookbookItem } from "../logic/lookbookStorage";
import { getAiStatus, tryOnOutfit } from "../services/tryOn";
import { getPersonality, PersonalityTip } from "../services/geminiText";
import { MAX_GENERATIONS_PER_SESSION } from "../config";
import { ImageWithFallback } from "../components/ImageWithFallback";
import { CultureCard } from "../components/CultureCard";
import { LoadingOverlay } from "../components/LoadingOverlay";
import { ErrorBox } from "../components/ErrorBox";
import { Button, Card, PageTitle, Tag } from "../components/ui";
import { ArrowLeft, BookmarkPlus, Check, Frame, Layers, Upload, Wand2, X } from "lucide-react";
import { FrameStudio } from "../components/FrameStudio";

export const StudioScreen: React.FC = () => {
  const {
    selectedOutfitId,
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
  const [status, setStatus] = useState<{ tryOn: boolean; tips: boolean } | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [viewIndex, setViewIndex] = useState<number | null>(null);
  const [aiTips, setAiTips] = useState<PersonalityTip | null>(null);
  const [aiTipsLoading, setAiTipsLoading] = useState(false);
  const [note, setNote] = useState("");
  const [showFrames, setShowFrames] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ ok: boolean; message: string } | null>(null);

  const outfit = outfits.find((o) => o.id === selectedOutfitId);

  useEffect(() => {
    getAiStatus().then(setStatus);
  }, []);

  // Gemini "bói" bí mật tính cách mỗi khi đổi bộ đồ (server có câu dự phòng nên luôn có nội dung)
  useEffect(() => {
    if (!outfit) return;
    let cancelled = false;
    setAiTipsLoading(true);
    const gender = outfit.gender !== "unisex" ? outfit.gender : filters.gender;
    getPersonality({
      gender: gender === "nam" || gender === "nu" ? gender : null,
      garmentType: outfit.garmentType,
      garmentLabel: garmentTypeLabels[outfit.garmentType],
      colorLabel: outfit.colors[0] ? colorLabels[outfit.colors[0]].label : null,
      eventLabel: filters.event ? eventLabels[filters.event] : null,
      styleLabels: filters.styles.map((s) => styleLabels[s]),
      ageRangeLabel: filters.ageRange ? ageRangeLabels[filters.ageRange] : null,
      heightCm: filters.heightCm,
      weightKg: filters.weightKg,
    })
      .then((tip) => !cancelled && setAiTips(tip))
      .catch(() => !cancelled && setAiTips(null))
      .finally(() => !cancelled && setAiTipsLoading(false));
    return () => {
      cancelled = true;
    };
  }, [outfit?.id]);

  if (!outfit) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold text-muc mb-3">Bạn chưa chọn bộ đồ</h1>
        <p className="text-muc-nhat mb-8">Chọn một bộ trong thư viện hoặc để app gợi ý nhé.</p>
        <Button onClick={() => goTo("gallery")}>Mở thư viện</Button>
      </div>
    );
  }

  const activeIndex = viewIndex !== null && viewIndex < history.length ? viewIndex : history.length - 1;
  const activeImage = history.length > 0 ? history[activeIndex] : null;
  const remaining = Math.max(0, MAX_GENERATIONS_PER_SESSION - generationCount);
  const personIsResult = Boolean(personImageDataUrl && history.some((h) => h.dataUrl === personImageDataUrl));
  const sortedAvatars = [...avatars].sort((a) => (a.gender === outfit.gender ? -1 : 1));

  const backToChoose = () => goTo(filters.event ? "recommend" : "gallery");

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setPhotoError(null);
    try {
      setPersonImageDataUrl(await fileToCompressedDataUrl(file));
    } catch (err: any) {
      setPhotoError(err.message || "Không đọc được ảnh này.");
    }
  };

  const pickAvatar = async (url: string) => {
    setPhotoError(null);
    try {
      setPersonImageDataUrl(await urlToDataUrl(url));
    } catch {
      setPhotoError("Không tải được ảnh người mẫu.");
    }
  };

  const handleTryOn = async () => {
    if (!personImageDataUrl) return;
    if (remaining <= 0) {
      setGenerateError(`Bạn đã dùng hết ${MAX_GENERATIONS_PER_SESSION} lượt ghép ảnh của phiên này.`);
      return;
    }
    setGenerateError(null);
    setSaveStatus(null);
    setIsGenerating(true);
    try {
      let outfitDataUrl: string;
      try {
        outfitDataUrl = await urlToDataUrl(outfit.image);
      } catch {
        throw new Error("Bộ đồ này chưa có ảnh trong thư viện nên chưa ghép được.");
      }
      const dataUrl = await tryOnOutfit({
        personDataUrl: personImageDataUrl,
        outfitDataUrl,
        garmentType: outfit.garmentType,
      });
      addGeneratedImage({ id: `gen-${Date.now()}`, dataUrl, instruction: outfit.name, createdAt: Date.now() });
      incrementGenerationCount();
      setViewIndex(null);
    } catch (err: any) {
      setGenerateError(err.message || "Ghép ảnh không thành công. Vui lòng thử lại.");
    } finally {
      setIsGenerating(false);
    }
  };



  const saveToLookbook = async () => {
    if (!activeImage) return;
    try {
      await saveLookbookItem({
        id: `look-${Date.now()}`,
        outfitId: outfit.id,
        imageDataUrl: activeImage.dataUrl,
        note: note.trim(),
        createdAt: Date.now(),
      });
      setNote("");
      setSaveStatus({ ok: true, message: "Đã lưu vào lookbook" });
    } catch (err: any) {
      setSaveStatus({ ok: false, message: err.message || "Không lưu được." });
    }
  };

  // Lấy ảnh vừa ghép làm ảnh người, rồi chọn bộ khác để phối tiếp
  const continueFromImage = () => {
    if (!activeImage) return;
    setPersonImageDataUrl(activeImage.dataUrl);
    backToChoose();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {showFrames && activeImage && (
        <FrameStudio imageDataUrl={activeImage.dataUrl} title={outfit.name} onClose={() => setShowFrames(false)} />
      )}
      {isGenerating && <LoadingOverlay message="Máy chủ đang ghép ảnh, thường mất 30–90 giây. Bạn đừng tắt trang nhé." />}

      <PageTitle
        eyebrow="Bước 3 / 3"
        title="Phòng thử đồ"
        description="Chọn ảnh của bạn rồi bấm Ghép ảnh. Có ảnh rồi thì tải về, hoặc lấy ảnh đó để thử tiếp bộ khác."
        action={
          <Button variant="secondary" onClick={backToChoose}>
            <ArrowLeft className="w-4 h-4" /> Đổi bộ khác
          </Button>
        }
      />

      {status && !status.tryOn && (
        <div className="mb-6 p-4 rounded-2xl bg-nghe-nhat border border-nghe/30 text-sm text-muc">
          Máy chủ chưa có <strong>HF_TOKEN</strong> nên chưa ghép ảnh được. Hãy dán token Hugging Face vào file{" "}
          <code>.env</code> rồi khởi động lại.
        </div>
      )}

      <div className="grid lg:grid-cols-[380px_1fr] gap-6 items-start">
        {/* CỘT TRÁI: bộ đồ + ảnh của bạn */}
        <div className="space-y-4">
          <Card className="p-4 flex items-center gap-4">
            <ImageWithFallback src={outfit.image} alt={outfit.name} className="w-16 h-20 rounded-2xl shrink-0 spotlight" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-son uppercase tracking-wider">
                {garmentTypeLabels[outfit.garmentType]}
              </p>
              <h2 className="text-lg font-bold text-muc truncate">{outfit.name}</h2>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-muc">Ảnh của bạn</h2>
              {personImageDataUrl && (
                <button
                  onClick={() => setPersonImageDataUrl(null)}
                  className="inline-flex items-center gap-1 text-sm text-muc-nhat hover:text-son cursor-pointer"
                >
                  <X className="w-4 h-4" /> Bỏ ảnh
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleUpload}
              className="hidden"
            />

            {personImageDataUrl ? (
              <div className="relative aspect-3/4 rounded-2xl overflow-hidden bg-kem">
                <img src={personImageDataUrl} alt="Ảnh của bạn" className="w-full h-full object-cover" />
                {personIsResult && (
                  <div className="absolute top-3 left-3">
                    <Tag tone="light">Ảnh vừa ghép</Tag>
                  </div>
                )}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full bg-white/90 text-sm font-semibold text-[#2b2118] hover:bg-white cursor-pointer"
                >
                  Đổi ảnh
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full aspect-4/3 rounded-2xl border-2 border-dashed border-vien hover:border-son bg-kem flex flex-col items-center justify-center gap-2 text-center p-4 transition-colors cursor-pointer"
                >
                  <span className="w-12 h-12 rounded-full bg-son-nhat text-son flex items-center justify-center">
                    <Upload className="w-5 h-5" />
                  </span>
                  <span className="font-semibold text-muc">Tải ảnh toàn thân lên</span>
                  <span className="text-xs text-muc-nhat">Đứng thẳng, đủ sáng, nền gọn · JPG, PNG, WEBP</span>
                </button>

                <p className="text-sm text-muc-nhat mt-4 mb-2">Hoặc dùng người mẫu có sẵn</p>
                <div className="grid grid-cols-2 gap-2">
                  {sortedAvatars.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => pickAvatar(a.image)}
                      className="flex items-center gap-2 p-2 rounded-2xl border border-vien hover:border-son/50 text-left cursor-pointer"
                    >
                      <ImageWithFallback src={a.image} alt={a.name} className="w-10 h-12 rounded-xl shrink-0" />
                      <span className="text-sm font-medium text-muc">{a.name}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {photoError && <p className="text-sm text-son mt-3">{photoError}</p>}
            <p className="text-xs text-muc-nhat mt-4">
              Ảnh chỉ dùng để tạo kết quả, không lưu trên máy chủ của ứng dụng.
            </p>
          </Card>

          <Button
            size="lg"
            className="w-full"
            disabled={!personImageDataUrl || isGenerating || status?.tryOn === false}
            onClick={handleTryOn}
          >
            <Wand2 className="w-5 h-5" /> Ghép ảnh
          </Button>
          <p className="text-center text-xs text-muc-nhat">
            Còn {remaining}/{MAX_GENERATIONS_PER_SESSION} lượt ghép trong phiên này
          </p>
        </div>

        {/* CỘT PHẢI: kết quả */}
        <div className="space-y-4">
          {generateError && <ErrorBox message={generateError} onRetry={personImageDataUrl ? handleTryOn : undefined} />}

          <Card className="p-5">
            {activeImage ? (
              <div className="grid md:grid-cols-[1fr_220px] gap-5">
                <div className="relative aspect-3/4 rounded-2xl overflow-hidden bg-kem">
                  <img src={activeImage.dataUrl} alt="Ảnh thử đồ" className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3">
                    <Tag>Ảnh minh họa AI</Tag>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <h2 className="text-lg font-bold text-muc">Ảnh của bạn đây!</h2>
                  <Button onClick={() => setShowFrames(true)}>
                    <Frame className="w-4 h-4" /> Đóng khung & tải về
                  </Button>
                  <Button variant="secondary" onClick={continueFromImage}>
                    <Layers className="w-4 h-4" /> Phối tiếp bộ khác
                  </Button>
                  <p className="text-xs text-muc-nhat -mt-1">Dùng ảnh này làm ảnh gốc rồi chọn bộ khác để thử.</p>

                  <div className="border-t border-vien pt-3 mt-1 space-y-2">
                    <input
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      maxLength={80}
                      placeholder="Ghi chú (không bắt buộc)"
                      className="w-full px-3 py-2 text-sm rounded-xl border border-vien bg-kem focus:outline-none focus:border-son"
                    />
                    <Button variant="jade" className="w-full" onClick={saveToLookbook}>
                      <BookmarkPlus className="w-4 h-4" /> Lưu vào lookbook
                    </Button>
                    {saveStatus && (
                      <p className={`text-xs ${saveStatus.ok ? "text-ngoc" : "text-son"}`}>
                        {saveStatus.ok && <Check className="w-3.5 h-3.5 inline mr-1" />}
                        {saveStatus.message}
                        {saveStatus.ok && (
                          <button onClick={() => goTo("lookbook")} className="underline ml-1 cursor-pointer">
                            Xem
                          </button>
                        )}
                      </p>
                    )}
                  </div>

                  {history.length > 1 && (
                    <div className="border-t border-vien pt-3 mt-auto">
                      <p className="text-xs text-muc-nhat mb-2">Các ảnh đã ghép</p>
                      <div className="flex flex-wrap gap-2">
                        {history.map((h, i) => (
                          <button
                            key={h.id}
                            onClick={() => setViewIndex(i)}
                            title={h.instruction}
                            className={`w-12 h-16 rounded-lg overflow-hidden border-2 cursor-pointer ${
                              i === activeIndex ? "border-son" : "border-transparent opacity-70 hover:opacity-100"
                            }`}
                          >
                            <img src={h.dataUrl} alt={h.instruction} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="aspect-4/3 md:aspect-video rounded-2xl border-2 border-dashed border-vien bg-kem flex flex-col items-center justify-center text-center p-6">
                <Wand2 className="w-8 h-8 text-muc-nhat mb-3" />
                <p className="font-semibold text-muc">Ảnh thử đồ sẽ hiện ở đây</p>
                <p className="text-sm text-muc-nhat mt-1 max-w-xs">
                  Chọn ảnh của bạn ở bên trái rồi bấm “Ghép ảnh”.
                </p>
              </div>
            )}
          </Card>

          <CultureCard
            outfit={outfit}
            aiTips={aiTips}
            aiTipsLoading={aiTipsLoading}
            avatarGender={outfit.gender !== "unisex" ? outfit.gender : filters.gender === "nam" || filters.gender === "nu" ? filters.gender : null}
            avatarAge={filters.ageRange}
          />
        </div>
      </div>
    </div>
  );
};
