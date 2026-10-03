import React, { useEffect, useState } from "react";
import { ensureFonts, FRAMES, loadImage, renderFrame, todayVN } from "../logic/frames";
import { Button } from "./ui";
import { Download, ImageDown, Loader2, Share2, X } from "lucide-react";

function download(href: string, filename: string) {
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  a.click();
}

/**
 * Chọn khung lookbook + chia sẻ / tải về.
 * inModal: trong hộp nổi thì danh sách khung tự cuộn; trên trang thường thì trải dài theo trang.
 */
export const FramePicker: React.FC<{ imageDataUrl: string; title: string; inModal?: boolean }> = ({
  imageDataUrl,
  title,
  inModal = false,
}) => {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [thumbs, setThumbs] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState(FRAMES[0].id);
  const [preview, setPreview] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  const [shareNote, setShareNote] = useState<string | null>(null);
  const info = { title, date: todayVN() };

  // tải ảnh + font rồi dựng ảnh thu nhỏ cho mọi khung
  useEffect(() => {
    let alive = true;
    Promise.all([loadImage(imageDataUrl), ensureFonts()]).then(([image]) => {
      if (!alive) return;
      setImg(image);
      const next: Record<string, string> = {};
      for (const f of FRAMES) next[f.id] = renderFrame(f, image, info, 0.22).toDataURL("image/jpeg", 0.85);
      setThumbs(next);
    });
    return () => {
      alive = false;
    };
  }, [imageDataUrl]);

  useEffect(() => {
    if (!img) return;
    const frame = FRAMES.find((f) => f.id === selected)!;
    setPreview(renderFrame(frame, img, info, 0.5).toDataURL("image/jpeg", 0.9));
  }, [img, selected]);

  const downloadFramed = () => {
    if (!img) return;
    const frame = FRAMES.find((f) => f.id === selected)!;
    download(renderFrame(frame, img, info, 1).toDataURL("image/png"), `viet-phuc-remix-${frame.id}.png`);
  };

  /**
   * Chia sẻ thẳng qua ứng dụng trên máy (Zalo, Messenger, Instagram...) bằng Web Share API.
   * Ảnh không gửi lên máy chủ nào. Máy không hỗ trợ thì sao chép ảnh, không được nữa thì tải về.
   */
  const shareFramed = async () => {
    if (!img) return;
    const frame = FRAMES.find((f) => f.id === selected)!;
    const canvas = renderFrame(frame, img, info, 1);
    setSharing(true);
    setShareNote(null);
    try {
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
      if (!blob) throw new Error("no-blob");
      const file = new File([blob], `viet-phuc-remix-${frame.id}.jpg`, { type: "image/jpeg" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: info.title, text: `Mình vừa mặc thử ${info.title} trên Việt Phục Remix` });
        return;
      }
      if (navigator.clipboard && "ClipboardItem" in window) {
        const png = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
        if (png) {
          await navigator.clipboard.write([new ClipboardItem({ "image/png": png })]);
          setShareNote("Đã sao chép ảnh. Mở Zalo, Messenger... rồi dán (Ctrl+V) để gửi.");
          return;
        }
      }
      throw new Error("unsupported");
    } catch (err: any) {
      if (err?.name === "AbortError") return; // người dùng tự đóng bảng chia sẻ
      download(canvas.toDataURL("image/jpeg", 0.92), `viet-phuc-remix-${frame.id}.jpg`);
      setShareNote("Máy này chưa hỗ trợ chia sẻ trực tiếp, ảnh đã được tải về để bạn gửi.");
    } finally {
      setSharing(false);
    }
  };

  const previewWidth = inModal ? "max-w-[calc(62vh*0.8)]" : "max-w-md";

  return (
    <div
      className={
        inModal
          ? "flex-1 min-h-0 overflow-y-auto md:overflow-hidden grid md:grid-cols-[1fr_1.1fr] md:grid-rows-[minmax(0,1fr)] gap-6 px-5 sm:px-7 py-5"
          : "grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-6 items-start"
      }
    >
      <div className={inModal ? "md:self-center" : "lg:sticky lg:top-24"}>
        <div className={`aspect-4/5 w-full ${previewWidth} mx-auto rounded-2xl overflow-hidden bg-black/40 border border-white/10 shadow-2xl shadow-black/60`}>
          {preview ? (
            <img src={preview} alt="Xem trước khung" className="w-full h-full object-contain" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm text-muc-nhat">Đang dựng khung…</div>
          )}
        </div>
        <div className={`grid grid-cols-2 gap-2 mt-4 ${previewWidth} mx-auto`}>
          <Button className="col-span-2" onClick={shareFramed} disabled={!img || sharing}>
            {sharing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />} Chia sẻ
          </Button>
          <Button variant="secondary" className="!px-3" onClick={downloadFramed} disabled={!img}>
            <Download className="w-4 h-4" /> Tải có khung
          </Button>
          <Button variant="secondary" className="!px-3" onClick={() => download(imageDataUrl, "viet-phuc-remix-goc.jpg")}>
            <ImageDown className="w-4 h-4" /> Tải ảnh gốc
          </Button>
        </div>
        {shareNote && <p className={`text-xs text-nghe text-center mt-2 ${previewWidth} mx-auto`}>{shareNote}</p>}
      </div>

      <div className={inModal ? "md:h-full md:overflow-y-auto md:-mr-3 md:pr-3" : ""}>
        {!inModal && <h2 className="text-lg font-bold text-muc mb-3">Chọn khung ({FRAMES.length})</h2>}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 gap-3 content-start">
          {FRAMES.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setSelected(f.id)}
              aria-pressed={selected === f.id}
              className={`min-w-0 rounded-xl overflow-hidden border-2 text-left cursor-pointer transition-colors ${
                selected === f.id ? "border-nghe shadow-lg shadow-nghe/20" : "border-transparent hover:border-white/20"
              }`}
            >
              <div className="aspect-4/5 bg-white/5">
                {thumbs[f.id] && <img src={thumbs[f.id]} alt={f.name} className="w-full h-full object-cover" />}
              </div>
              <p className={`text-xs px-1.5 py-1.5 font-medium leading-tight ${selected === f.id ? "text-nghe" : "text-muc"}`}>{f.name}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

/** Hộp nổi chọn khung (dùng ở màn Lookbook) */
export const FrameStudio: React.FC<{ imageDataUrl: string; title: string; onClose: () => void }> = ({
  imageDataUrl,
  title,
  onClose,
}) => (
  <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6" onClick={onClose}>
    <div
      className="glass border border-white/10 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl shadow-black/60"
      onClick={(e) => e.stopPropagation()}
      role="dialog"
      aria-label="Chọn khung ảnh"
    >
      {/* tiêu đề đứng yên, chỉ phần dưới cuộn */}
      <div className="flex items-center justify-between gap-4 px-5 sm:px-7 pt-5 sm:pt-6 pb-4 border-b border-white/5">
        <div className="min-w-0">
          <h2 className="text-2xl font-bold text-muc">Đóng khung lookbook</h2>
          <p className="text-sm text-muc-nhat">Chọn 1 trong {FRAMES.length} khung, hoặc tải ảnh gốc không khung.</p>
        </div>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 cursor-pointer shrink-0" aria-label="Đóng">
          <X className="w-5 h-5" />
        </button>
      </div>
      <FramePicker imageDataUrl={imageDataUrl} title={title} inModal />
    </div>
  </div>
);
