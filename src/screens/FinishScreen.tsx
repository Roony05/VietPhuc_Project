import React, { useState } from "react";
import { useApp } from "../state/AppContext";
import { outfits } from "../data/outfits";
import { saveLookbookItem } from "../logic/lookbookStorage";
import { FramePicker } from "../components/FrameStudio";
import { FlowHeader } from "../components/Flow";
import { Button, Card, PageTitle } from "../components/ui";
import { BookmarkPlus, Check, Wand2 } from "lucide-react";

/** Trang Hoàn tất: chọn khung, chia sẻ / tải về, lưu vào lookbook */
export const FinishScreen: React.FC = () => {
  const { activeImage, goTo } = useApp();
  const [note, setNote] = useState("");
  const [savedId, setSavedId] = useState<string | null>(null); // ảnh nào đã lưu (tránh lưu trùng)
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const outfit = outfits.find((o) => o.id === activeImage?.outfitId);

  if (!activeImage || !outfit) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <Wand2 className="w-10 h-10 text-muc-nhat mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-muc mb-3">Chưa có ảnh để hoàn tất</h1>
        <p className="text-muc-nhat mb-8">Ghép ảnh ở phòng thử đồ trước nhé.</p>
        <Button onClick={() => goTo("studio")}>Vào phòng thử đồ</Button>
      </div>
    );
  }

  const saved = savedId === activeImage.id;

  const save = async (): Promise<boolean> => {
    if (saved) return true;
    setSaving(true);
    setError(null);
    try {
      await saveLookbookItem({
        id: `look-${Date.now()}`,
        outfitId: outfit.id,
        imageDataUrl: activeImage.dataUrl,
        note: note.trim(),
        createdAt: Date.now(),
      });
      setSavedId(activeImage.id);
      return true;
    } catch (err: any) {
      setError(err.message || "Không lưu được vào lookbook.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const finish = async () => {
    if (await save()) goTo("lookbook");
  };

  return (
    <>
      <FlowHeader
        current={4}
        back={() => goTo("result")}
        next={{ label: saving ? "Đang lưu…" : "Hoàn tất", onClick: finish, disabled: saving, icon: <Check className="w-4 h-4" /> }}
      />
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-10">
      <PageTitle title="Hoàn tất lookbook" description="Chọn khung ảnh bạn thích để chia sẻ hoặc tải về, rồi lưu bộ phối vào lookbook." />

      <FramePicker imageDataUrl={activeImage.dataUrl} title={outfit.name} />

      <Card className="p-5 sm:p-6 mt-8 max-w-2xl">
        <h2 className="text-lg font-bold text-muc">Lưu vào lookbook</h2>
        <p className="text-sm text-muc-nhat mt-1">Lưu lại để xem và so sánh các bộ phối sau này.</p>
        <div className="flex flex-col sm:flex-row gap-2 mt-4">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={80}
            disabled={saved}
            placeholder="Ghi chú (không bắt buộc), ví dụ: mặc đi chụp kỷ yếu"
            className="flex-1 min-w-0 px-4 py-2.5 text-sm rounded-xl border border-vien bg-kem text-muc focus:outline-none focus:border-son disabled:opacity-60"
          />
          <Button variant="jade" onClick={save} disabled={saved || saving}>
            {saved ? <Check className="w-4 h-4" /> : <BookmarkPlus className="w-4 h-4" />} {saved ? "Đã lưu" : "Lưu"}
          </Button>
        </div>
        {error && <p className="text-xs text-son mt-2">{error}</p>}
      </Card>

    </div>
    </>
  );
};
