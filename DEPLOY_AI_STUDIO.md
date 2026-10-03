# Đưa Việt Phục Remix từ GitHub lên Google AI Studio

Luồng: **source trên máy → GitHub → Google AI Studio Build → Publish (Cloud Run)**. Google AI Studio có chức năng import repository và đồng bộ GitHub, theo [tài liệu Build chính thức](https://ai.google.dev/gemini-api/docs/aistudio-build-mode).

Project là **React + Vite + TypeScript ở giao diện, Express/Node.js ở server**:

- Ghép ảnh gọi API CatVTON đã fine-tune cho Việt phục, chạy trên Modal (code ở project `train_model_VTTon/deploy`).
- Gemini chỉ tạo nội dung chữ: chọn lookbook hợp gu và viết lời khen "Phong thái khi diện bộ này".

Vì vậy phải triển khai cả server Express. Chỉ host `dist/` hoặc chạy `npm run preview` sẽ thiếu các API mà giao diện cần.

## Hiện trạng source

| Phần | Giá trị |
| --- | --- |
| Kiểm tra | `npm run lint` (`tsc --noEmit`) và `npm run build` đều qua. |
| Dữ liệu | 132 bộ trang phục, 12 phụ kiện (mỗi món 11 màu), 10 lookbook mẫu, 2 người mẫu, 20 khung ảnh. |
| Ảnh tĩnh | 269 file trong `public/`, khoảng 22 MB (ảnh WebP). Ảnh PNG gốc để ngoài repo ở `../assets_goc/`. |
| Key | `.env` bị Git bỏ qua và chưa từng được commit. Key chỉ nằm ở server, không đưa vào frontend. |

## Bước 1: Đẩy source lên GitHub

Mở PowerShell tại **thư mục có `package.json` và `.git`**, tức `viet_phuc/`:

```powershell
Set-Location 'C:\Users\ASUS\Desktop\VietPhuc_Project\viet_phuc'
npm.cmd run lint
npm.cmd run build
git status
git add -A
git commit -m "Update Viet Phuc Remix"
git push origin main
```

Trước khi `git add -A`, xem `git status` để chắc chắn không có `.env` hay file lạ. Không cần đưa `node_modules/`, `dist/` hoặc `.env` lên GitHub; giữ `public/` vì đó là ảnh ứng dụng sử dụng. Nếu push bị từ chối vì GitHub có commit mới, chạy `git fetch origin` và xem khác biệt trước khi hợp nhất, không force push.

## Bước 2: Import vào Google AI Studio

1. Mở [Google AI Studio Build](https://aistudio.google.com/apps).
2. Ở ô nhập prompt, bấm **Add files (+) → Import from GitHub**.
3. Kết nối GitHub nếu được yêu cầu và cấp quyền truy cập repo.
4. Chọn `Roony05/VietPhuc_Project`, nhánh `main`, rồi import.
5. Kiểm tra trong tab Code có `server.ts`, `src/`, `public/img/` và `metadata.json`.

Nếu agent của AI Studio cần hướng dẫn, có thể dán:

```text
Đây là app React + Vite + TypeScript với backend Express trong server.ts. Giữ nguyên giao diện và tính năng.
Lệnh: npm ci → npm run build → npm start (Node.js >= 22.12, ưu tiên 24).
Production phục vụ cả dist/ và các API trên cùng origin: /api/status, /api/try-on, /api/personality, /api/suggest-look.
Server nghe trên 0.0.0.0 và process.env.PORT.
GEMINI_API_KEY và MODAL_TRYON_URL / MODAL_TRYON_KEY / MODAL_TRYON_SECRET chỉ nằm ở server qua Secrets,
không đưa vào VITE_*, frontend hoặc vite.config.ts.
Chỉ sửa những gì cần để chạy và deploy; báo rõ nếu có lỗi.
```

## Bước 3: Cấu hình Secrets

Vào **Settings → Secrets** ([tài liệu full-stack](https://ai.google.dev/gemini-api/docs/aistudio-fullstack)).

| Biến | Cách cấu hình |
| --- | --- |
| `GEMINI_API_KEY` | Key Gemini phía server. Thiếu thì hai phần dùng Gemini trả câu soạn sẵn. |
| `MODAL_TRYON_URL` | URL in ra sau `modal deploy deploy/modal_app.py`. |
| `MODAL_TRYON_KEY`, `MODAL_TRYON_SECRET` | Proxy Auth Token tạo ở modal.com → Settings → Proxy Auth Tokens. Thiếu một trong 3 biến Modal thì nút Ghép ảnh bị khóa. |
| `PORT` | Để môi trường chạy tự cung cấp, không cố định `3000`. |

Mở `/api/status` trên bản đang chạy. Khi đủ cấu hình, kết quả là `{"tryOn":true,"tips":true}`. Endpoint này chỉ cho biết biến đã được nạp, không xác nhận key còn hợp lệ hay còn quota.

## Bước 4: Publish

Sau khi preview và thử đồ hoạt động, chọn **Publish**. App được triển khai thành service Cloud Run ([tài liệu Publish](https://ai.google.dev/gemini-api/docs/aistudio-deploying)). Mở URL được cấp và kiểm tra:

- Chọn gu → gợi ý → Phòng thử đồ → ghép ảnh với cả 2 kiểu nền (Giữ nền ảnh gốc, Nền trắng).
- Trang Kết quả có thẻ Phong thái (Gemini), Có thể bạn chưa biết và phụ kiện.
- Trang Hoàn tất: chọn khung, tải ảnh, lưu lookbook; reload rồi mở Lookbook để thấy dữ liệu còn.

## Chi phí và giới hạn

- Mọi lượt ghép trên bản publish trừ vào **credits Modal của chủ tài khoản** có Key/Secret trong Secrets. `deploy/modal_app.py` đã giới hạn 50 lượt/ngày, 1 GPU chạy cùng lúc, tự tắt sau 1 phút không dùng.
- Người clone repo không dùng được Modal của bạn: họ phải tự deploy `modal_app.py` trên tài khoản của họ và điền key của họ.
- Giao diện giới hạn 10 lượt ghép mỗi phiên; giới hạn thật để bảo vệ chi phí nằm ở phía Modal.
- Lookbook và hồ sơ lưu trong localStorage, riêng theo trình duyệt và tên miền; dữ liệu ở localhost không chuyển sang URL publish.

## Cập nhật sau này

Sửa local → `npm run lint` + `npm run build` → commit/push → trong AI Studio vào **Settings → GitHub** để kéo thay đổi → kiểm tra preview → Publish lại. Push lên GitHub không tự cập nhật URL live.

Thay đổi chỉ nằm ở phía Modal (`train_model_VTTon/deploy/modal_app.py`) thì chạy `python -m modal deploy deploy/modal_app.py`; URL giữ nguyên nên không cần publish lại web.

## Chẩn đoán nhanh

| Triệu chứng | Kiểm tra |
| --- | --- |
| Container không lên / lỗi PORT | Lệnh chạy phải là `npm start`; server nghe đúng `PORT` môi trường cung cấp. |
| UI có nhưng API 404 hoặc trả HTML | Đang chạy Vite preview hoặc host tĩnh; phải chạy server Express. |
| Nút Ghép ảnh bị khóa | Thiếu một trong 3 biến `MODAL_TRYON_*`; xem `/api/status`. |
| Ghép ảnh báo 401/403 | Sai `MODAL_TRYON_KEY` hoặc `MODAL_TRYON_SECRET`. |
| Ghép ảnh báo 429 | Hết 50 lượt trong ngày (giờ UTC); chờ sang ngày hoặc tăng `DAILY_LIMIT` rồi deploy lại Modal. |
| Lần ghép đầu rất lâu | Máy GPU trên Modal đang khởi động (tới khoảng 2 phút); các lần sau nhanh hơn. |
| Phong thái / gợi ý có nhưng không phải Gemini | API trả `source: "local"` là câu dự phòng khi Gemini lỗi hoặc thiếu key; xem log `[Gemini]` của server. |
| Bản publish thiếu ảnh | Kiểm tra `public/img/` đã push, đúng tên và chữ hoa/thường (Linux phân biệt). |
