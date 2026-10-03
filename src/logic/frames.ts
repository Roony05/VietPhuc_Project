/**
 * Các khung ảnh lookbook vẽ bằng Canvas (không cần file ảnh, chạy hoàn toàn trên trình duyệt).
 * Ảnh người luôn hiện trọn (không cắt đầu/chân); phần trống được lấp bằng chính ảnh đó làm mờ.
 * Mỗi khung có dòng "Đồng hành cùng Việt Phục Remix".
 */

export const FRAME_W = 1080;
export const FRAME_H = 1350;
export const BRAND = "Đồng hành cùng Việt Phục Remix";

export interface FrameInfo {
  title: string; // tên bộ đồ
  date: string; // dd/mm/yyyy
}

export interface FrameDef {
  id: string;
  name: string;
  draw: (ctx: CanvasRenderingContext2D, img: HTMLImageElement, info: FrameInfo) => void;
}

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { FolkAvatar } from "../components/FolkAvatar";

const SERIF = '"Playfair Display", Georgia, serif';
const SANS = '"Be Vietnam Pro", system-ui, sans-serif';
const INK = "#1F1712"; // mực nét truyện tranh xưa
type Ctx = CanvasRenderingContext2D;

// ---------- tiện ích vẽ ----------

function roundRectPath(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Khung cửa vòm: chữ nhật có nửa hình tròn phía trên */
function archPath(ctx: Ctx, x: number, y: number, w: number, h: number) {
  const r = w / 2;
  ctx.beginPath();
  ctx.moveTo(x, y + h);
  ctx.lineTo(x, y + r);
  ctx.arc(x + r, y + r, r, Math.PI, 0);
  ctx.lineTo(x + w, y + h);
  ctx.closePath();
}

/** Độ phóng hiện tại của canvas (ảnh xem trước nhỏ hơn ảnh thật), để blur tỉ lệ đúng ở mọi cỡ */
function pxScale(ctx: Ctx) {
  const t = ctx.getTransform();
  return Math.hypot(t.a, t.b) || 1;
}

/**
 * Hậu kỳ kiểu phim cho vùng ảnh: quầng sáng ấm quanh chỗ sáng (halation), vùng sáng ấm / vùng tối xanh ngọc,
 * tối dần ở mép. k từ 0 (tắt) tới 1 (đậm).
 */
function cinematicGrade(ctx: Ctx, img: HTMLImageElement, dx: number, dy: number, dw: number, dh: number, k: number) {
  if (k <= 0) return;
  const s = pxScale(ctx);
  ctx.save();
  ctx.beginPath();
  ctx.rect(dx, dy, dw, dh); // quầng sáng chỉ trong vùng ảnh, không loang ra nền
  ctx.clip();
  ctx.globalCompositeOperation = "screen";
  ctx.globalAlpha = 0.22 * k;
  ctx.filter = `blur(${16 * s}px) brightness(1.05) sepia(0.5) saturate(1.8)`;
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.restore();

  ctx.save();
  ctx.globalCompositeOperation = "soft-light";
  const tone = ctx.createLinearGradient(dx, dy, dx, dy + dh);
  tone.addColorStop(0, `rgba(255,186,120,${0.38 * k})`);
  tone.addColorStop(0.55, `rgba(255,214,170,${0.12 * k})`);
  tone.addColorStop(1, `rgba(30,110,120,${0.4 * k})`);
  ctx.fillStyle = tone;
  ctx.fillRect(dx, dy, dw, dh);
  ctx.restore();

  const r = Math.max(dw, dh);
  const v = ctx.createRadialGradient(dx + dw / 2, dy + dh * 0.45, r * 0.3, dx + dw / 2, dy + dh * 0.45, r * 0.78);
  v.addColorStop(0, "rgba(0,0,0,0)");
  v.addColorStop(1, `rgba(0,0,0,${0.42 * k})`);
  ctx.fillStyle = v;
  ctx.fillRect(dx, dy, dw, dh);
}

/**
 * Vẽ ảnh vào vùng cho trước: ảnh hiện TRỌN (contain), nền phía sau là chính ảnh phóng to + làm mờ.
 * clipPath cho phép cắt theo hình tùy ý (bo góc, cửa vòm...). grade: độ đậm hậu kỳ điện ảnh (0 = ảnh gốc).
 */
function drawPhoto(
  ctx: Ctx,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  r = 0,
  clipPath?: () => void,
  grade = 0.55
) {
  ctx.save();
  if (clipPath) clipPath();
  else roundRectPath(ctx, x, y, w, h, r);
  ctx.clip();

  const cover = Math.max(w / img.width, h / img.height) * 1.2;
  ctx.filter = `blur(${26 * pxScale(ctx)}px) saturate(1.15) brightness(0.8)`;
  ctx.drawImage(img, x + (w - img.width * cover) / 2, y + (h - img.height * cover) / 2, img.width * cover, img.height * cover);
  ctx.filter = "none";
  ctx.fillStyle = "rgba(0,0,0,0.12)";
  ctx.fillRect(x, y, w, h);

  const fit = Math.min(w / img.width, h / img.height) * 0.97;
  const dw = img.width * fit;
  const dh = img.height * fit;
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
  cinematicGrade(ctx, img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh, grade);
  ctx.restore();
}

function text(ctx: Ctx, value: string, x: number, y: number, font: string, color: string | CanvasGradient, align: CanvasTextAlign = "center") {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  ctx.fillText(value, x, y);
}

function glowText(ctx: Ctx, value: string, x: number, y: number, font: string, color: string, glow: string, blur = 24) {
  ctx.save();
  ctx.shadowColor = glow;
  ctx.shadowBlur = blur;
  text(ctx, value, x, y, font, color);
  ctx.shadowBlur = blur / 2;
  text(ctx, value, x, y, font, color);
  ctx.restore();
}

let noiseTile: HTMLCanvasElement | null = null;
/** Ô nhiễu 256×256 dùng lặp lại làm hạt phim (tạo 1 lần) */
function noise() {
  if (!noiseTile) {
    noiseTile = document.createElement("canvas");
    noiseTile.width = noiseTile.height = 256;
    const c = noiseTile.getContext("2d")!;
    const data = c.createImageData(256, 256);
    let s = 11;
    for (let i = 0; i < data.data.length; i += 4) {
      s = (s * 16807) % 2147483647;
      const v = 128 + (s / 2147483647 - 0.5) * 255;
      data.data[i] = data.data[i + 1] = data.data[i + 2] = v;
      data.data[i + 3] = 255;
    }
    c.putImageData(data, 0, 0);
  }
  return noiseTile;
}

/** Hạt phim phủ toàn khung (chồng kiểu overlay nên giữ màu, chỉ thêm độ "sạn") */
function grain(ctx: Ctx, alpha = 0.06) {
  ctx.save();
  ctx.globalCompositeOperation = "overlay";
  ctx.globalAlpha = Math.min(1, alpha * 3.2);
  ctx.fillStyle = ctx.createPattern(noise(), "repeat")!;
  ctx.fillRect(0, 0, FRAME_W, FRAME_H);
  ctx.restore();
}

/** Chữ giãn khoảng cách (kiểu chữ credit trên poster phim) */
function spaced(ctx: Ctx, value: string, x: number, y: number, font: string, color: string, spacing: number, align: CanvasTextAlign = "center") {
  ctx.save();
  (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${spacing}px`;
  text(ctx, value, x + (align === "center" ? spacing / 2 : 0), y, font, color, align);
  ctx.restore();
}

/** Ngắt chữ thành nhiều dòng vừa bề rộng */
function wrap(ctx: Ctx, value: string, font: string, maxW: number): string[] {
  ctx.font = font;
  const lines: string[] = [];
  let line = "";
  for (const word of value.split(" ")) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > maxW && line) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

/** Màu vàng dát cho chữ / viền */
function goldFill(ctx: Ctx, y0: number, y1: number) {
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  g.addColorStop(0, "#FFF1C9");
  g.addColorStop(0.45, "#E9B44C");
  g.addColorStop(0.55, "#C8902F");
  g.addColorStop(1, "#F6D98A");
  return g;
}

/** Vệt lóa ống kính anamorphic: dải sáng ngang mảnh */
function anamorphicFlare(ctx: Ctx, cx: number, cy: number, len: number, color: string) {
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.translate(cx, cy);
  ctx.scale(len / 100, 0.06);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 100);
  g.addColorStop(0, color);
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(-100, -100, 200, 200);
  ctx.restore();
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  glow(ctx, cx, cy, len * 0.06, "rgba(255,255,255,0.5)");
  ctx.restore();
}

function glow(ctx: Ctx, cx: number, cy: number, r: number, color: string) {
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  g.addColorStop(0, color);
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
}

function lotus(ctx: Ctx, cx: number, cy: number, size: number, color: string, center: string) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = color;
  for (const angle of [-64, -32, 0, 32, 64]) {
    ctx.save();
    ctx.rotate((angle * Math.PI) / 180);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(size * 0.36, -size * 0.55, 0, -size);
    ctx.quadraticCurveTo(-size * 0.36, -size * 0.55, 0, 0);
    ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = center;
  ctx.beginPath();
  ctx.ellipse(0, -size * 0.05, size * 0.3, size * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function blossom(ctx: Ctx, cx: number, cy: number, r: number, petal: string, core: string) {
  ctx.fillStyle = petal;
  for (let i = 0; i < 5; i++) {
    const a = (i * 2 * Math.PI) / 5 - Math.PI / 2;
    ctx.beginPath();
    ctx.arc(cx + Math.cos(a) * r * 0.6, cy + Math.sin(a) * r * 0.6, r * 0.55, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.3, 0, Math.PI * 2);
  ctx.fill();
}

/** Cành mai: cành cong + vài bông */
function plumBranch(ctx: Ctx, x: number, y: number, dir: 1 | -1) {
  ctx.strokeStyle = "#5A2E1A";
  ctx.lineCap = "round";
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + dir * 120, y + 40, x + dir * 230, y + 150);
  ctx.stroke();
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(x + dir * 110, y + 45);
  ctx.quadraticCurveTo(x + dir * 150, y - 10, x + dir * 210, y - 20);
  ctx.stroke();
  for (const [dx, dy, r] of [[60, 20, 26], [130, 60, 30], [200, 130, 24], [170, -10, 22], [225, -20, 18], [95, 50, 16]]) {
    blossom(ctx, x + dir * dx, y + dy, r, "#FFD34D", "#E0781A");
  }
}

function star(ctx: Ctx, cx: number, cy: number, r: number, color: string, points = 5, inner = 0.45) {
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const rad = i % 2 === 0 ? r : r * inner;
    const a = (i * Math.PI) / points - Math.PI / 2;
    ctx.lineTo(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad);
  }
  ctx.closePath();
  ctx.fill();
}

function heart(ctx: Ctx, cx: number, cy: number, s: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx, cy + s * 0.35);
  ctx.bezierCurveTo(cx - s, cy - s * 0.3, cx - s * 0.4, cy - s, cx, cy - s * 0.45);
  ctx.bezierCurveTo(cx + s * 0.4, cy - s, cx + s, cy - s * 0.3, cx, cy + s * 0.35);
  ctx.fill();
}

function lantern(ctx: Ctx, cx: number, top: number, size: number) {
  ctx.strokeStyle = "#F4C542";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(cx, 0);
  ctx.lineTo(cx, top);
  ctx.stroke();
  glow(ctx, cx, top + size * 0.62, size * 1.1, "rgba(255,120,60,0.35)");
  ctx.fillStyle = "#E0A526";
  ctx.fillRect(cx - size * 0.3, top, size * 0.6, size * 0.12);
  const body = ctx.createRadialGradient(cx - size * 0.15, top + size * 0.5, size * 0.05, cx, top + size * 0.62, size * 0.55);
  body.addColorStop(0, "#FF6B5A");
  body.addColorStop(1, "#C0182B");
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.ellipse(cx, top + size * 0.62, size * 0.5, size * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(244,197,66,0.6)";
  ctx.lineWidth = 3;
  for (const k of [0.15, 0.55]) {
    ctx.beginPath();
    ctx.ellipse(cx, top + size * 0.62, size * 0.5 * k, size * 0.5, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.fillStyle = "#E0A526";
  ctx.fillRect(cx - size * 0.3, top + size * 1.08, size * 0.6, size * 0.12);
  ctx.strokeStyle = "#E0A526";
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(cx + i * 7, top + size * 1.2);
    ctx.lineTo(cx + i * 7, top + size * 1.6);
    ctx.stroke();
  }
}

function washiTape(ctx: Ctx, cx: number, cy: number, angle: number, color: string) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  ctx.fillStyle = color;
  ctx.fillRect(-90, -24, 180, 48);
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  for (let i = -80; i < 90; i += 24) ctx.fillRect(i, -24, 10, 48);
  ctx.restore();
}

function sticker(ctx: Ctx, cx: number, cy: number, label: string, bg: string, fg: string, angle = 0) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  ctx.font = `800 34px ${SANS}`;
  const w = ctx.measureText(label).width + 56;
  ctx.shadowColor = "rgba(0,0,0,0.18)";
  ctx.shadowBlur = 12;
  ctx.fillStyle = "#FFFFFF";
  roundRectPath(ctx, -w / 2 - 6, -38, w + 12, 76, 38);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = bg;
  roundRectPath(ctx, -w / 2, -32, w, 64, 32);
  ctx.fill();
  text(ctx, label, 0, 1, `800 34px ${SANS}`, fg);
  ctx.restore();
}


/** Nhân vật truyện tranh xưa (dùng lại SVG FolkAvatar: thư sinh / cô thôn nữ), nạp sẵn trong ensureFonts() */
const characters: Partial<Record<"nam" | "nu", HTMLImageElement>> = {};

function characterDataUrl(gender: "nam" | "nu") {
  const svg = renderToStaticMarkup(createElement(FolkAvatar, { gender, age: "16_18", framed: false })).replace(
    "<svg",
    '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="750"'
  );
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function drawCharacter(ctx: Ctx, gender: "nam" | "nu", x: number, y: number, w: number) {
  const img = characters[gender];
  if (img) ctx.drawImage(img, x, y, w, w * 1.25);
}

/** Bong bóng thoại kiểu truyện tranh: nền trắng, viền mực, đuôi chỉ về nhân vật */
function comicBubble(ctx: Ctx, x: number, y: number, label: string, tailLeft = true) {
  const font = `800 38px ${SANS}`;
  ctx.font = font;
  const w = ctx.measureText(label).width + 70;
  const h = 84;
  ctx.save();
  ctx.lineWidth = 6;
  ctx.lineJoin = "round";
  ctx.strokeStyle = INK;
  ctx.fillStyle = "#FFFDF6";
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // đuôi: tam giác nhọn hướng xuống về phía nhân vật, phủ lên viền
  const bx = tailLeft ? x + w * 0.22 : x + w * 0.78;
  const tip = tailLeft ? -40 : 40;
  ctx.beginPath();
  ctx.moveTo(bx - 20, y + h - 10);
  ctx.lineTo(bx + tip, y + h + 46);
  ctx.lineTo(bx + 20, y + h - 6);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h / 2, w / 2 - 3, h / 2 - 3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  text(ctx, label, x + w / 2, y + h / 2 + 2, font, INK);
}

/** Mây cuộn kép (họa tiết dân gian): hai vòng xoắn nối bằng một đường nền */
function cloudSwirl(ctx: Ctx, x: number, y: number, s: number, color: string, dir: 1 | -1 = 1) {
  // điểm trên vòng xoắn: bắt đầu ở đáy vòng (bán kính r), xoáy vào trong
  const curl = (cx: number, cy: number, r: number, turn: 1 | -1) =>
    Array.from({ length: 41 }, (_, i) => {
      const t = i / 40;
      const a = Math.PI / 2 - turn * t * Math.PI * 2.4;
      const rr = r * (1 - 0.72 * t);
      return [cx + rr * Math.cos(a), cy + rr * Math.sin(a)] as const;
    });
  const big = curl(0, 0, 18, 1); // xoáy sang phải
  const small = curl(-52, 5, 13, -1).reverse(); // xoáy sang trái, đi từ trong ra
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(dir * s, s);
  ctx.strokeStyle = color;
  ctx.lineWidth = 4.5 / s;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  small.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
  big.forEach(([px, py]) => ctx.lineTo(px, py));
  ctx.stroke();
  ctx.restore();
}

/** Triện son vuông "Việt Phục" */
function seal(ctx: Ctx, cx: number, cy: number, size: number, angle: number) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  ctx.fillStyle = "#C0182B";
  roundRectPath(ctx, -size / 2, -size / 2, size, size, size * 0.1);
  ctx.fill();
  const f = `800 ${Math.round(size * 0.27)}px ${SERIF}`;
  text(ctx, "VIỆT", 0, -size * 0.17, f, "#FFF1E0");
  text(ctx, "PHỤC", 0, size * 0.19, f, "#FFF1E0");
  ctx.restore();
}

/** Băng giấy cuộn hai đầu, chữ tiêu đề ở giữa */
function scrollBanner(ctx: Ctx, cx: number, cy: number, label: string, color: string) {
  const font = `italic 800 50px ${SERIF}`;
  ctx.font = font;
  const w = Math.max(520, ctx.measureText(label).width + 140);
  const h = 96;
  ctx.save();
  ctx.lineWidth = 6;
  ctx.strokeStyle = INK;
  ctx.lineJoin = "round";
  for (const side of [-1, 1]) {
    ctx.fillStyle = "#E7D3A6";
    ctx.beginPath();
    ctx.ellipse(cx + side * (w / 2), cy, 18, h / 2 + 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  ctx.fillStyle = "#FBF1DA";
  ctx.fillRect(cx - w / 2, cy - h / 2, w, h);
  ctx.strokeRect(cx - w / 2, cy - h / 2, w, h);
  ctx.restore();
  text(ctx, label, cx, cy + 3, font, color);
}

/** Trang truyện tranh xưa: giấy dó, mây cuộn, khung tranh viền mực, nhân vật + bong bóng thoại */
function folkComicPage(
  ctx: Ctx,
  img: HTMLImageElement,
  info: FrameInfo,
  o: { heading: string; quote: string; gender: "nam" | "nu"; accent: string }
) {
  const left = o.gender === "nam"; // nam đứng trái, nữ đứng phải
  ctx.fillStyle = "#F1E2C0";
  ctx.fillRect(0, 0, FRAME_W, FRAME_H);
  let seed = left ? 11 : 23;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  ctx.fillStyle = "rgba(120,90,50,0.12)";
  for (let i = 0; i < 1600; i++) ctx.fillRect(rand() * FRAME_W, rand() * FRAME_H, 2 + rand() * 4, 1 + rand() * 2);
  // viền trang: mực đậm + chỉ son
  ctx.lineWidth = 10;
  ctx.strokeStyle = INK;
  ctx.strokeRect(34, 34, FRAME_W - 68, FRAME_H - 68);
  ctx.lineWidth = 3;
  ctx.strokeStyle = o.accent;
  ctx.strokeRect(50, 50, FRAME_W - 100, FRAME_H - 100);
  cloudSwirl(ctx, 150, 120, 1.3, o.accent, 1);
  cloudSwirl(ctx, FRAME_W - 150, 120, 1.3, o.accent, -1);
  scrollBanner(ctx, 540, 128, o.heading, INK);
  // ô tranh: bóng mực lệch kiểu truyện tranh + viền dày
  const px = 110, py = 210, pw = 860, ph = 830;
  ctx.fillStyle = INK;
  ctx.fillRect(px + 16, py + 16, pw, ph);
  ctx.fillStyle = "#FFFDF6";
  ctx.fillRect(px, py, pw, ph);
  drawPhoto(ctx, img, px + 14, py + 14, pw - 28, ph - 28, 0);
  ctx.lineWidth = 10;
  ctx.strokeStyle = INK;
  ctx.strokeRect(px, py, pw, ph);
  // nhân vật đứng tràn ra mép dưới ô tranh, bong bóng thoại cạnh đầu
  drawCharacter(ctx, o.gender, left ? 40 : FRAME_W - 340, 905, 300);
  ctx.font = `800 38px ${SANS}`;
  const bw = ctx.measureText(o.quote).width + 70;
  comicBubble(ctx, left ? 290 : FRAME_W - 290 - bw, 930, o.quote, left);
  // tên bộ đồ + dòng thương hiệu + ngày, triện son
  const tx = left ? 1000 : 80;
  const align: CanvasTextAlign = left ? "right" : "left";
  text(ctx, info.title, tx, 1140, `italic 700 44px ${SERIF}`, o.accent, align);
  text(ctx, BRAND, tx, 1200, `600 26px ${SANS}`, "#5B4632", align);
  text(ctx, info.date, tx, 1246, `500 24px ${SANS}`, "#8A7458", align);
  seal(ctx, left ? 410 : 670, 1196, 92, left ? -0.08 : 0.08); // giữa nhân vật và chữ
}

function matPhoto(ctx: Ctx, img: HTMLImageElement, x: number, y: number, w: number, h: number, mat: number, color: string) {
  ctx.save();
  ctx.shadowColor = "rgba(30,20,10,0.45)";
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 16;
  ctx.fillStyle = color;
  ctx.fillRect(x - mat, y - mat, w + mat * 2, h + mat * 2);
  ctx.restore();
  drawPhoto(ctx, img, x, y, w, h, 2, undefined, 0.75);
}

/** Dải nền bo tròn cho chữ */
function ribbon(ctx: Ctx, cx: number, cy: number, w: number, h: number, color: string) {
  ctx.save();
  ctx.shadowColor = "rgba(60,40,10,0.3)";
  ctx.shadowBlur = 18;
  ctx.fillStyle = color;
  roundRectPath(ctx, cx - w / 2, cy - h / 2, w, h, 18);
  ctx.fill();
  ctx.restore();
}

/** Dãy đồi thấp nối các điểm [x, chiều cao] */
function hills(ctx: Ctx, base: number, pts: number[][], color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, base);
  pts.forEach(([x, h], i) => {
    const [px] = pts[Math.max(0, i - 1)];
    ctx.quadraticCurveTo((px + x) / 2, base - h * 1.2, x, base - h * 0.6);
  });
  ctx.lineTo(FRAME_W, base + 40);
  ctx.lineTo(0, base + 40);
  ctx.closePath();
  ctx.fill();
}

/** Lũy tre: cụm thân cong + tán lá */
function bamboo(ctx: Ctx, x: number, base: number, dir: 1 | -1) {
  ctx.save();
  ctx.strokeStyle = "#3E4A22";
  ctx.lineWidth = 3;
  for (let i = 0; i < 7; i++) {
    const bx = x + dir * i * 14;
    ctx.beginPath();
    ctx.moveTo(bx, base);
    ctx.quadraticCurveTo(bx + dir * 20, base - 120, bx + dir * (40 + i * 6), base - 190 - (i % 3) * 25);
    ctx.stroke();
  }
  ctx.fillStyle = "rgba(52,66,28,0.9)";
  for (let i = 0; i < 9; i++) {
    ctx.beginPath();
    ctx.ellipse(x + dir * (20 + i * 12), base - 150 - (i % 4) * 22, 48, 26, dir * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/** Cánh cò trắng đang bay */
function stork(ctx: Ctx, x: number, y: number, s: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.strokeStyle = "#FFFDF6";
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-46, -8);
  ctx.quadraticCurveTo(-20, -30, 0, 0);
  ctx.quadraticCurveTo(20, -30, 46, -8);
  ctx.stroke();
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(28, 8);
  ctx.stroke();
  ctx.restore();
}

/** Cánh cửa chớp gỗ xanh của phố Hội */
function shutter(ctx: Ctx, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = "#2F6B5E";
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = "rgba(10,40,30,0.55)";
  ctx.lineWidth = 3;
  ctx.strokeRect(x + 6, y + 6, w - 12, h - 12);
  for (let yy = y + 20; yy < y + h - 10; yy += 18) {
    ctx.beginPath();
    ctx.moveTo(x + 10, yy);
    ctx.lineTo(x + w - 10, yy);
    ctx.stroke();
  }
}

/** Đèn lồng lụa Hội An, màu tùy chọn */
function silkLantern(ctx: Ctx, cx: number, top: number, size: number, color: string) {
  ctx.strokeStyle = "#2E180D";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx, top);
  ctx.lineTo(cx, top + size * 0.35);
  ctx.stroke();
  const y = top + size * 0.35;
  glow(ctx, cx, y + size * 0.65, size * 1.3, "rgba(255,190,90,0.35)");
  const body = ctx.createRadialGradient(cx - size * 0.15, y + size * 0.5, size * 0.05, cx, y + size * 0.65, size * 0.6);
  body.addColorStop(0, "#FFF3C4");
  body.addColorStop(0.35, color);
  body.addColorStop(1, "#2A120A");
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.22, y);
  ctx.bezierCurveTo(cx - size * 0.62, y + size * 0.3, cx - size * 0.62, y + size, cx - size * 0.22, y + size * 1.3);
  ctx.lineTo(cx + size * 0.22, y + size * 1.3);
  ctx.bezierCurveTo(cx + size * 0.62, y + size, cx + size * 0.62, y + size * 0.3, cx + size * 0.22, y);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#3B2213";
  ctx.fillRect(cx - size * 0.25, y - 4, size * 0.5, 8);
  ctx.fillRect(cx - size * 0.25, y + size * 1.28, size * 0.5, 8);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(cx + i * 5, y + size * 1.36);
    ctx.lineTo(cx + i * 5, y + size * 1.75);
    ctx.stroke();
  }
}

/** Một lớp núi đá vôi Hạ Long: các khối cao, sườn dốc, đỉnh tròn */
function karst(ctx: Ctx, base: number, scale: number, color: string, seed: number) {
  let s = seed;
  const rand = () => (s = (s * 16807) % 2147483647) / 2147483647;
  ctx.fillStyle = color;
  let x = -40;
  while (x < FRAME_W + 40) {
    const w = (70 + rand() * 120) * scale;
    const h = (120 + rand() * 260) * scale;
    ctx.beginPath();
    ctx.moveTo(x, base);
    ctx.bezierCurveTo(x + w * 0.05, base - h * 0.9, x + w * 0.2, base - h, x + w * 0.5, base - h);
    ctx.bezierCurveTo(x + w * 0.8, base - h, x + w * 0.95, base - h * 0.85, x + w, base);
    ctx.closePath();
    ctx.fill();
    x += w * (0.55 + rand() * 0.6);
  }
}

/** Thuyền buồm nâu trên vịnh */
function junkBoat(ctx: Ctx, x: number, y: number, s: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = "#2A1A10";
  ctx.beginPath();
  ctx.moveTo(-120, 0);
  ctx.lineTo(120, 0);
  ctx.lineTo(90, 30);
  ctx.lineTo(-95, 30);
  ctx.closePath();
  ctx.fill();
  const sail = (sx: number, w: number, h: number) => {
    ctx.fillStyle = "#A9552C";
    ctx.beginPath();
    ctx.moveTo(sx, -6);
    ctx.lineTo(sx, -h);
    ctx.quadraticCurveTo(sx + w * 0.7, -h * 0.85, sx + w, -h * 0.55);
    ctx.lineTo(sx + w * 0.85, -6);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(60,25,10,0.6)";
    ctx.lineWidth = 2;
    for (let k = 1; k < 6; k++) {
      ctx.beginPath();
      ctx.moveTo(sx, -6 - ((h - 6) * k) / 6);
      ctx.lineTo(sx + w * 0.9, -6 - ((h - 6) * k) / 6 * 0.75);
      ctx.stroke();
    }
  };
  sail(-90, 70, 150);
  sail(-10, 80, 190);
  sail(70, 50, 120);
  ctx.globalAlpha = 0.25;
  ctx.fillRect(-100, 32, 190, 8);
  ctx.restore();
}

/** Tháp Rùa: 3 tầng, mái cong, cửa sáng đèn */
function turtleTower(ctx: Ctx, cx: number, base: number) {
  ctx.fillStyle = "#2B2F3D";
  const tiers = [
    [70, 46],
    [54, 38],
    [38, 30],
  ];
  let y = base;
  tiers.forEach(([w, h]) => {
    ctx.fillRect(cx - w / 2, y - h, w, h);
    ctx.fillStyle = "rgba(255,206,130,0.85)";
    ctx.fillRect(cx - 7, y - h + 10, 14, h - 18);
    ctx.fillStyle = "#2B2F3D";
    ctx.beginPath();
    ctx.moveTo(cx - w / 2 - 14, y - h + 4);
    ctx.quadraticCurveTo(cx, y - h - 10, cx + w / 2 + 14, y - h + 4);
    ctx.lineTo(cx + w / 2, y - h - 4);
    ctx.lineTo(cx - w / 2, y - h - 4);
    ctx.closePath();
    ctx.fill();
    y -= h + 4;
  });
  ctx.fillRect(cx - 4, y - 18, 8, 18);
  glow(ctx, cx, base - 60, 120, "rgba(255,200,120,0.25)");
}

/** Cầu Thê Húc: cầu gỗ sơn đỏ cong vồng từ mép trái */
function theHuc(ctx: Ctx) {
  ctx.save();
  ctx.lineCap = "round";
  ctx.strokeStyle = "#C0262B";
  ctx.lineWidth = 16;
  ctx.beginPath();
  ctx.moveTo(-20, 990);
  ctx.quadraticCurveTo(220, 900, 470, 960);
  ctx.stroke();
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(-20, 950);
  ctx.quadraticCurveTo(220, 860, 470, 922);
  ctx.stroke();
  ctx.lineWidth = 5;
  for (let i = 0; i <= 12; i++) {
    const t = i / 12;
    const x = -20 + t * 490;
    const yTop = (1 - t) * (1 - t) * 950 + 2 * (1 - t) * t * 860 + t * t * 922;
    const yBot = (1 - t) * (1 - t) * 990 + 2 * (1 - t) * t * 900 + t * t * 960;
    ctx.beginPath();
    ctx.moveTo(x, yTop);
    ctx.lineTo(x, yBot);
    ctx.stroke();
    if (i % 3 === 0) glow(ctx, x, yTop - 6, 26, "rgba(255,210,140,0.7)");
  }
  // bóng cầu dưới nước
  ctx.globalAlpha = 0.25;
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.moveTo(-20, 1030);
  ctx.quadraticCurveTo(220, 1110, 470, 1010);
  ctx.stroke();
  ctx.restore();
}

/** Cành liễu rủ từ góc trên */
function willow(ctx: Ctx, x: number, dir: 1 | -1) {
  ctx.save();
  ctx.strokeStyle = "rgba(92,128,62,0.85)";
  ctx.lineWidth = 2.5;
  for (let i = 0; i < 26; i++) {
    const sx = x + dir * (i * 9);
    const len = 220 + ((i * 53) % 260);
    ctx.beginPath();
    ctx.moveTo(sx, -10);
    ctx.quadraticCurveTo(sx + dir * 30, len * 0.5, sx + dir * (10 + (i % 5) * 6), len);
    ctx.stroke();
  }
  ctx.restore();
}

/** Cây dừa: thân cong + tàu lá */
function palm(ctx: Ctx, x: number, base: number, s: number, dir: 1 | -1) {
  ctx.save();
  ctx.translate(x, base);
  ctx.scale(s * dir, s);
  ctx.strokeStyle = "#6B4A2B";
  ctx.lineWidth = 16;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(40, -220, 90, -420);
  ctx.stroke();
  ctx.strokeStyle = "#2F5A2A";
  ctx.lineWidth = 7;
  for (const [ang, len] of [[-150, 210], [-120, 230], [-80, 200], [-40, 220], [-10, 200], [20, 170], [-175, 170]]) {
    const r = (ang * Math.PI) / 180;
    const ex = 90 + Math.cos(r) * len;
    const ey = -420 + Math.sin(r) * len * 0.6 + 60;
    ctx.beginPath();
    ctx.moveTo(90, -420);
    ctx.quadraticCurveTo(90 + Math.cos(r) * len * 0.5, -420 + Math.sin(r) * len * 0.5 - 30, ex, ey);
    ctx.stroke();
  }
  ctx.restore();
}

/** Xuồng ba lá có người chèo đội nón lá */
function sampan(ctx: Ctx, x: number, y: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "#3A2617";
  ctx.beginPath();
  ctx.moveTo(-160, -10);
  ctx.quadraticCurveTo(0, 30, 160, -20);
  ctx.lineTo(130, 10);
  ctx.quadraticCurveTo(0, 40, -135, 14);
  ctx.closePath();
  ctx.fill();
  // người chèo
  ctx.fillStyle = "#2A3B4A";
  ctx.fillRect(40, -90, 26, 80);
  ctx.fillStyle = "#E9D3A0";
  ctx.beginPath();
  ctx.moveTo(53, -128);
  ctx.lineTo(10, -88);
  ctx.lineTo(96, -88);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#5A3B1E";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(70, -70);
  ctx.lineTo(150, 40);
  ctx.stroke();
  ctx.globalAlpha = 0.2;
  ctx.fillStyle = "#0E2A28";
  ctx.beginPath();
  ctx.ellipse(0, 36, 150, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export const FRAMES: FrameDef[] = [
  {
    id: "dong-lua",
    name: "Đồng lúa quê nhà",
    draw(ctx, img, info) {
      // trời chiều vàng ấm
      const sky = ctx.createLinearGradient(0, 0, 0, 760);
      sky.addColorStop(0, "#E9A35E");
      sky.addColorStop(0.55, "#F6D29A");
      sky.addColorStop(1, "#FBE8C6");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, FRAME_W, FRAME_H);
      glow(ctx, 820, 600, 320, "rgba(255,232,170,0.9)");
      ctx.fillStyle = "#FFF3D2";
      ctx.beginPath();
      ctx.arc(820, 600, 66, 0, Math.PI * 2);
      ctx.fill();
      // núi xa
      hills(ctx, 690, [[0, 40], [220, 85], [430, 50], [640, 95], [860, 55], [1080, 80]], "rgba(150,140,95,0.45)");
      hills(ctx, 725, [[0, 30], [180, 55], [380, 25], [560, 60], [800, 30], [1080, 50]], "rgba(118,128,70,0.55)");
      // ruộng lúa: các dải xa nhỏ, gần to, xanh lẫn vàng
      const bands = ["#B9A445", "#9DA23C", "#C9B24E", "#8E9A36", "#D2B955", "#A0A53E", "#C8AE48", "#93A03A"];
      let y = 730;
      bands.forEach((c, i) => {
        const h = 22 + i * i * 6;
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.moveTo(0, y + 6);
        ctx.quadraticCurveTo(540, y - 8, FRAME_W, y + 4);
        ctx.lineTo(FRAME_W, y + h + 4);
        ctx.quadraticCurveTo(540, y + h - 10, 0, y + h + 6);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "rgba(70,80,25,0.25)";
        ctx.lineWidth = 1.5;
        for (let k = 0; k < 3; k++) {
          ctx.beginPath();
          ctx.moveTo(0, y + 6 + (h * k) / 3);
          ctx.quadraticCurveTo(540, y - 8 + (h * k) / 3, FRAME_W, y + 4 + (h * k) / 3);
          ctx.stroke();
        }
        y += h;
      });
      // lũy tre hai bên chân trời
      bamboo(ctx, 70, 760, 1);
      bamboo(ctx, 1010, 770, -1);
      // cánh cò
      [[160, 300, 1], [250, 250, 0.8], [330, 330, 0.9], [610, 210, 0.7], [690, 260, 0.6]].forEach(([x, yy, s]) => stork(ctx, x, yy, s));

      matPhoto(ctx, img, 200, 140, 680, 860, 18, "#FFF8EA");
      ribbon(ctx, 540, 1150, 640, 120, "rgba(255,248,232,0.94)");
      text(ctx, info.title, 540, 1135, `italic 700 46px ${SERIF}`, "#5A3A12");
      spaced(ctx, `ĐỒNG LÚA QUÊ NHÀ · ${info.date}`, 540, 1185, `600 17px ${SANS}`, "#8A6A3A", 4);
      text(ctx, BRAND, 540, 1290, `600 22px ${SANS}`, "rgba(70,50,20,0.75)");
      grain(ctx, 0.05);
    },
  },
  {
    id: "hoi-an",
    name: "Phố cổ Hội An",
    draw(ctx, img, info) {
      // tường vàng phố Hội, loang vết vôi cũ
      const wall = ctx.createLinearGradient(0, 0, FRAME_W, FRAME_H);
      wall.addColorStop(0, "#EBBB4C");
      wall.addColorStop(1, "#D6962C");
      ctx.fillStyle = wall;
      ctx.fillRect(0, 0, FRAME_W, FRAME_H);
      let seed = 23;
      const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
      for (let i = 0; i < 90; i++) {
        ctx.fillStyle = rand() > 0.5 ? "rgba(255,240,200,0.08)" : "rgba(120,70,20,0.06)";
        ctx.beginPath();
        ctx.ellipse(rand() * FRAME_W, rand() * FRAME_H, 30 + rand() * 120, 20 + rand() * 70, rand() * 3, 0, Math.PI * 2);
        ctx.fill();
      }
      // mái ngói âm dương
      ctx.fillStyle = "#4E2A18";
      ctx.fillRect(0, 0, FRAME_W, 120);
      ctx.strokeStyle = "#7A4428";
      ctx.lineWidth = 6;
      for (let row = 0; row < 3; row++) {
        for (let x = (row % 2) * 30; x < FRAME_W + 60; x += 60) {
          ctx.beginPath();
          ctx.arc(x, 28 + row * 32, 26, 0, Math.PI);
          ctx.stroke();
        }
      }
      ctx.fillStyle = "#2E180D";
      ctx.fillRect(0, 118, FRAME_W, 14);

      // khung cửa sổ gỗ + hai cánh chớp mở
      shutter(ctx, 92, 210, 92, 860);
      shutter(ctx, 896, 210, 92, 860);
      ctx.save();
      ctx.shadowColor = "rgba(60,30,10,0.5)";
      ctx.shadowBlur = 40;
      ctx.shadowOffsetY = 16;
      ctx.fillStyle = "#4A2A17";
      ctx.fillRect(176, 196, 728, 888);
      ctx.restore();
      drawPhoto(ctx, img, 204, 224, 672, 832, 0, undefined, 0.75);
      ctx.strokeStyle = "#2E180D";
      ctx.lineWidth = 4;
      ctx.strokeRect(204, 224, 672, 832);

      // đèn lồng lụa nhiều màu treo dưới mái
      silkLantern(ctx, 150, 132, 70, "#D8453A");
      silkLantern(ctx, 330, 132, 56, "#E9B44C");
      silkLantern(ctx, 750, 132, 56, "#7B3FA0");
      silkLantern(ctx, 930, 132, 70, "#2A8A80");

      // biển gỗ
      ctx.save();
      ctx.shadowColor = "rgba(40,20,5,0.45)";
      ctx.shadowBlur = 20;
      ctx.shadowOffsetY = 8;
      ctx.fillStyle = "#3B2213";
      roundRectPath(ctx, 230, 1130, 620, 130, 10);
      ctx.fill();
      ctx.restore();
      ctx.strokeStyle = goldFill(ctx, 1130, 1260);
      ctx.lineWidth = 3;
      roundRectPath(ctx, 242, 1142, 596, 106, 6);
      ctx.stroke();
      spaced(ctx, `PHỐ HỘI · ${info.date}`, 540, 1172, `700 17px ${SANS}`, "#E9B44C", 5);
      text(ctx, info.title, 540, 1218, `italic 700 40px ${SERIF}`, "#FFF1C9");
      text(ctx, BRAND, 540, 1305, `600 22px ${SANS}`, "rgba(70,35,10,0.8)");
      grain(ctx, 0.05);
    },
  },
  {
    id: "ha-long",
    name: "Vịnh Hạ Long",
    draw(ctx, img, info) {
      const sky = ctx.createLinearGradient(0, 0, 0, 1000);
      sky.addColorStop(0, "#BFD8E0");
      sky.addColorStop(1, "#F1E6D2");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, FRAME_W, FRAME_H);
      glow(ctx, 260, 360, 300, "rgba(255,240,210,0.7)");
      // ba lớp núi đá vôi, xa nhạt gần đậm, có sương
      karst(ctx, 1000, 0.55, "#A9BCC2", 5);
      karst(ctx, 1010, 0.75, "#7E979E", 11);
      karst(ctx, 1020, 1, "#4D676D", 17);
      const mist = ctx.createLinearGradient(0, 860, 0, 1010);
      mist.addColorStop(0, "rgba(241,230,210,0)");
      mist.addColorStop(1, "rgba(241,230,210,0.75)");
      ctx.fillStyle = mist;
      ctx.fillRect(0, 860, FRAME_W, 150);
      // mặt biển
      const sea = ctx.createLinearGradient(0, 1000, 0, FRAME_H);
      sea.addColorStop(0, "#86A9AE");
      sea.addColorStop(1, "#2F5560");
      ctx.fillStyle = sea;
      ctx.fillRect(0, 1000, FRAME_W, FRAME_H - 1000);
      ctx.strokeStyle = "rgba(255,255,255,0.18)";
      ctx.lineWidth = 2;
      for (let i = 0; i < 26; i++) {
        const yy = 1015 + i * 13;
        const x0 = (i * 137) % 900;
        ctx.beginPath();
        ctx.moveTo(x0, yy);
        ctx.lineTo(x0 + 60 + (i % 4) * 30, yy);
        ctx.stroke();
      }
      junkBoat(ctx, 860, 1140, 1);

      matPhoto(ctx, img, 210, 110, 660, 820, 14, "#FFFFFF");
      text(ctx, info.title, 380, 1195, `italic 700 44px ${SERIF}`, "#FFFFFF");
      spaced(ctx, `VỊNH HẠ LONG · ${info.date}`, 380, 1245, `600 17px ${SANS}`, "rgba(255,255,255,0.8)", 5);
      text(ctx, BRAND, 540, 1310, `600 20px ${SANS}`, "rgba(255,255,255,0.7)");
      grain(ctx, 0.05);
    },
  },
  {
    id: "ho-guom",
    name: "Hồ Gươm",
    draw(ctx, img, info) {
      // trời chạng vạng
      const sky = ctx.createLinearGradient(0, 0, 0, 900);
      sky.addColorStop(0, "#1B2847");
      sky.addColorStop(0.6, "#4A4F7A");
      sky.addColorStop(1, "#E7A46A");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, FRAME_W, FRAME_H);
      // mặt hồ
      const lake = ctx.createLinearGradient(0, 900, 0, FRAME_H);
      lake.addColorStop(0, "#5B6A7A");
      lake.addColorStop(1, "#16222B");
      ctx.fillStyle = lake;
      ctx.fillRect(0, 900, FRAME_W, FRAME_H - 900);
      // Tháp Rùa trên gò giữa hồ
      ctx.fillStyle = "#1E2430";
      ctx.beginPath();
      ctx.ellipse(780, 935, 150, 22, 0, 0, Math.PI * 2);
      ctx.fill();
      turtleTower(ctx, 780, 930);
      [[700, 925, 40], [860, 925, 46], [655, 932, 28]].forEach(([x, yy, r]) => {
        ctx.beginPath();
        ctx.ellipse(x, yy - r * 0.6, r * 0.9, r, 0, 0, Math.PI * 2);
        ctx.fill();
      });
      // phản chiếu ánh đèn trên mặt nước
      ctx.strokeStyle = "rgba(255,200,120,0.35)";
      ctx.lineWidth = 3;
      for (let i = 0; i < 9; i++) {
        ctx.beginPath();
        ctx.moveTo(760 - i * 4, 960 + i * 22);
        ctx.lineTo(800 + i * 4, 960 + i * 22);
        ctx.stroke();
      }
      // cầu Thê Húc đỏ cong từ mép trái
      theHuc(ctx);
      // liễu rủ hai góc trên
      willow(ctx, 0, 1);
      willow(ctx, FRAME_W, -1);

      matPhoto(ctx, img, 230, 90, 620, 760, 14, "#FFF8EA");
      glowText(ctx, info.title, 540, 1215, `italic 700 44px ${SERIF}`, "#FFF1C9", "rgba(255,190,110,0.6)", 18);
      spaced(ctx, `HỒ GƯƠM · ${info.date}`, 540, 1263, `600 17px ${SANS}`, "rgba(255,241,201,0.8)", 5);
      text(ctx, BRAND, 540, 1310, `600 20px ${SANS}`, "rgba(255,241,201,0.65)");
      grain(ctx, 0.06);
    },
  },
  {
    id: "mien-tay",
    name: "Sông nước miền Tây",
    draw(ctx, img, info) {
      const sky = ctx.createLinearGradient(0, 0, 0, 900);
      sky.addColorStop(0, "#9FD2C6");
      sky.addColorStop(1, "#F6E6BC");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, FRAME_W, FRAME_H);
      glow(ctx, 540, 820, 380, "rgba(255,240,190,0.6)");
      // bờ xa với hàng dừa nước
      ctx.fillStyle = "#4F7A45";
      ctx.beginPath();
      ctx.moveTo(0, 900);
      for (let x = 0; x <= FRAME_W; x += 40) ctx.lineTo(x, 880 - Math.abs(Math.sin(x * 0.02)) * 24);
      ctx.lineTo(FRAME_W, 920);
      ctx.lineTo(0, 920);
      ctx.fill();
      // sông
      const river = ctx.createLinearGradient(0, 905, 0, FRAME_H);
      river.addColorStop(0, "#7FB3A6");
      river.addColorStop(1, "#2E6A64");
      ctx.fillStyle = river;
      ctx.fillRect(0, 905, FRAME_W, FRAME_H - 905);
      ctx.strokeStyle = "rgba(255,255,255,0.2)";
      ctx.lineWidth = 2;
      for (let i = 0; i < 18; i++) {
        const yy = 930 + i * 22;
        const x0 = (i * 211) % 980;
        ctx.beginPath();
        ctx.moveTo(x0, yy);
        ctx.quadraticCurveTo(x0 + 40, yy - 5, x0 + 90, yy);
        ctx.stroke();
      }
      // dừa hai bên
      palm(ctx, 60, 1000, 1, 1);
      palm(ctx, 150, 960, 0.75, 1);
      palm(ctx, 1030, 990, 1, -1);
      // xuồng ba lá có người đội nón lá
      sampan(ctx, 300, 1180);
      // sen ở góc dưới
      ctx.fillStyle = "#3E7D3A";
      [[930, 1290, 90], [1030, 1250, 70], [60, 1300, 70]].forEach(([x, yy, r]) => {
        ctx.beginPath();
        ctx.ellipse(x, yy, r, r * 0.35, -0.2, 0, Math.PI * 2);
        ctx.fill();
      });
      lotus(ctx, 960, 1240, 64, "#EFA3B8", "#F4D35E");
      lotus(ctx, 70, 1265, 46, "#F3B7C6", "#F4D35E");

      // khung tre
      ctx.save();
      ctx.shadowColor = "rgba(30,50,30,0.45)";
      ctx.shadowBlur = 36;
      ctx.shadowOffsetY = 14;
      ctx.fillStyle = "#D9BE85";
      ctx.fillRect(196, 96, 688, 828);
      ctx.restore();
      ctx.strokeStyle = "#A9874A";
      ctx.lineWidth = 3;
      for (const yy of [260, 520, 780]) {
        ctx.beginPath();
        ctx.moveTo(196, yy);
        ctx.lineTo(212, yy);
        ctx.moveTo(868, yy);
        ctx.lineTo(884, yy);
        ctx.stroke();
      }
      drawPhoto(ctx, img, 214, 114, 652, 792, 4, undefined, 0.75);
      text(ctx, info.title, 640, 1090, `italic 700 42px ${SERIF}`, "#FFFFFF");
      spaced(ctx, `MIỀN TÂY SÔNG NƯỚC · ${info.date}`, 640, 1138, `600 16px ${SANS}`, "rgba(255,255,255,0.85)", 4);
      text(ctx, BRAND, 640, 1318, `600 20px ${SANS}`, "rgba(255,255,255,0.75)");
      grain(ctx, 0.05);
    },
  },
  {
    id: "man-anh-rong",
    name: "Màn ảnh rộng",
    draw(ctx, img, info) {
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, FRAME_W, FRAME_H);
      const bar = 170;
      drawPhoto(ctx, img, 0, bar, FRAME_W, FRAME_H - bar * 2, 0, undefined, 1);
      anamorphicFlare(ctx, 760, 330, 900, "rgba(110,170,255,0.55)");
      // phụ đề vàng có viền đen như phim chiếu rạp
      const sub = `“Hôm nay mình mặc ${info.title.charAt(0).toLowerCase()}${info.title.slice(1)}.”`;
      ctx.save();
      const font = `600 38px ${SANS}`;
      const lines = wrap(ctx, sub, font, 900).slice(0, 2);
      ctx.font = font;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.lineJoin = "round";
      ctx.lineWidth = 8;
      ctx.strokeStyle = "rgba(0,0,0,0.85)";
      ctx.fillStyle = "#FFF2A8";
      lines.forEach((l, i) => {
        const y = FRAME_H - bar - 70 - (lines.length - 1 - i) * 50;
        ctx.strokeText(l, 540, y);
        ctx.fillText(l, 540, y);
      });
      ctx.restore();
      spaced(ctx, "VIỆT PHỤC REMIX", 60, 85, `700 20px ${SANS}`, "rgba(245,235,221,0.8)", 6, "left");
      text(ctx, info.date, FRAME_W - 60, 85, `600 22px ${SANS}`, "rgba(245,235,221,0.6)", "right");
      text(ctx, "00:12:47:09", 60, FRAME_H - 85, `600 22px ui-monospace, monospace`, "rgba(233,180,76,0.85)", "left");
      spaced(ctx, "CẢNH 07 · ĐÊM HỘI", 540, FRAME_H - 85, `600 18px ${SANS}`, "rgba(245,235,221,0.6)", 5);
      text(ctx, BRAND, FRAME_W - 60, FRAME_H - 85, `500 18px ${SANS}`, "rgba(245,235,221,0.5)", "right");
      grain(ctx, 0.06);
    },
  },
  {
    id: "phim-35mm",
    name: "Phim 35mm",
    draw(ctx, img, info) {
      // bàn đèn soi phim
      const bg = ctx.createRadialGradient(540, 600, 100, 540, 675, 950);
      bg.addColorStop(0, "#FBF6EC");
      bg.addColorStop(1, "#DCCDB3");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, FRAME_W, FRAME_H);
      grain(ctx, 0.04);

      ctx.save();
      ctx.translate(540, 640);
      ctx.rotate(-0.035);
      ctx.shadowColor = "rgba(40,25,10,0.45)";
      ctx.shadowBlur = 40;
      ctx.shadowOffsetY = 18;
      ctx.fillStyle = "#1B110A";
      ctx.fillRect(-410, -900, 820, 1800);
      ctx.shadowColor = "transparent";
      // ánh cam của đế phim ở hai mép
      ctx.fillStyle = "rgba(196,98,30,0.35)";
      ctx.fillRect(-410, -900, 70, 1800);
      ctx.fillRect(340, -900, 70, 1800);
      // lỗ răng cưa: lộ màu bàn đèn phía sau
      ctx.fillStyle = "#F4ECDD";
      for (let y = -890; y < 900; y += 56) {
        roundRectPath(ctx, -392, y, 34, 26, 5);
        ctx.fill();
        roundRectPath(ctx, 358, y, 34, 26, 5);
        ctx.fill();
      }
      // khung trên và dưới chỉ thấy một phần, khung chính ở giữa
      ctx.globalAlpha = 0.5;
      drawPhoto(ctx, img, -320, -1290, 640, 800, 4, undefined, 1);
      drawPhoto(ctx, img, -320, 410, 640, 800, 4, undefined, 1);
      ctx.globalAlpha = 1;
      drawPhoto(ctx, img, -320, -440, 640, 800, 4, undefined, 1);
      // ký hiệu in trên mép phim
      ctx.save();
      ctx.rotate(-Math.PI / 2);
      ["VIETPHUC 400", "▶ 12", "12A", "▶ 13", "VIETPHUC 400", "▶ 14"].forEach((t, i) =>
        text(ctx, t, 760 - i * 300, -375, `700 16px ui-monospace, monospace`, "#E0892B")
      );
      ctx.restore();
      ctx.restore();

      washiTape(ctx, 760, 1170, -0.12, "rgba(233,180,76,0.85)");
      ctx.save();
      ctx.translate(735, 1210);
      ctx.rotate(-0.05);
      ctx.shadowColor = "rgba(40,25,10,0.3)";
      ctx.shadowBlur = 16;
      ctx.fillStyle = "#FFFDF7";
      ctx.fillRect(-260, -45, 520, 115);
      ctx.shadowColor = "transparent";
      const title = wrap(ctx, info.title, `italic 700 34px ${SERIF}`, 480)[0];
      text(ctx, title, 0, 0, `italic 700 34px ${SERIF}`, "#2B2118");
      text(ctx, `${info.date} · ${BRAND}`, 0, 42, `500 17px ${SANS}`, "#8A7A6A");
      ctx.restore();
    },
  },
  {
    id: "son-mai",
    name: "Lụa & sơn mài",
    draw(ctx, img, info) {
      // nền sơn mài đỏ son sâu, có ánh và vụn vàng dát
      const bg = ctx.createRadialGradient(380, 300, 50, 540, 675, 1100);
      bg.addColorStop(0, "#6E1A16");
      bg.addColorStop(0.55, "#3A0B0A");
      bg.addColorStop(1, "#140303");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, FRAME_W, FRAME_H);
      let seed = 7;
      const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
      for (let i = 0; i < 160; i++) {
        ctx.fillStyle = `rgba(233,180,76,${0.08 + rand() * 0.35})`;
        ctx.save();
        ctx.translate(rand() * FRAME_W, rand() * FRAME_H);
        ctx.rotate(rand() * Math.PI);
        const sz = 2 + rand() * 7;
        ctx.fillRect(-sz / 2, -sz / 2, sz, sz * (0.4 + rand()));
        ctx.restore();
      }
      // khung gỗ sơn mài viền vàng
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.6)";
      ctx.shadowBlur = 50;
      ctx.shadowOffsetY = 20;
      ctx.fillStyle = "#1E0606";
      ctx.fillRect(110, 90, 860, 1000);
      ctx.restore();
      ctx.strokeStyle = goldFill(ctx, 90, 1090);
      ctx.lineWidth = 6;
      ctx.strokeRect(122, 102, 836, 976);
      ctx.lineWidth = 2;
      ctx.strokeRect(140, 120, 800, 940);
      // nền lụa có ánh chéo
      const silk = ctx.createLinearGradient(160, 140, 920, 1040);
      ["#F4E6CC", "#FFF6E4", "#EAD7B4", "#FBEFD8", "#E6D0A8"].forEach((c, i, a) => silk.addColorStop(i / (a.length - 1), c));
      ctx.fillStyle = silk;
      ctx.fillRect(160, 140, 760, 900);
      drawPhoto(ctx, img, 200, 180, 680, 820, 2, undefined, 0.9);
      ctx.strokeStyle = "rgba(200,144,47,0.7)";
      ctx.lineWidth = 2;
      ctx.strokeRect(200, 180, 680, 820);
      [[140, 120], [940, 120], [140, 1060], [940, 1060]].forEach(([x, y]) => lotus(ctx, x, y, 26, "#E9B44C", "#FFF1C9"));

      ctx.save();
      ctx.shadowColor = "rgba(233,180,76,0.4)";
      ctx.shadowBlur = 20;
      text(ctx, info.title, 540, 1170, `italic 700 56px ${SERIF}`, goldFill(ctx, 1140, 1200));
      ctx.restore();
      spaced(ctx, `${BRAND.toUpperCase()} · ${info.date}`, 540, 1245, `600 18px ${SANS}`, "rgba(246,217,138,0.75)", 4);
      grain(ctx, 0.05);
    },
  },
  {
    id: "trien-lam",
    name: "Phòng triển lãm",
    draw(ctx, img, info) {
      // tường vữa ấm, đèn rọi từ trần xuống
      ctx.fillStyle = "#BDB3A6";
      ctx.fillRect(0, 0, FRAME_W, FRAME_H);
      const spot = ctx.createRadialGradient(540, 420, 40, 540, 560, 820);
      spot.addColorStop(0, "rgba(255,244,222,0.95)");
      spot.addColorStop(0.5, "rgba(236,226,210,0.55)");
      spot.addColorStop(1, "rgba(60,52,44,0.55)");
      ctx.fillStyle = spot;
      ctx.fillRect(0, 0, FRAME_W, FRAME_H);
      grain(ctx, 0.05);
      // đèn rọi gắn trần
      ctx.fillStyle = "#1A1A1C";
      ctx.fillRect(500, 0, 80, 14);
      roundRectPath(ctx, 516, 10, 48, 36, 10);
      ctx.fill();
      glow(ctx, 540, 46, 60, "rgba(255,240,200,0.8)");

      // khung tranh: viền gỗ đen + giấy bồi trắng, bóng đổ xuống dưới theo hướng đèn
      ctx.save();
      ctx.shadowColor = "rgba(30,22,14,0.55)";
      ctx.shadowBlur = 60;
      ctx.shadowOffsetY = 34;
      ctx.fillStyle = "#17120E";
      ctx.fillRect(210, 150, 660, 860);
      ctx.restore();
      ctx.fillStyle = "#F7F3EC";
      ctx.fillRect(228, 168, 624, 824);
      const bevel = ctx.createLinearGradient(0, 168, 0, 992);
      bevel.addColorStop(0, "rgba(0,0,0,0.08)");
      bevel.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = bevel;
      ctx.fillRect(228, 168, 624, 824);
      drawPhoto(ctx, img, 290, 230, 500, 700, 0, undefined, 0.8);
      ctx.strokeStyle = "rgba(0,0,0,0.25)";
      ctx.lineWidth = 2;
      ctx.strokeRect(290, 230, 500, 700);

      // bảng tên bằng đồng
      ctx.save();
      ctx.shadowColor = "rgba(30,22,14,0.4)";
      ctx.shadowBlur = 14;
      ctx.shadowOffsetY = 6;
      const brass = ctx.createLinearGradient(330, 1080, 750, 1200);
      brass.addColorStop(0, "#B8893E");
      brass.addColorStop(0.5, "#F2D38A");
      brass.addColorStop(1, "#9C7030");
      ctx.fillStyle = brass;
      roundRectPath(ctx, 300, 1075, 480, 140, 6);
      ctx.fill();
      ctx.restore();
      const titleLines = wrap(ctx, info.title, `italic 700 30px ${SERIF}`, 430).slice(0, 2);
      titleLines.forEach((l, i) => text(ctx, l, 540, 1112 + i * 34, `italic 700 30px ${SERIF}`, "#3A2810"));
      text(ctx, `Việt Phục Remix, ${info.date.slice(-4)}`, 540, 1112 + titleLines.length * 34 + 4, `600 17px ${SANS}`, "#4A3416");
      text(ctx, "Ảnh thử đồ AI, in trên giấy mỹ thuật", 540, 1112 + titleLines.length * 34 + 30, `500 15px ${SANS}`, "#5A4220");
      text(ctx, BRAND, 540, 1290, `500 20px ${SANS}`, "rgba(60,48,36,0.7)");
    },
  },
  {
    id: "polaroid",
    name: "Polaroid dán tường",
    draw(ctx, img, info) {
      const bg = ctx.createLinearGradient(0, 0, FRAME_W, FRAME_H);
      bg.addColorStop(0, "#F3E7D3");
      bg.addColorStop(1, "#E4D2B6");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, FRAME_W, FRAME_H);
      grain(ctx, 0.05);
      ctx.save();
      ctx.translate(540, 660);
      ctx.rotate(-0.03);
      ctx.shadowColor = "rgba(60,40,20,0.35)";
      ctx.shadowBlur = 50;
      ctx.shadowOffsetY = 20;
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(-440, -580, 880, 1160);
      ctx.shadowColor = "transparent";
      drawPhoto(ctx, img, -400, -540, 800, 900, 4);
      text(ctx, info.title, 0, 430, `italic 700 48px ${SERIF}`, "#2B2118");
      text(ctx, BRAND, 0, 495, `500 28px ${SANS}`, "#8A7A6A");
      ctx.restore();
      washiTape(ctx, 250, 110, -0.35, "rgba(224,165,38,0.75)");
      washiTape(ctx, 840, 100, 0.3, "rgba(31,111,106,0.7)");
      heart(ctx, 960, 1230, 34, "#B83227");
      text(ctx, info.date, 120, 1260, `italic 600 30px ${SERIF}`, "#8A6A4A", "left");
    },
  },
  {
    id: "xuan",
    name: "Xuân rực rỡ",
    draw(ctx, img, info) {
      const g = ctx.createLinearGradient(0, 0, 0, FRAME_H);
      g.addColorStop(0, "#9E0F22");
      g.addColorStop(1, "#5E0814");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, FRAME_W, FRAME_H);
      glow(ctx, 540, 620, 620, "rgba(255,190,80,0.35)");
      ctx.strokeStyle = "#F4C542";
      ctx.lineWidth = 3;
      ctx.strokeRect(36, 36, FRAME_W - 72, FRAME_H - 72);
      ctx.lineWidth = 1.5;
      ctx.strokeRect(50, 50, FRAME_W - 100, FRAME_H - 100);
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.5)";
      ctx.shadowBlur = 40;
      ctx.fillStyle = "#F4C542";
      roundRectPath(ctx, 150, 200, 780, 880, 26);
      ctx.fill();
      ctx.restore();
      drawPhoto(ctx, img, 162, 212, 756, 856, 18);
      plumBranch(ctx, 60, 110, 1);
      plumBranch(ctx, 1020, 1000, -1);
      lantern(ctx, 150, 60, 120);
      lantern(ctx, 930, 30, 100);
      glowText(ctx, "Xuân an khang", 540, 1160, `italic 800 64px ${SERIF}`, "#FFE08A", "rgba(255,200,80,0.8)", 20);
      text(ctx, `${info.title} · ${BRAND}`, 540, 1240, `500 28px ${SANS}`, "#FFE9C7");
    },
  },
  {
    id: "trong-dong",
    name: "Trống đồng",
    draw(ctx, img, info) {
      ctx.fillStyle = "#231811";
      ctx.fillRect(0, 0, FRAME_W, FRAME_H);
      // mặt trống: tia mặt trời + các vòng hoa văn phía sau ảnh
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.translate(540, 560);
      star(ctx, 0, 0, 180, "#8C6A3A", 14, 0.35);
      ctx.strokeStyle = "#8C6A3A";
      for (let r = 240; r < 900; r += 70) {
        ctx.lineWidth = r % 140 === 100 ? 6 : 2;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.stroke();
      }
      for (let i = 0; i < 48; i++) {
        ctx.rotate((Math.PI * 2) / 48);
        ctx.beginPath();
        ctx.moveTo(0, -520);
        ctx.lineTo(14, -560);
        ctx.lineTo(-14, -560);
        ctx.fill();
      }
      ctx.restore();
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.6)";
      ctx.shadowBlur = 50;
      ctx.fillStyle = "#C8A15A";
      roundRectPath(ctx, 170, 160, 740, 900, 14);
      ctx.fill();
      ctx.restore();
      drawPhoto(ctx, img, 180, 170, 720, 880, 8);
      ctx.fillStyle = "#C8A15A";
      for (let x = 50; x < FRAME_W - 50; x += 30) {
        for (const y of [44, FRAME_H - 44]) {
          ctx.beginPath();
          ctx.moveTo(x, y - 8);
          ctx.lineTo(x + 15, y + 8);
          ctx.lineTo(x + 30, y - 8);
          ctx.fill();
        }
      }
      text(ctx, info.title.toUpperCase(), 540, 1135, `700 40px ${SERIF}`, "#F1DDAE");
      text(ctx, BRAND, 540, 1200, `500 28px ${SANS}`, "#C8A15A");
      grain(ctx, 0.05);
    },
  },
  {
    id: "tap-chi",
    name: "Bìa tạp chí",
    draw(ctx, img, info) {
      ctx.fillStyle = "#F7F1E8";
      ctx.fillRect(0, 0, FRAME_W, FRAME_H);
      drawPhoto(ctx, img, 0, 250, FRAME_W, FRAME_H - 250);
      text(ctx, "VIỆT PHỤC", 540, 120, `900 168px ${SERIF}`, "#B83227");
      text(ctx, "SỐ ĐẶC BIỆT · GEN Z MẶC CỔ PHỤC · " + info.date, 540, 222, `700 26px ${SANS}`, "#2B2118");
      // các dòng tiêu đề bên trái kiểu bìa báo
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      roundRectPath(ctx, 40, 300, 330, 210, 18);
      ctx.fill();
      text(ctx, "Phong cách", 205, 345, `italic 700 38px ${SERIF}`, "#2B2118");
      text(ctx, "của năm", 205, 390, `italic 700 38px ${SERIF}`, "#B83227");
      text(ctx, "Bí quyết mặc", 205, 440, `600 24px ${SANS}`, "#2B2118");
      text(ctx, "cổ phục thật chất", 205, 472, `600 24px ${SANS}`, "#2B2118");
      star(ctx, 960, 360, 80, "#E0A526", 16, 0.8);
      text(ctx, "HOT", 960, 350, `900 36px ${SANS}`, "#FFFFFF");
      text(ctx, "2026", 960, 385, `700 22px ${SANS}`, "#FFFFFF");
      const band = ctx.createLinearGradient(0, FRAME_H - 220, 0, FRAME_H);
      band.addColorStop(0, "rgba(0,0,0,0)");
      band.addColorStop(1, "rgba(0,0,0,0.75)");
      ctx.fillStyle = band;
      ctx.fillRect(0, FRAME_H - 220, FRAME_W, 220);
      text(ctx, info.title, 540, FRAME_H - 100, `italic 800 54px ${SERIF}`, "#FFFFFF");
      text(ctx, BRAND, 540, FRAME_H - 45, `600 26px ${SANS}`, "#F4C542");
    },
  },
  {
    id: "y2k",
    name: "Sticker Gen Z",
    draw(ctx, img, info) {
      const g = ctx.createLinearGradient(0, 0, FRAME_W, FRAME_H);
      g.addColorStop(0, "#FFC6DE");
      g.addColorStop(0.5, "#E5D4FF");
      g.addColorStop(1, "#BDE8FF");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, FRAME_W, FRAME_H);
      // ô caro dưới đáy
      for (let x = 0; x < FRAME_W; x += 60) {
        for (let y = FRAME_H - 180; y < FRAME_H; y += 60) {
          if (((x + y) / 60) % 2 === 0) {
            ctx.fillStyle = "rgba(255,255,255,0.55)";
            ctx.fillRect(x, y, 60, 60);
          }
        }
      }
      ctx.save();
      ctx.translate(540, 610);
      ctx.rotate(0.025);
      ctx.shadowColor = "rgba(107,79,160,0.35)";
      ctx.shadowBlur = 40;
      ctx.fillStyle = "#FFFFFF";
      roundRectPath(ctx, -410, -500, 820, 1000, 56);
      ctx.fill();
      ctx.shadowColor = "transparent";
      drawPhoto(ctx, img, -386, -476, 772, 952, 40);
      ctx.restore();
      sticker(ctx, 190, 150, "slay ✦", "#FF5FA2", "#FFFFFF", -0.2);
      sticker(ctx, 880, 1030, "so cute!", "#7B61FF", "#FFFFFF", 0.15);
      star(ctx, 960, 170, 50, "#FFC94D");
      star(ctx, 90, 930, 36, "#FFC94D");
      heart(ctx, 110, 1120, 48, "#FF5FA2");
      heart(ctx, 1000, 560, 36, "#7B61FF");
      text(ctx, info.title, 540, 1210, `800 44px ${SANS}`, "#5B3D99");
      text(ctx, BRAND, 540, 1270, `600 26px ${SANS}`, "#7A5BB8");
    },
  },
  {
    id: "ky-yeu",
    name: "Kỷ yếu thanh xuân",
    draw(ctx, img, info) {
      const g = ctx.createLinearGradient(0, 0, 0, FRAME_H);
      g.addColorStop(0, "#1B2640");
      g.addColorStop(1, "#0E1528");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, FRAME_W, FRAME_H);
      glow(ctx, 540, 520, 560, "rgba(224,165,38,0.18)");
      let s = 5;
      const rand = () => ((s = (s * 16807) % 2147483647) / 2147483647);
      for (let i = 0; i < 40; i++) star(ctx, rand() * FRAME_W, rand() * 300, 3 + rand() * 7, "rgba(244,197,66,0.8)", 4, 0.3);
      text(ctx, "KỶ YẾU", 540, 105, `800 64px ${SERIF}`, "#F4C542");
      text(ctx, "MÃI MỘT THỜI ÁO TRẮNG", 540, 165, `600 24px ${SANS}`, "#C9D3E8");
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.55)";
      ctx.shadowBlur = 40;
      ctx.fillStyle = "#F4C542";
      roundRectPath(ctx, 150, 215, 780, 880, 16);
      ctx.fill();
      ctx.restore();
      drawPhoto(ctx, img, 160, 225, 760, 860, 10);
      const year = info.date.slice(-4);
      ctx.fillStyle = "#B83227";
      ctx.beginPath();
      ctx.moveTo(250, 1080);
      ctx.lineTo(830, 1080);
      ctx.lineTo(790, 1130);
      ctx.lineTo(830, 1180);
      ctx.lineTo(250, 1180);
      ctx.lineTo(290, 1130);
      ctx.closePath();
      ctx.fill();
      text(ctx, `Thanh xuân ${year} · ${info.title}`, 540, 1131, `700 34px ${SERIF}`, "#FFFFFF");
      text(ctx, BRAND, 540, 1250, `500 28px ${SANS}`, "#C9D3E8");
    },
  },
  {
    id: "dong-ho",
    name: "Tranh Đông Hồ",
    draw(ctx, img, info) {
      ctx.fillStyle = "#EFDFC0";
      ctx.fillRect(0, 0, FRAME_W, FRAME_H);
      let s = 7;
      const rand = () => ((s = (s * 16807) % 2147483647) / 2147483647);
      ctx.fillStyle = "rgba(120,90,50,0.12)";
      for (let i = 0; i < 1800; i++) ctx.fillRect(rand() * FRAME_W, rand() * FRAME_H, 2 + rand() * 4, 1 + rand() * 2);
      ctx.lineWidth = 16;
      ctx.strokeStyle = "#B83227";
      ctx.strokeRect(56, 56, FRAME_W - 112, FRAME_H - 112);
      ctx.lineWidth = 6;
      ctx.strokeStyle = "#1F6F6A";
      ctx.strokeRect(86, 86, FRAME_W - 172, FRAME_H - 172);
      // góc hoa văn
      for (const [x, y] of [[86, 86], [FRAME_W - 86, 86], [86, FRAME_H - 86], [FRAME_W - 86, FRAME_H - 86]]) {
        blossom(ctx, x, y, 26, "#E0A526", "#B83227");
      }
      drawPhoto(ctx, img, 140, 140, 800, 920);
      text(ctx, info.title, 540, 1140, `italic 700 46px ${SERIF}`, "#B83227");
      text(ctx, BRAND, 540, 1200, `600 28px ${SANS}`, "#1F6F6A");
      seal(ctx, 900, 1180, 104, -0.08);
    },
  },
  {
    id: "cua-vom",
    name: "Cửa vòm ngọc bích",
    draw(ctx, img, info) {
      const g = ctx.createLinearGradient(0, 0, 0, FRAME_H);
      g.addColorStop(0, "#16524E");
      g.addColorStop(1, "#0C302D");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, FRAME_W, FRAME_H);
      glow(ctx, 540, 500, 600, "rgba(224,165,38,0.22)");
      // đường art-deco tỏa ra sau cửa vòm
      ctx.strokeStyle = "rgba(224,165,38,0.35)";
      ctx.lineWidth = 2;
      for (let i = 0; i <= 18; i++) {
        const a = Math.PI + (i * Math.PI) / 18;
        ctx.beginPath();
        ctx.moveTo(540, 520);
        ctx.lineTo(540 + Math.cos(a) * 900, 520 + Math.sin(a) * 900);
        ctx.stroke();
      }
      const [ax, ay, aw, ah] = [200, 120, 680, 960];
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.5)";
      ctx.shadowBlur = 40;
      ctx.fillStyle = "#E0A526";
      archPath(ctx, ax - 16, ay - 16, aw + 32, ah + 32);
      ctx.fill();
      ctx.restore();
      drawPhoto(ctx, img, ax, ay, aw, ah, 0, () => archPath(ctx, ax, ay, aw, ah));
      lotus(ctx, 540, 1130, 110, "#E0A526", "#16524E");
      text(ctx, info.title, 540, 1195, `italic 700 44px ${SERIF}`, "#F6E3B4");
      text(ctx, BRAND, 540, 1255, `500 26px ${SANS}`, "#E0A526");
    },
  },
  {
    id: "neon",
    name: "Neon đêm hội",
    draw(ctx, img, info) {
      const g = ctx.createLinearGradient(0, 0, 0, FRAME_H);
      g.addColorStop(0, "#150A2E");
      g.addColorStop(1, "#070312");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, FRAME_W, FRAME_H);
      glow(ctx, 200, 200, 500, "rgba(255,60,172,0.28)");
      glow(ctx, 900, 1100, 520, "rgba(0,229,255,0.22)");
      drawPhoto(ctx, img, 150, 190, 780, 880, 30);
      // viền neon hai màu
      ctx.save();
      ctx.lineWidth = 8;
      for (const [color, inset] of [["#FF3CAC", 0], ["#00E5FF", 22]] as const) {
        ctx.strokeStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 30;
        roundRectPath(ctx, 150 - 18 - inset, 190 - 18 - inset, 780 + 36 + inset * 2, 880 + 36 + inset * 2, 44 + inset);
        ctx.stroke();
      }
      ctx.restore();
      glowText(ctx, "VIỆT PHỤC NIGHT", 540, 105, `900 72px ${SANS}`, "#FFFFFF", "#FF3CAC", 30);
      glowText(ctx, info.title, 540, 1175, `italic 700 48px ${SERIF}`, "#FFFFFF", "#00E5FF", 24);
      text(ctx, BRAND, 540, 1245, `600 26px ${SANS}`, "#C7B8FF");
      grain(ctx, 0.05);
    },
  },
  {
    id: "truyen-tranh-nam",
    name: "Truyện tranh xưa · Nam",
    draw(ctx, img, info) {
      folkComicPage(ctx, img, info, { heading: "Chuyện chàng thư sinh", quote: "Bảnh ra phết!", gender: "nam", accent: "#2F5C8C" });
    },
  },
  {
    id: "truyen-tranh-nu",
    name: "Truyện tranh xưa · Nữ",
    draw(ctx, img, info) {
      folkComicPage(ctx, img, info, { heading: "Chuyện cô thôn nữ", quote: "Duyên quá đi thôi!", gender: "nu", accent: "#B83227" });
    },
  },
];

// ---------- dựng ảnh ----------

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Không đọc được ảnh."));
    img.src = src;
  });
}

// Google Fonts chia font thành nhiều phần theo bảng chữ; phải đưa chữ tiếng Việt mẫu
// để trình duyệt tải cả phần "vietnamese", nếu không Canvas sẽ vẽ dấu rời khỏi chữ.
const VI_SAMPLE = "Đồng hành cùng Việt Phục Remix KỶ YẾU ắằẳẵặ ấầẩẫậ ếềểễệ ốồổỗộ ớờởỡợ ứừửữự ỳỷỹỵ đĐ";

let fontsReady: Promise<unknown> | null = null;
/** Canvas chỉ dùng được font web (và ảnh nhân vật) sau khi trình duyệt đã tải xong */
export function ensureFonts() {
  fontsReady ??= Promise.all(
    [
      `700 40px ${SERIF}`,
      `italic 700 40px ${SERIF}`,
      `italic 800 40px ${SERIF}`,
      `800 40px ${SERIF}`,
      `900 40px ${SERIF}`,
      `500 30px ${SANS}`,
      `600 30px ${SANS}`,
      `700 30px ${SANS}`,
      `800 30px ${SANS}`,
      `900 30px ${SANS}`,
    ]
      .map((f): Promise<unknown> => document.fonts.load(f, VI_SAMPLE).catch(() => null))
      .concat(
        (["nam", "nu"] as const).map((g) =>
          loadImage(characterDataUrl(g))
            .then((im) => (characters[g] = im))
            .catch(() => null)
        )
      )
  );
  return fontsReady;
}

/** Vẽ khung ra canvas; scale < 1 để làm ảnh xem trước nhẹ hơn */
export function renderFrame(frame: FrameDef, img: HTMLImageElement, info: FrameInfo, scale = 1): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(FRAME_W * scale);
  canvas.height = Math.round(FRAME_H * scale);
  const ctx = canvas.getContext("2d")!;
  ctx.scale(scale, scale);
  frame.draw(ctx, img, info);
  return canvas;
}

export function todayVN() {
  return new Date().toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}
