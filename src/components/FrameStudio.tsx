import React, { useEffect, useState } from "react";
import { ensureFonts, FRAMES, loadImage, renderFrame, todayVN } from "../logic/frames";
import { Button } from "./ui";
import { Download, ImageDown, X } from "lucide-react";

function download(href: string, filename: string) {
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  a.click();
}

/** Hộp chọn khung lookbook: ghép ảnh thử đồ vào 1 trong 12 khung rồi tải về, hoặc tải ảnh gốc */
export const FrameStudio: React.FC<{ imageDataUrl: string; title: string; onClose: () => void }> = ({
  imageDataUrl,
  title,
  onClose,
}) => {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [thumbs, setThumbs] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState(FRAMES[0].id);
  const [preview, setPreview] = useState<string | null>(null);
  const info = { title, date: todayVN() };

  // tải ảnh + font rồi dựng ảnh thu nhỏ cho cả 12 khung
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

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6" onClick={onClose}>
      <div
        className="glass border border-white/10 rounded-3xl w-full max-w-5xl max-h-[92vh] overflow-y-auto p-5 sm:p-7 shadow-2xl shadow-black/60"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Chọn khung ảnh"
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-2xl font-bold text-muc">Đóng khung lookbook</h2>
            <p className="text-sm text-muc-nhat">Chọn 1 trong {FRAMES.length} khung, hoặc tải ảnh gốc không khung.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 cursor-pointer" aria-label="Đóng">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid md:grid-cols-[1fr_1.1fr] gap-6 items-start">
          <div>
            <div className="aspect-4/5 w-full max-w-[calc(62vh*0.8)] mx-auto rounded-2xl overflow-hidden bg-black/40 border border-white/10 shadow-2xl shadow-black/60">
              {preview ? (
                <img src={preview} alt="Xem trước khung" className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm text-muc-nhat">Đang dựng khung…</div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-2 mt-4 max-w-[calc(62vh*0.8)] mx-auto">
              <Button className="flex-1" onClick={downloadFramed} disabled={!img}>
                <Download className="w-4 h-4" /> Tải ảnh có khung
              </Button>
              <Button variant="secondary" className="flex-1" onClick={() => download(imageDataUrl, "viet-phuc-remix-goc.png")}>
                <ImageDown className="w-4 h-4" /> Tải ảnh gốc
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {FRAMES.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setSelected(f.id)}
                aria-pressed={selected === f.id}
                className={`rounded-xl overflow-hidden border-2 text-left cursor-pointer transition-colors ${
                  selected === f.id ? "border-nghe shadow-lg shadow-nghe/20" : "border-transparent hover:border-white/20"
                }`}
              >
                <div className="aspect-4/5 bg-white/5">
                  {thumbs[f.id] && <img src={thumbs[f.id]} alt={f.name} className="w-full h-full object-cover" />}
                </div>
                <p className={`text-xs px-1.5 py-1.5 font-medium ${selected === f.id ? "text-nghe" : "text-muc"}`}>{f.name}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
