# Việt Phục Remix

Ứng dụng web giúp học sinh, sinh viên chọn trang phục truyền thống Việt Nam theo gu của mình, mặc thử lên ảnh của chính mình và đọc ý nghĩa văn hóa của từng bộ.

Luồng: **Chọn gu → Chọn bộ (gợi ý hoặc thư viện) → Thử đồ → Tải về / Phối tiếp / Lưu lookbook**.

## Chạy trên máy

Cần có Node.js 22.12 trở lên; nên dùng Node.js 24 LTS.

1. Cài thư viện:
   ```
   npm ci
   ```
2. Sao chép `.env.example` thành `.env`, rồi điền:
   - `HF_TOKEN`: token Hugging Face quyền Read (https://huggingface.co/settings/tokens). Dùng để ghép ảnh bằng OOTDiffusion.
   - `GEMINI_API_KEY`: Gemini API key (https://aistudio.google.com/apikey). Dùng để chọn lookbook và viết bí mật tính cách trong Thẻ văn hóa.
3. Chạy:
   ```
   npm run dev
   ```
4. Mở http://localhost:3000

Thiếu `HF_TOKEN` thì nút Ghép ảnh bị khóa và app hiện thông báo. Thiếu `GEMINI_API_KEY` thì gợi ý lookbook và bí mật tính cách dùng kết quả dự phòng. Các phần khác vẫn dùng bình thường.

## Lệnh khác

| Lệnh | Tác dụng |
|---|---|
| `npm run lint` | Kiểm tra lỗi TypeScript |
| `npm run build` | Build giao diện vào `dist/` |
| `npm start` | Chạy bản production (cần `npm run build` trước) |

## Ảnh bộ đồ cho OOTDiffusion

OOTDiffusion ghép tốt nhất khi ảnh trong `public/img/outfits/` là **ảnh riêng bộ trang phục** (trải phẳng hoặc treo móc, nền trắng, thấy trọn thân áo và tà), không phải ảnh người đang mặc. Ảnh người dùng nên là ảnh toàn thân, đứng thẳng, nền gọn. Tên file ảnh phải trùng `id` của bộ đồ trong `src/data/outfits.ts`.

## Cấu hình

- `src/config.ts`: số lượt ghép mỗi phiên, loại vùng thay đồ cho OOTDiffusion.
- `geminiClient.ts`: chuỗi model Gemini và giới hạn thời gian gọi AI.
- `.env`: `OOTD_SPACE` để đổi sang Space thử đồ khác (mặc định `levihsu/OOTDiffusion`).

## Cấu trúc chính

- `server.ts`: server Express, giữ token/key. Endpoint: `/api/status`, `/api/try-on` (OOTDiffusion), `/api/personality` và `/api/suggest-look` (Gemini).
- `ootd.ts`: gọi Space OOTDiffusion trên Hugging Face.
- `src/data/`: catalog bộ đồ, lookbook mẫu, người mẫu và nhãn tiếng Việt.
- `src/logic/`: gợi ý, xử lý ảnh, khung ảnh và lưu lookbook (code thường, không dùng AI).
- `src/services/`: gọi server (`tryOn.ts`, `geminiText.ts`).
- `src/components/ui.tsx`: nút, thẻ, chip dùng chung. Bảng màu nằm trong `src/index.css`.
- `src/screens/`: 6 màn hình (Trang chủ, Bộ lọc, Gợi ý, Thư viện, Phòng thử đồ, Lookbook).
- `public/img/`: ảnh bộ đồ, áo/quần riêng và người mẫu.

## GitHub và Google AI Studio

Xem [hướng dẫn kiểm tra, import và publish](DEPLOY_AI_STUDIO.md). Khi triển khai phải chạy cả server Express bằng `npm start` sau `npm run build`; `npm run preview` chỉ phục vụ giao diện. Cổng lấy từ biến môi trường `PORT`, mặc định `3000` khi chạy trên máy.
