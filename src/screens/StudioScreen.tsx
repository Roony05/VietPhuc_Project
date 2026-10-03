import React, { useEffect, useRef, useState } from "react";
import { useApp } from "../state/AppContext";
import { outfits } from "../data/outfits";
import { avatars } from "../data/avatars";
import { colorLabels, garmentTypeLabels } from "../data/labels";
import { fileToCompressedDataUrl, urlToDataUrl } from "../logic/imageUtils";
import { getAiStatus, tryOnOutfit, TryOnBackground } from "../services/tryOn";
import { MAX_GENERATIONS_PER_SESSION } from "../config";
import { ImageWithFallback } from "../components/ImageWithFallback";
import { LoadingOverlay } from "../components/LoadingOverlay";
import { ErrorBox } from "../components/ErrorBox";
import { FlowHeader } from "../components/Flow";
import { Button, Card, PageTitle } from "../components/ui";
import { Image as ImageIcon, ImagePlus, Square, Upload, Wand2, X } from "lucide-react";

const BACKGROUND_OPTIONS: { id: TryOnBackground; label: string; hint: string; icon: React.FC<{ className?: string }> }[] = [
  { id: "original", label: "Giữ nền ảnh gốc", hint: "Thay đồ, giữ nguyên khung cảnh trong ảnh của bạn", icon: ImageIcon },
  { id: "white", label: "Nền trắng", hint: "Tách người ra nền trắng, hợp để in hoặc ghép khung", icon: Square },
];
const BACKGROUND_KEY = "vietphuc.tryOnBackground";

const loadBackground = (): TryOnBackground => {
  try {
    return localStorage.getItem(BACKGROUND_KEY) === "white" ? "white" : "original";
  } catch {
    return "original";
  }
};

/** Phòng thử đồ: chỉ có bộ trang phục + ảnh của bạn + nút Ghép ảnh. Ghép xong chuyển sang trang Kết quả. */
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
    setActiveImageId,
    goTo,
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<{ tryOn: boolean; tips: boolean } | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [background, setBackground] = useState<TryOnBackground>(loadBackground);

  const outfit = outfits.find((o) => o.id === selectedOutfitId);

  useEffect(() => {
    getAiStatus().then(setStatus);
  }, []);

  if (!outfit) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold text-muc mb-3">Bạn chưa chọn bộ đồ</h1>
        <p className="text-muc-nhat mb-8">Chọn một bộ trong thư viện hoặc để app gợi ý nhé.</p>
        <Button onClick={() => goTo("gallery")}>Mở thư viện</Button>
      </div>
    );
  }

  const remaining = Math.max(0, MAX_GENERATIONS_PER_SESSION - generationCount);
  const sortedAvatars = [...avatars].sort((a) => (a.gender === outfit.gender ? -1 : 1));
  const lastForOutfit = [...history].reverse().find((h) => h.outfitId === outfit.id);
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

  const chooseBackground = (id: TryOnBackground) => {
    setBackground(id);
    try {
      localStorage.setItem(BACKGROUND_KEY, id);
    } catch {
      // không lưu được thì thôi, lần sau về mặc định
    }
  };

  const handleTryOn = async () => {
    if (!personImageDataUrl) return;
    if (remaining <= 0) {
      setGenerateError(`Bạn đã dùng hết ${MAX_GENERATIONS_PER_SESSION} lượt ghép ảnh của phiên này.`);
      return;
    }
    setGenerateError(null);
    setIsGenerating(true);
    try {
      let outfitDataUrl: string;
      try {
        outfitDataUrl = await urlToDataUrl(outfit.image);
      } catch {
        throw new Error("Bộ đồ này chưa có ảnh trong thư viện nên chưa ghép được.");
      }
      const dataUrl = await tryOnOutfit({ personDataUrl: personImageDataUrl, outfitDataUrl, background });
      addGeneratedImage({ id: `gen-${Date.now()}`, outfitId: outfit.id, dataUrl, instruction: outfit.name, createdAt: Date.now() });
      incrementGenerationCount();
      goTo("result");
    } catch (err: any) {
      setGenerateError(err.message || "Ghép ảnh không thành công. Vui lòng thử lại.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <FlowHeader
        current={2}
        back={backToChoose}
        next={
          lastForOutfit
            ? {
                label: "Xem kết quả",
                onClick: () => {
                  setActiveImageId(lastForOutfit.id);
                  goTo("result");
                },
              }
            : undefined
        }
      />
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-10">
      {isGenerating && (
        <LoadingOverlay
          message="Thường mất 10–30 giây. Lần đầu trong ngày có thể tới 2 phút vì máy chủ cần khởi động, bạn đừng tắt trang nhé."
          gender={outfit.gender !== "unisex" ? outfit.gender : filters.gender}
          age={filters.ageRange}
        />
      )}
      <PageTitle title="Phòng thử đồ" description="Tải ảnh toàn thân của bạn hoặc chọn người mẫu, rồi bấm Ghép ảnh." />

      {status && !status.tryOn && (
        <div className="mb-6 p-4 rounded-2xl bg-nghe-nhat border border-nghe/30 text-sm text-muc">
          Máy chủ chưa cấu hình dịch vụ ghép ảnh. Hãy điền <strong>MODAL_TRYON_URL / KEY / SECRET</strong> vào file{" "}
          <code>.env</code> rồi khởi động lại.
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6 items-start">
        {/* BỘ TRANG PHỤC */}
        {/* điện thoại: thẻ ngang nhỏ để phần tải ảnh nằm ngay bên dưới; máy tính: ảnh lớn */}
        <Card className="overflow-hidden flex md:block">
          <div className="spotlight w-28 sm:w-36 md:w-full shrink-0 aspect-3/4 flex items-center justify-center">
            <ImageWithFallback src={outfit.image} alt={outfit.name} className="w-full h-full object-contain p-2 md:p-6" />
          </div>
          <div className="p-4 sm:p-5 min-w-0 self-center">
            <p className="text-xs font-semibold text-son uppercase tracking-wider">{garmentTypeLabels[outfit.garmentType]}</p>
            <h2 className="text-xl sm:text-2xl font-bold text-muc mt-1">{outfit.name}</h2>
            {outfit.colors[0] && (
              <p className="flex items-center gap-2 text-sm text-muc-nhat mt-2">
                <span className="w-4 h-4 rounded-full border border-white/30" style={{ backgroundColor: colorLabels[outfit.colors[0]].hex }} />
                Màu {colorLabels[outfit.colors[0]].label.toLowerCase()}
              </p>
            )}
          </div>
        </Card>

        {/* ẢNH CỦA BẠN */}
        <div className="space-y-4 min-w-0">
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

            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleUpload} className="hidden" />

            {personImageDataUrl ? (
              <div className="relative aspect-3/4 max-h-[60vh] mx-auto rounded-2xl overflow-hidden bg-kem">
                <img src={personImageDataUrl} alt="Ảnh của bạn" className="w-full h-full object-contain" />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 text-sm font-semibold text-[#2b2118] hover:bg-white cursor-pointer"
                >
                  <ImagePlus className="w-4 h-4" /> Đổi ảnh
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
                  <span className="text-xs text-muc-nhat">Đứng thẳng, đủ sáng, thấy rõ toàn thân · JPG, PNG, WEBP</span>
                </button>

                <p className="text-sm text-muc-nhat mt-4 mb-2">Hoặc dùng người mẫu có sẵn</p>
                <div className="grid grid-cols-2 gap-2">
                  {sortedAvatars.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => pickAvatar(a.image)}
                      className="min-w-0 flex items-center gap-2 p-2 rounded-2xl border border-vien hover:border-son/50 text-left cursor-pointer"
                    >
                      <ImageWithFallback src={a.image} alt={a.name} className="w-10 h-12 rounded-xl shrink-0" />
                      <span className="text-sm font-medium text-muc leading-tight">{a.name}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {photoError && <p className="text-sm text-son mt-3">{photoError}</p>}
            <p className="text-xs text-muc-nhat mt-4">Ảnh chỉ dùng để tạo kết quả, không lưu trên máy chủ của ứng dụng.</p>
          </Card>

          <Card className="p-5">
            <h2 className="text-lg font-bold text-muc mb-3">Kiểu nền</h2>
            <div role="radiogroup" aria-label="Kiểu nền" className="grid grid-cols-2 gap-2">
              {BACKGROUND_OPTIONS.map((o) => {
                const active = background === o.id;
                const Icon = o.icon;
                return (
                  <button
                    key={o.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => chooseBackground(o.id)}
                    className={`min-w-0 text-left p-3 rounded-2xl border-2 transition-colors cursor-pointer ${
                      active ? "border-son bg-son-nhat" : "border-vien hover:border-son/50"
                    }`}
                  >
                    <span className="flex items-center gap-2 text-sm font-semibold text-muc">
                      <Icon className={`w-4 h-4 shrink-0 ${active ? "text-son" : "text-muc-nhat"}`} /> {o.label}
                    </span>
                    <span className="block text-xs text-muc-nhat mt-1 leading-snug">{o.hint}</span>
                  </button>
                );
              })}
            </div>
          </Card>

          {generateError && <ErrorBox message={generateError} onRetry={personImageDataUrl ? handleTryOn : undefined} />}

          <Button size="lg" className="w-full" disabled={!personImageDataUrl || isGenerating || status?.tryOn === false} onClick={handleTryOn}>
            <Wand2 className="w-5 h-5" /> Ghép ảnh
          </Button>
          <p className="text-center text-xs text-muc-nhat">
            Còn {remaining}/{MAX_GENERATIONS_PER_SESSION} lượt ghép trong phiên này
          </p>
        </div>
      </div>

    </div>
    </>
  );
};
