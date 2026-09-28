# Việt Phục Remix

Ứng dụng web giúp học sinh, sinh viên chọn trang phục truyền thống Việt Nam theo gu của mình, mặc thử lên ảnh của chính mình và đọc ý nghĩa văn hóa của từng bộ.

Luồng: **Chọn gu → Chọn bộ (gợi ý hoặc thư viện) → Thử đồ → Tải về / Phối tiếp / Lưu lookbook**.

## Chạy trên máy

Cần có Node.js 20 trở lên.

1. Cài thư viện:
   ```
   npm install
   ```
2. Mở file `.env`:
   - `HF_TOKEN`: token Hugging Face quyền Read (https://huggingface.co/settings/tokens). Dùng để ghép ảnh bằng OOTDiffusion.
   - `GEMINI_API_KEY`: Gemini API key (https://aistudio.google.com/apikey). Dùng để viết lời khuyên phối đồ trong Thẻ văn hóa.
3. Chạy:
   ```
   npm run dev
   ```
4. Mở http://localhost:3000

Thiếu `HF_TOKEN` thì nút Ghép ảnh bị khóa và app hiện thông báo. Thiếu `GEMINI_API_KEY` thì phần lời khuyên AI bị ẩn. Các phần khác vẫn dùng bình thường.

## Lệnh khác

| Lệnh | Tác dụng |
|---|---|
| `npm run lint` | Kiểm tra lỗi TypeScript |
| `npm run build` | Build giao diện vào `dist/` |
| `npm start` | Chạy bản production (cần `npm run build` trước) |

## Ảnh bộ đồ cho OOTDiffusion

OOTDiffusion ghép tốt nhất khi ảnh trong `public/img/outfits/` là **ảnh riêng bộ trang phục** (trải phẳng hoặc treo móc, nền trắng, thấy trọn thân áo và tà), không phải ảnh người đang mặc. Ảnh người dùng nên là ảnh toàn thân, đứng thẳng, nền gọn. Tên file ảnh phải trùng `id` của bộ đồ trong `src/data/outfits.ts`.

## Cấu hình

- `src/config.ts`: tên model Gemini (`TEXT_MODEL`), số lượt ghép mỗi phiên, loại vùng thay đồ cho OOTDiffusion.
- `.env`: `OOTD_SPACE` để đổi sang Space thử đồ khác (mặc định `levihsu/OOTDiffusion`).

## Cấu trúc chính

- `server.ts`: server Express, giữ token/key. Endpoint: `/api/status`, `/api/try-on` (OOTDiffusion), `/api/styling-tips` (Gemini).
- `ootd.ts`: gọi Space OOTDiffusion trên Hugging Face.
- `src/data/`: catalog bộ đồ, phụ kiện, quy tắc phối, nhãn tiếng Việt.
- `src/logic/`: gợi ý, quy tắc phụ kiện, xử lý ảnh, lookbook (code thường, không dùng AI).
- `src/services/`: gọi server (`tryOn.ts`, `geminiText.ts`).
- `src/components/ui.tsx`: nút, thẻ, chip dùng chung. Bảng màu nằm trong `src/index.css`.
- `src/screens/`: 6 màn hình (Trang chủ, Bộ lọc, Gợi ý, Thư viện, Phòng thử đồ, Lookbook).
- `public/img/`: ảnh bộ đồ, phụ kiện, người mẫu.
