# Việt Phục Remix

Ứng dụng web giúp học sinh, sinh viên chọn trang phục truyền thống Việt Nam theo gu của mình, mặc thử lên ảnh của chính mình, đọc câu chuyện văn hóa của từng bộ và lưu thành lookbook.

Luồng: **Chọn gu → Chọn bộ (gợi ý hoặc thư viện) → Thử đồ → Kết quả → Hoàn tất (khung ảnh, chia sẻ, lưu lookbook)**.

## Chạy trên máy

Cần có Node.js 22.12 trở lên; nên dùng Node.js 24 LTS.

1. Cài thư viện:
   ```
   npm ci
   ```
2. Sao chép `.env.example` thành `.env`, rồi điền:
   - `MODAL_TRYON_URL`, `MODAL_TRYON_KEY`, `MODAL_TRYON_SECRET`: API thử đồ CatVTON đã fine-tune cho Việt phục, chạy trên Modal (nhờ Roony đưa key).
   - `HF_TOKEN` (không bắt buộc): token Hugging Face quyền Read (https://huggingface.co/settings/tokens). Dùng làm **dự phòng**: khi Modal lỗi (hết credits, hết lượt, máy chủ lỗi) app tự ghép bằng OOTDiffusion trên Hugging Face. Model này không fine-tune cho Việt phục, không tách nền, không có nền trắng, và quota GPU miễn phí chỉ đủ vài ảnh mỗi ngày.
   - `GEMINI_API_KEY`: Gemini API key (https://aistudio.google.com/apikey). Dùng để chọn lookbook hợp gu và viết lời khen "Phong thái khi diện bộ này".
3. Chạy:
   ```
   npm run dev
   ```
4. Mở http://localhost:3000

Thiếu cả `MODAL_TRYON_*` lẫn `HF_TOKEN` thì nút Ghép ảnh bị khóa và app hiện thông báo. Thiếu `GEMINI_API_KEY` thì hai phần dùng Gemini trả câu soạn sẵn. Các phần khác vẫn dùng bình thường.

## Lệnh khác

| Lệnh             | Tác dụng                                            |
| ----------------- | ----------------------------------------------------- |
| `npm run lint`  | Kiểm tra lỗi TypeScript                             |
| `npm run build` | Build giao diện vào`dist/`                        |
| `npm start`     | Chạy bản production (cần`npm run build` trước) |

## Luồng thử đồ (5 bước)

Chọn gu (`#/chon-gu`) → Chọn bộ (`#/goi-y` hoặc `#/thu-vien`) → **Phòng thử đồ** (`#/phong-thu-do`: bộ trang phục, ảnh của bạn, kiểu nền, nút Ghép ảnh) → **Kết quả** (`#/ket-qua`: ảnh ghép, Phong thái khi diện bộ này, Có thể bạn chưa biết, phụ kiện nên / không nên) → **Hoàn tất** (`#/hoan-tat`: chọn khung, chia sẻ, tải về, lưu lookbook).

- Các trang trong luồng có một thanh phụ dính dưới thanh điều hướng: Quay lại, các bước, nút chính và vạch tiến trình (`FlowHeader` trong `src/components/Flow.tsx`).
- **Kiểu nền** ở Phòng thử đồ: *Giữ nền ảnh gốc* hoặc *Nền trắng*. Cả hai đều tách người khỏi nền và cắt khung quanh người trước khi ghép, nên ảnh nền rối hay người đứng nhỏ vẫn ghép tốt.
- **Màn chờ ghép ảnh** (`src/components/LoadingOverlay.tsx`): các nhân vật dân gian thay nhau đọc ca dao, tục ngữ, đồng dao, Truyện Kiều (`src/data/folkSayings.ts`), mỗi câu 5 giây, kèm thanh tiến trình và đồng hồ đếm giây.

## Điều hướng, tài khoản demo và hồ sơ người mặc

- Mỗi màn có đường dẫn riêng (xem `src/logic/routes.ts`), nút Back của trình duyệt dùng được. Máy tính có thanh điều hướng trên cùng, điện thoại có thanh tab dưới đáy.
- **Đăng nhập demo** (`#/ho-so`): chỉ cần tên, không mật khẩu, không gửi mã. **Hồ sơ người mặc** (thêm/sửa/xóa) lưu giới tính, độ tuổi, số đo, phong cách, màu thích; bước Chọn gu tự điền theo hồ sơ đang chọn, có mục "Người khác (nhập tay)" để chọn đồ giúp người khác.
- Tất cả lưu trong localStorage của trình duyệt (`src/logic/profileStorage.ts`), **không gửi lên máy chủ**.

## Nhân vật dân gian

`src/components/FolkAvatar.tsx`: nhân vật chibi nét truyện tranh xưa (viền mực, màu phẳng), đổi trang phục theo giới tính và độ tuổi: cậu bé tóc trái đào, thư sinh, sĩ tử, thầy đồ, ông đồ; cô bé tóc hai chỏm, cô thôn nữ, tiểu thư, liền chị quan họ, bà đồ. Có sẵn khung giấy dó viền son. Dùng ở bước Chọn gu, thẻ Phong thái, lookbook mẫu, hồ sơ, màn chờ và 2 khung "Truyện tranh xưa".

## Gợi ý theo thời tiết

Bước Chọn gu có mục **Mặc ngày nào, ở đâu?** (không bắt buộc, 10 tỉnh thành trong `src/logic/weather.ts`):

- Trong 16 ngày tới: dự báo thật từ Open-Meteo (miễn phí, không cần key, gọi thẳng từ trình duyệt).
- Xa hơn: **ước tính theo mùa** = trung bình cùng thời điểm (±3 ngày) của 3 năm trước, ghi rõ không phải dự báo.
- Thời tiết cộng/trừ điểm kiểu áo (nóng: ưu tiên áo ít lớp; lạnh: áo ngũ thân, áo tấc), trừ điểm áo trắng/be khi dễ mưa, và hiện lời khuyên ở màn Gợi ý.

## Phụ kiện

Trang Kết quả có thẻ **Phối gì cho hợp?**: hình các phụ kiện **nên phối** và **không nên phối chung** với bộ đang chọn, mỗi món kèm lý do.

- Catalog 12 phụ kiện ở `src/data/accessories.ts`, ảnh WebP nền trong suốt (rộng 512px), mỗi món 11 màu: `public/img/accessories/{id}-{mau}.webp`.
- **Bộ phối chuẩn** cho 12 dòng áo ở `src/data/accessoryPresets.ts` (nhóm cần duyệt lại): phần "Nên phối" chỉ lấy từ đây, không dùng AI. Phần "Không nên phối chung" và bỏ món không hợp dịp ở `src/logic/accessoryRules.ts`.
- Màu ảnh phụ kiện: theo màu nhóm đặt trong bộ phối, không có thì theo màu áo (áo đen/trắng/be thì lấy đỏ).

Thêm phụ kiện mới: thêm đủ 11 file WebP theo màu (`<id>-be.webp`, `<id>-do.webp`, …) rồi thêm một mục trong `accessories.ts`.

## Có thể bạn chưa biết (lịch sử trang phục)

Thẻ lịch sử ở trang Kết quả lấy từ `src/data/history.ts`: mỗi kiểu áo có các điều thú vị, dòng thời gian và **nguồn có link** (TTXVN/VietnamPlus, Hànộimới, Hội LHPN Việt Nam, Ủy ban Nhà nước về người Việt Nam ở nước ngoài, Dân Việt, Thanh Niên, VnExpress, Tạp chí Văn hóa Nghệ An). Chỉ thêm chi tiết đã đối chiếu được với nguồn; giả thuyết thì ghi rõ là giả thuyết.

## Khung lookbook

20 khung vẽ bằng Canvas trong `src/logic/frames.ts`: 5 khung quê hương đứng đầu (Đồng lúa quê nhà, Phố cổ Hội An, Vịnh Hạ Long, Hồ Gươm, Sông nước miền Tây), các khung điện ảnh (Màn ảnh rộng, Phim 35mm, Lụa & sơn mài, Phòng triển lãm), Tranh Đông Hồ, 2 khung Truyện tranh xưa (nam, nữ) và các khung còn lại.

## Cấu hình

- `src/config.ts`: số lượt ghép mỗi phiên, cạnh dài tối đa khi nén ảnh, số mục tối đa trong lookbook.
- `geminiClient.ts`: chuỗi model Gemini dự phòng và giới hạn thời gian gọi AI.

## Cấu trúc chính

- `server.ts`: server Express, giữ key. Endpoint: `/api/status`, `/api/try-on` (CatVTON trên Modal, dự phòng OOTDiffusion trên Hugging Face), `/api/personality` và `/api/suggest-look` (Gemini).
- `catvton.ts`: gọi API CatVTON Việt phục trên Modal, gửi kèm `background` (`original` hoặc `white`).
- `ootd.ts`: gọi Space OOTDiffusion trên Hugging Face, chỉ dùng khi Modal lỗi hoặc chưa cấu hình (`OOTD_SPACE` để đổi Space, mặc định `levihsu/OOTDiffusion`).
- `geminiClient.ts`, `personality.ts`, `lookSuggest.ts`: gọi Gemini, prompt và câu dự phòng.
- `src/data/`: catalog bộ đồ, phụ kiện, lookbook mẫu, lịch sử trang phục, câu dân gian, người mẫu và nhãn tiếng Việt.
- `src/logic/`: gợi ý, thời tiết, quy tắc phụ kiện, xử lý ảnh, khung ảnh, lưu lookbook và hồ sơ (code thường, không dùng AI).
- `src/services/`: gọi server (`tryOn.ts`, `geminiText.ts`).
- `src/components/`: thành phần giao diện; `ui.tsx` chứa nút, thẻ, chip dùng chung. Bảng màu nằm trong `src/index.css`.
- `src/screens/`: 9 màn hình (Trang chủ, Chọn gu, Gợi ý, Thư viện, Phòng thử đồ, Kết quả, Hoàn tất, Lookbook, Hồ sơ).
- `public/img/`: ảnh bộ đồ (WebP 768px, khoảng 130 KB/ảnh), phụ kiện và người mẫu. Ảnh PNG gốc để ở `../assets_goc/` (ngoài repo) cho nhẹ khi publish.

## GitHub và Google AI Studio

Import repo vào Google AI Studio Build, điền các biến ở trên vào **Settings → Secrets**, rồi Publish. Khi triển khai phải chạy cả server Express bằng `npm start` sau `npm run build`; `npm run preview` chỉ phục vụ giao diện. Cổng lấy từ biến môi trường `PORT`, mặc định `3000` khi chạy trên máy.
