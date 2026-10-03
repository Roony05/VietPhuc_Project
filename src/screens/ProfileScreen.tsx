import React, { useState } from "react";
import { useApp } from "../state/AppContext";
import { AgeRange, ColorTag, StyleTag, WearerProfile } from "../types";
import { ageRangeLabels, colorLabels, genderLabels, styleLabels } from "../data/labels";
import { newProfile } from "../logic/profileStorage";
import { Button, Card, Chip, PageTitle } from "../components/ui";
import { FolkAvatar } from "../components/FolkAvatar";
import { ArrowRight, Check, LogOut, Pencil, Plus, Trash2, UserRound } from "lucide-react";

const AGES: AgeRange[] = ["duoi_16", "16_18", "19_22", "23_30", "tren_30"];
const STYLES: StyleTag[] = ["truyen_thong", "toi_gian", "gen_z", "sang_trong"];
const COLORS: ColorTag[] = ["do", "vang", "xanh_lam", "xanh_la", "hong_sen", "tim", "nau", "den", "trang", "be", "cam"];
const toggle = <T,>(list: T[], item: T) => (list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);

const inputClass = "w-full px-4 py-2.5 rounded-xl border border-vien bg-kem text-muc focus:outline-none focus:border-son";

/** Đăng nhập demo: chỉ cần tên, không mật khẩu, không gửi mã */
const LoginCard: React.FC = () => {
  const { login } = useApp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const valid = name.trim().length >= 2;
  return (
    <Card className="p-6 sm:p-8 max-w-lg">
      <h2 className="text-2xl font-bold text-muc mb-1">Đăng nhập</h2>
      <p className="text-sm text-muc-nhat mb-6">Để lưu hồ sơ người mặc và chọn đồ hộ người khác.</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (valid) login(name, email);
        }}
        className="space-y-4"
      >
        <label className="block text-sm text-muc-nhat space-y-1.5">
          <span>Tên hiển thị *</span>
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={30} placeholder="VD: Minh Anh" className={inputClass} />
        </label>
        <label className="block text-sm text-muc-nhat space-y-1.5">
          <span>Email (không bắt buộc)</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={60} placeholder="ban@vidu.com" className={inputClass} />
        </label>
        <Button type="submit" size="lg" className="w-full" disabled={!valid}>
          Vào app <ArrowRight className="w-5 h-5" />
        </Button>
      </form>
    </Card>
  );
};

/** Form thêm / sửa hồ sơ người mặc */
const ProfileEditor: React.FC<{ initial: WearerProfile; onSave: (p: WearerProfile) => void; onCancel: () => void }> = ({
  initial,
  onSave,
  onCancel,
}) => {
  const [p, setP] = useState<WearerProfile>(initial);
  const set = (partial: Partial<WearerProfile>) => setP((prev) => ({ ...prev, ...partial }));
  const heightOk = p.heightCm === null || (p.heightCm >= 80 && p.heightCm <= 230);
  const weightOk = p.weightKg === null || (p.weightKg >= 20 && p.weightKg <= 200);
  const valid = p.name.trim().length > 0 && heightOk && weightOk;
  const num = (v: string) => (v ? Number(v) : null);

  return (
    <Card className="p-5 sm:p-6 border-nghe/40">
      <h3 className="text-lg font-bold text-muc mb-4">{initial.name ? `Sửa hồ sơ ${initial.name}` : "Hồ sơ mới"}</h3>
      <div className="space-y-5">
        <label className="block text-sm text-muc-nhat space-y-1.5">
          <span>Tên gọi *</span>
          <input value={p.name} onChange={(e) => set({ name: e.target.value })} maxLength={24} placeholder="VD: Tôi, Em gái, Bạn Minh" className={inputClass} />
        </label>
        <div>
          <p className="text-sm text-muc-nhat mb-2">Giới tính</p>
          <div className="flex gap-2">
            {(["nu", "nam"] as const).map((g) => (
              <Chip key={g} selected={p.gender === g} onClick={() => set({ gender: p.gender === g ? null : g })}>
                {genderLabels[g]}
              </Chip>
            ))}
          </div>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          <label className="text-sm text-muc-nhat space-y-1.5">
            <span>Độ tuổi</span>
            <select value={p.ageRange ?? ""} onChange={(e) => set({ ageRange: (e.target.value || null) as AgeRange | null })} className={inputClass}>
              <option value="">Không chọn</option>
              {AGES.map((a) => (
                <option key={a} value={a}>
                  {ageRangeLabels[a]}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm text-muc-nhat space-y-1.5">
            <span>Chiều cao (cm)</span>
            <input type="number" inputMode="numeric" value={p.heightCm ?? ""} onChange={(e) => set({ heightCm: num(e.target.value) })} placeholder="VD: 160" className={inputClass} />
            {!heightOk && <span className="text-xs text-son">Từ 80 đến 230 cm</span>}
          </label>
          <label className="text-sm text-muc-nhat space-y-1.5">
            <span>Cân nặng (kg)</span>
            <input type="number" inputMode="numeric" value={p.weightKg ?? ""} onChange={(e) => set({ weightKg: num(e.target.value) })} placeholder="VD: 50" className={inputClass} />
            {!weightOk && <span className="text-xs text-son">Từ 20 đến 200 kg</span>}
          </label>
        </div>
        <div>
          <p className="text-sm text-muc-nhat mb-2">Phong cách hay chọn</p>
          <div className="flex flex-wrap gap-2">
            {STYLES.map((s) => (
              <Chip key={s} selected={p.styles.includes(s)} onClick={() => set({ styles: toggle(p.styles, s) })}>
                {styleLabels[s]}
              </Chip>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm text-muc-nhat mb-2">Màu yêu thích</p>
          <div className="flex flex-wrap gap-2">
            {COLORS.map((c) => (
              <Chip key={c} selected={p.colors.includes(c)} onClick={() => set({ colors: toggle(p.colors, c) })}>
                <span className="w-4 h-4 rounded-full border border-white/30" style={{ backgroundColor: colorLabels[c].hex }} />
                {colorLabels[c].label}
              </Chip>
            ))}
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={onCancel}>
            Hủy
          </Button>
          <Button disabled={!valid} onClick={() => onSave({ ...p, name: p.name.trim() })}>
            <Check className="w-4 h-4" /> Lưu hồ sơ
          </Button>
        </div>
      </div>
    </Card>
  );
};

export const ProfileScreen: React.FC = () => {
  const { account, logout, profiles, activeProfile, setActiveProfileId, upsertProfile, deleteProfile, goTo } = useApp();
  const [editing, setEditing] = useState<WearerProfile | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [confirmWipe, setConfirmWipe] = useState(false);

  if (!account) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <PageTitle eyebrow="Tài khoản" title="Lưu gu của bạn" description="Lưu giới tính, số đo, màu và phong cách hay chọn cho từng người, lần sau khỏi nhập lại." />
        <LoginCard />
      </div>
    );
  }

  const save = (p: WearerProfile) => {
    upsertProfile(p);
    if (!activeProfile) setActiveProfileId(p.id);
    setEditing(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <PageTitle
        eyebrow="Tài khoản"
        title={`Xin chào, ${account.name}`}
        description="Mỗi hồ sơ là một người bạn chọn đồ cho. Chọn hồ sơ nào thì bước Chọn gu tự điền sẵn thông tin người đó."
        action={
          activeProfile && (
            <Button onClick={() => goTo("filter")}>
              Chọn đồ cho {activeProfile.name} <ArrowRight className="w-4 h-4" />
            </Button>
          )
        }
      />

      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="text-xl font-bold text-muc">Hồ sơ người mặc ({profiles.length})</h2>
        {!editing && (
          <Button variant="secondary" onClick={() => setEditing(newProfile(""))}>
            <Plus className="w-4 h-4" /> Thêm hồ sơ
          </Button>
        )}
      </div>

      {editing && (
        <div className="mb-6">
          <ProfileEditor key={editing.id} initial={editing} onSave={save} onCancel={() => setEditing(null)} />
        </div>
      )}

      {profiles.length === 0 && !editing && (
        <Card className="p-8 text-center text-muc-nhat">
          <UserRound className="w-8 h-8 mx-auto mb-2" />
          Chưa có hồ sơ nào. Bấm “Thêm hồ sơ” để tạo hồ sơ cho bạn hoặc người bạn muốn chọn đồ giúp.
        </Card>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {profiles.map((p) => {
          const active = activeProfile?.id === p.id;
          return (
            <Card key={p.id} className={`p-5 flex flex-col gap-3 ${active ? "!border-nghe/70" : ""}`}>
              <div className="flex items-center gap-3">
                {p.gender ? (
                  <FolkAvatar gender={p.gender} age={p.ageRange} className="w-12 h-15 shrink-0" />
                ) : (
                  <span className="w-12 h-14 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                    <UserRound className="w-6 h-6 text-muc-nhat" />
                  </span>
                )}
                <div className="min-w-0">
                  <p className="font-bold text-muc truncate">{p.name}</p>
                  <p className="text-xs text-muc-nhat">
                    {[p.gender && genderLabels[p.gender], p.ageRange && ageRangeLabels[p.ageRange], p.heightCm && `${p.heightCm} cm`, p.weightKg && `${p.weightKg} kg`]
                      .filter(Boolean)
                      .join(" · ") || "Chưa có thông tin"}
                  </p>
                </div>
                {active && <span className="ml-auto text-[11px] font-semibold px-2 py-1 rounded-full bg-nghe text-[#1a120c] shrink-0">Đang chọn</span>}
              </div>
              {(p.styles.length > 0 || p.colors.length > 0) && (
                <div className="flex flex-wrap gap-1.5">
                  {p.styles.map((s) => (
                    <span key={s} className="text-[11px] px-2 py-0.5 rounded-full border border-vien text-muc-nhat">
                      {styleLabels[s]}
                    </span>
                  ))}
                  {p.colors.map((c) => (
                    <span key={c} title={colorLabels[c].label} className="w-4 h-4 rounded-full border border-white/30" style={{ backgroundColor: colorLabels[c].hex }} />
                  ))}
                </div>
              )}
              <div className="flex flex-wrap gap-2 mt-auto pt-2 border-t border-white/5">
                {!active && (
                  <Button variant="secondary" className="!px-3 !py-1.5" onClick={() => setActiveProfileId(p.id)}>
                    <Check className="w-4 h-4" /> Chọn
                  </Button>
                )}
                <Button variant="ghost" className="!px-3 !py-1.5" onClick={() => setEditing(p)}>
                  <Pencil className="w-4 h-4" /> Sửa
                </Button>
                {confirmDelete === p.id ? (
                  <>
                    <Button variant="ghost" className="!px-3 !py-1.5 !text-son" onClick={() => { deleteProfile(p.id); setConfirmDelete(null); }}>
                      Xóa thật
                    </Button>
                    <Button variant="ghost" className="!px-3 !py-1.5" onClick={() => setConfirmDelete(null)}>
                      Thôi
                    </Button>
                  </>
                ) : (
                  <Button variant="ghost" className="!px-3 !py-1.5" onClick={() => setConfirmDelete(p.id)}>
                    <Trash2 className="w-4 h-4" /> Xóa
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <div className="mt-10 pt-6 border-t border-vien flex justify-end">
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="secondary" onClick={() => logout(false)}>
            <LogOut className="w-4 h-4" /> Đăng xuất
          </Button>
          {confirmWipe ? (
            <Button variant="ghost" className="!text-son" onClick={() => logout(true)}>
              Chắc chắn xóa hết
            </Button>
          ) : (
            <Button variant="ghost" onClick={() => setConfirmWipe(true)}>
              <Trash2 className="w-4 h-4" /> Đăng xuất và xóa dữ liệu
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
