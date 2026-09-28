# Việt Phục Remix

Ứng dụng web giúp học sinh, sinh viên chọn và phối trang phục truyền thống Việt Nam theo phong cách Gen Z, thử đồ trên ảnh bằng Gemini, và đọc ý nghĩa văn hóa của từng bộ.

## Chạy trên máy

Cần có Node.js 20 trở lên.

1. Cài thư viện:
   ```
   npm install
   ```
2. Mở file `.env`, thay `DAN_API_KEY_VAO_DAY` bằng Gemini API key (lấy tại https://aistudio.google.com/apikey).
3. Chạy:
   ```
   npm run dev
   ```
4. Mở http://localhost:3000

Nếu chưa dán key, app vẫn mở được: bộ lọc, gợi ý, thư viện, thẻ văn hóa và lookbook vẫn dùng bình thường. Chỉ các nút gọi AI sẽ báo "Máy chủ chưa có GEMINI_API_KEY".

## Lệnh khác

| Lệnh | Tác dụng |
|---|---|
| `npm run lint` | Kiểm tra lỗi TypeScript |
| `npm run build` | Build giao diện vào `dist/` |
| `npm start` | Chạy bản production (cần `npm run build` trước) |

## Đổi model

Tên model nằm trong `src/config.ts` (`TEXT_MODEL`, `IMAGE_MODEL`). Nếu Gemini báo không tìm thấy model, sửa tên ở đó.

## Cấu trúc chính

- `server.ts`: server Express. Giữ API key và gọi Gemini qua các endpoint `/api/try-on`, `/api/edit-image`, `/api/check-request`, `/api/styling-tips`.
- `src/data/`: catalog bộ đồ, phụ kiện, quy tắc phối, nhãn tiếng Việt.
- `src/logic/`: gợi ý, quy tắc phụ kiện, xử lý ảnh, lookbook (code thường, không dùng AI).
- `src/services/`: gọi server để dùng AI.
- `src/screens/`, `src/components/`: giao diện.
- `public/img/`: ảnh bộ đồ, phụ kiện, người mẫu.
