/**
 * 12 khung ảnh lookbook vẽ bằng Canvas (không cần file ảnh, chạy hoàn toàn trên trình duyệt).
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
import { StudentAvatar } from "../components/StudentAvatar";

const SERIF = '"Playfair Display", Georgia, serif';
const SANS = '"Be Vietnam Pro", system-ui, sans-serif';
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

/**
 * Vẽ ảnh vào vùng cho trước: ảnh hiện TRỌN (contain), nền phía sau là chính ảnh phóng to + làm mờ.
 * clipPath cho phép cắt theo hình tùy ý (bo góc, cửa vòm...).
 */
function drawPhoto(ctx: Ctx, img: HTMLImageElement, x: number, y: number, w: number, h: number, r = 0, clipPath?: () => void) {
  ctx.save();
  if (clipPath) clipPath();
  else roundRectPath(ctx, x, y, w, h, r);
  ctx.clip();

  const cover = Math.max(w / img.width, h / img.height) * 1.2;
  ctx.filter = "blur(26px) saturate(1.15) brightness(0.8)";
  ctx.drawImage(img, x + (w - img.width * cover) / 2, y + (h - img.height * cover) / 2, img.width * cover, img.height * cover);
  ctx.filter = "none";
  ctx.fillStyle = "rgba(0,0,0,0.12)";
  ctx.fillRect(x, y, w, h);

  const fit = Math.min(w / img.width, h / img.height) * 0.97;
  const dw = img.width * fit;
  const dh = img.height * fit;
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
  ctx.restore();
}

function text(ctx: Ctx, value: string, x: number, y: number, font: string, color: string, align: CanvasTextAlign = "center") {
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

/** Hạt film nhẹ cho cảm giác điện ảnh */
function grain(ctx: Ctx, alpha = 0.06, seed = 11) {
  let s = seed;
  const rand = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  ctx.fillStyle = `rgba(255,255,255,${alpha})`;
  for (let i = 0; i < 2200; i++) ctx.fillRect(rand() * FRAME_W, rand() * FRAME_H, 1.6, 1.6);
  ctx.fillStyle = `rgba(0,0,0,${alpha})`;
  for (let i = 0; i < 2200; i++) ctx.fillRect(rand() * FRAME_W, rand() * FRAME_H, 1.6, 1.6);
}

/** Tối dần ở mép ảnh (vignette) */
function vignette(ctx: Ctx, strength = 0.55) {
  const g = ctx.createRadialGradient(FRAME_W / 2, FRAME_H / 2, FRAME_H * 0.25, FRAME_W / 2, FRAME_H / 2, FRAME_H * 0.75);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(1, `rgba(0,0,0,${strength})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, FRAME_W, FRAME_H);
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


/** Nhân vật chibi học sinh (dùng lại SVG StudentAvatar), nạp sẵn trong ensureFonts() */
const characters: Partial<Record<"nam" | "nu", HTMLImageElement>> = {};

function characterDataUrl(gender: "nam" | "nu") {
  const svg = renderToStaticMarkup(createElement(StudentAvatar, { gender, age: "16_18" })).replace(
    "<svg",
    '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="750"'
  );
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function drawCharacter(ctx: Ctx, gender: "nam" | "nu", x: number, y: number, w: number) {
  const img = characters[gender];
  if (img) ctx.drawImage(img, x, y, w, w * 1.25);
}

function speechBubble(ctx: Ctx, x: number, y: number, label: string, bg: string, fg: string, tailLeft = true) {
  ctx.font = `800 36px ${SANS}`;
  const w = ctx.measureText(label).width + 60;
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.15)";
  ctx.shadowBlur = 14;
  ctx.fillStyle = bg;
  roundRectPath(ctx, x, y, w, 76, 38);
  ctx.fill();
  ctx.beginPath();
  const tx = tailLeft ? x + 50 : x + w - 50;
  ctx.moveTo(tx - 18, y + 70);
  ctx.lineTo(tx + (tailLeft ? -26 : 26), y + 112);
  ctx.lineTo(tx + 18, y + 70);
  ctx.fill();
  ctx.restore();
  text(ctx, label, x + w / 2, y + 39, `800 36px ${SANS}`, fg);
}

function paperPlane(ctx: Ctx, x: number, y: number, s: number, color: string) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + s, y - s * 0.45);
  ctx.lineTo(x + s * 0.55, y + s * 0.35);
  ctx.closePath();
  ctx.moveTo(x + s, y - s * 0.45);
  ctx.lineTo(x + s * 0.4, y + s * 0.05);
  ctx.stroke();
  ctx.setLineDash([10, 12]);
  ctx.beginPath();
  ctx.moveTo(x - 10, y + 10);
  ctx.bezierCurveTo(x - 120, y + 60, x - 60, y + 160, x - 200, y + 150);
  ctx.stroke();
  ctx.restore();
}

function bow(ctx: Ctx, cx: number, cy: number, s: number, color: string) {
  ctx.fillStyle = color;
  for (const dir of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.bezierCurveTo(cx + dir * s, cy - s * 0.7, cx + dir * s * 1.2, cy + s * 0.6, cx, cy);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + dir * s * 0.45, cy + s * 1.1);
    ctx.lineTo(cx + dir * s * 0.15, cy + s * 1.05);
    ctx.closePath();
    ctx.fill();
  }
  ctx.beginPath();
  ctx.arc(cx, cy, s * 0.2, 0, Math.PI * 2);
  ctx.fill();
}

// ---------- 12 khung, mỗi khung một tinh thần riêng ----------

export const FRAMES: FrameDef[] = [
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
    id: "rap-phim",
    name: "Rạp chiếu phim",
    draw(ctx, img, info) {
      ctx.fillStyle = "#0B0B0D";
      ctx.fillRect(0, 0, FRAME_W, FRAME_H);
      glow(ctx, 540, 0, 900, "rgba(255,230,180,0.18)");
      // bảng clapperboard phía trên
      ctx.fillStyle = "#F2EDE4";
      ctx.fillRect(120, 70, 840, 70);
      ctx.fillStyle = "#0B0B0D";
      for (let x = 120; x < 960; x += 84) {
        ctx.beginPath();
        ctx.moveTo(x, 70);
        ctx.lineTo(x + 42, 70);
        ctx.lineTo(x + 20, 140);
        ctx.lineTo(x - 22, 140);
        ctx.fill();
      }
      text(ctx, "SCENE 01", 120, 185, `700 30px ${SANS}`, "#E0A526", "left");
      text(ctx, `TAKE ${info.date}`, 960, 185, `700 30px ${SANS}`, "#E0A526", "right");
      // cuộn phim hai bên
      ctx.fillStyle = "#1C1C20";
      ctx.fillRect(0, 0, 90, FRAME_H);
      ctx.fillRect(FRAME_W - 90, 0, 90, FRAME_H);
      ctx.fillStyle = "#F2EDE4";
      for (let y = 20; y < FRAME_H; y += 64) {
        roundRectPath(ctx, 26, y, 38, 30, 6);
        ctx.fill();
        roundRectPath(ctx, FRAME_W - 64, y, 38, 30, 6);
        ctx.fill();
      }
      drawPhoto(ctx, img, 120, 220, 840, 900, 6);
      vignette(ctx, 0.5);
      glowText(ctx, info.title, 540, 1185, `italic 700 50px ${SERIF}`, "#FFFFFF", "rgba(255,210,140,0.7)", 18);
      text(ctx, `A VIỆT PHỤC REMIX PICTURE · ${BRAND}`, 540, 1255, `600 22px ${SANS}`, "#B8B0A4");
      grain(ctx, 0.07);
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
      // triện son
      ctx.save();
      ctx.translate(900, 1180);
      ctx.rotate(-0.08);
      ctx.fillStyle = "#C0182B";
      roundRectPath(ctx, -52, -52, 104, 104, 10);
      ctx.fill();
      text(ctx, "VIỆT", 0, -18, `800 28px ${SERIF}`, "#FFF1E0");
      text(ctx, "PHỤC", 0, 20, `800 28px ${SERIF}`, "#FFF1E0");
      ctx.restore();
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
    id: "nhat-ky-nam-sinh",
    name: "Nhật ký nam sinh",
    draw(ctx, img, info) {
      ctx.fillStyle = "#F8F6EF";
      ctx.fillRect(0, 0, FRAME_W, FRAME_H);
      // giấy vở kẻ dòng + lề đỏ
      ctx.strokeStyle = "rgba(90,130,200,0.28)";
      ctx.lineWidth = 2;
      for (let y = 60; y < FRAME_H; y += 46) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(FRAME_W, y);
        ctx.stroke();
      }
      ctx.strokeStyle = "rgba(216,69,58,0.5)";
      ctx.beginPath();
      ctx.moveTo(110, 0);
      ctx.lineTo(110, FRAME_H);
      ctx.stroke();
      text(ctx, "Nhật ký lớp mình ✎", 150, 100, `italic 700 50px ${SERIF}`, "#2F4A8A", "left");
      paperPlane(ctx, 880, 90, 110, "#2F4A8A");
      ctx.save();
      ctx.translate(560, 610);
      ctx.rotate(0.03);
      ctx.shadowColor = "rgba(40,50,90,0.3)";
      ctx.shadowBlur = 30;
      ctx.shadowOffsetY = 12;
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(-370, -440, 740, 900);
      ctx.shadowColor = "transparent";
      drawPhoto(ctx, img, -340, -410, 680, 780, 4);
      ctx.restore();
      washiTape(ctx, 560, 170, -0.05, "rgba(90,130,200,0.7)");
      for (const [x, y, r] of [[990, 420, 26], [150, 380, 20], [1000, 760, 18]] as const) star(ctx, x, y, r, "#E9B44C");
      drawCharacter(ctx, "nam", -10, 900, 350);
      speechBubble(ctx, 250, 960, "Chất quá trời!", "#2F4A8A", "#FFFFFF");
      text(ctx, info.title, 1010, 1150, `italic 700 44px ${SERIF}`, "#2F4A8A", "right");
      text(ctx, BRAND, 1010, 1215, `600 26px ${SANS}`, "#5A6F9E", "right");
      text(ctx, info.date, 1010, 1265, `500 24px ${SANS}`, "#8A98B8", "right");
    },
  },
  {
    id: "nhat-ky-nu-sinh",
    name: "Nhật ký nữ sinh",
    draw(ctx, img, info) {
      const g = ctx.createLinearGradient(0, 0, 0, FRAME_H);
      g.addColorStop(0, "#FFE3EE");
      g.addColorStop(1, "#FFC9DD");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, FRAME_W, FRAME_H);
      // chấm bi
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      for (let y = 30; y < FRAME_H; y += 70) {
        for (let x = (y / 70) % 2 ? 30 : 65; x < FRAME_W; x += 70) {
          ctx.beginPath();
          ctx.arc(x, y, 7, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      bow(ctx, 540, 95, 70, "#FF5FA2");
      text(ctx, "Thanh xuân rực rỡ", 540, 205, `italic 800 50px ${SERIF}`, "#C2185B");
      ctx.save();
      ctx.shadowColor = "rgba(194,24,91,0.3)";
      ctx.shadowBlur = 36;
      ctx.fillStyle = "#FFFFFF";
      roundRectPath(ctx, 150, 260, 780, 820, 48);
      ctx.fill();
      ctx.restore();
      drawPhoto(ctx, img, 172, 282, 736, 776, 34);
      heart(ctx, 130, 330, 50, "#FF5FA2");
      heart(ctx, 960, 260, 38, "#FF8FC0");
      heart(ctx, 980, 700, 30, "#FF5FA2");
      star(ctx, 110, 760, 26, "#FFC94D");
      drawCharacter(ctx, "nu", 740, 900, 350);
      speechBubble(ctx, 470, 960, "Xinh xỉu luôn!", "#FF5FA2", "#FFFFFF", false);
      text(ctx, info.title, 90, 1160, `italic 700 44px ${SERIF}`, "#C2185B", "left");
      text(ctx, BRAND, 90, 1222, `600 26px ${SANS}`, "#D0588E", "left");
      text(ctx, info.date, 90, 1270, `500 24px ${SANS}`, "#E08AB0", "left");
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
