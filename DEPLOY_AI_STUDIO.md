# Đưa Việt Phục Remix từ GitHub lên Google AI Studio

Ngày kiểm tra: **02/10/2026**. Hướng dẫn này dành cho source hiện tại trong thư mục `viet_phuc/`.

## Kết luận

Có thể đi theo luồng **source trên máy → GitHub → Google AI Studio Build → Publish → Cloud Run**. Google hiện có chức năng import repository và đồng bộ GitHub hai chiều, theo [tài liệu Build chính thức](https://ai.google.dev/gemini-api/docs/aistudio-build-mode).

Project là **React + Vite + TypeScript ở giao diện, Express/Node.js ở server**. Việc ghép ảnh gọi OOTDiffusion trên Hugging Face; Gemini chỉ tạo nội dung chữ. Do đó phải triển khai cả server Express. Chỉ host `dist/` hoặc chạy `npm run preview` sẽ thiếu các API mà giao diện cần.

Source trước lần kiểm tra này đã có trên GitHub tại [Roony05/VietPhuc_Project](https://github.com/Roony05/VietPhuc_Project): commit local và nhánh `main` trên GitHub cùng là `cef4e87fd62f2e7aa2218d6d932c0982a68ab6ef`. Những chỉnh sửa và hướng dẫn trong lần kiểm tra này chưa được commit/push.

## Kết quả kiểm tra project

| Phần | Kết quả |
| --- | --- |
| TypeScript | `npm run lint` qua. Lệnh này chạy `tsc --noEmit`. |
| Build | `npm run build` qua, tạo `dist/`. Có cảnh báo bundle JS khoảng 647 KB; không làm build thất bại. |
| Production | Kiểm tra `npm start` trên cổng `38127`: HTML, JS đã build và ảnh trả về đúng. |
| API | `/api/status`, `/api/personality`, `/api/suggest-look` hoạt động với cấu hình thiếu key; hai API chữ trả kết quả `source: "local"`. |
| Dữ liệu | 132 bộ trang phục, 2 người mẫu, 10 mẫu lookbook; ảnh tham chiếu đều có file và được Git theo dõi. |
| Ảnh tĩnh | 180 file trong `public/`, tổng khoảng **389 MiB**. |
| Key | `.env` được Git bỏ qua; lịch sử Git hiện có không ghi nhận `.env`/`.env.local`. Key đang dùng ở máy không xuất hiện trong source được theo dõi hoặc JS build. |
| Model Gemini | Gọi API liệt kê model bằng key local thành công; cả 4 model trong `geminiClient.ts` đều xuất hiện trong danh sách. |
| OOTDiffusion | Space `levihsu/OOTDiffusion` báo `RUNNING`; cấu hình Gradio có `process_dc` với 7 đầu vào, phù hợp code. |

Chưa publish trên tài khoản Google của bạn và chưa chạy một lượt sinh chữ/ghép ảnh thật trong lần kiểm tra này. Kiểm tra model/Space xác nhận khả năng kết nối và tên endpoint, không bảo đảm quota, quyền suy luận hay chất lượng ảnh. Luồng upload → gọi Gradio → nhận SSE → tải ảnh đã được kiểm tra bằng dịch vụ mô phỏng.

Các kiểm tra local dùng `node_modules` hiện có, chưa kiểm tra một lần cài sạch trên Linux. npm trên máy báo `EALLOWREMOTE` khi cập nhật lockfile với một gói optional của Tailwind; vì vậy lockfile được cập nhật phân loại dependency trực tiếp, giữ nguyên phiên bản/URL/integrity. `npm ls --omit=dev --depth=0` xác nhận các runtime dependency hiện có hợp lệ. Sau import cần kiểm tra log `npm ci` trong môi trường AI Studio.

## Những điểm đã sửa để triển khai

1. `server.ts` lấy cổng từ `process.env.PORT`, mặc định `3000`. Cloud Run yêu cầu server nghe ở `0.0.0.0` trên cổng được cung cấp; xem [container contract](https://docs.cloud.google.com/run/docs/container-contract).
2. Chuyển `cross-env` và `tsx` sang `dependencies`, vì `npm start` dùng trực tiếp hai thư viện này. Cập nhật cùng `package-lock.json`, giữ nguyên phiên bản đã khóa.
3. Thêm yêu cầu Node.js `>=22.12.0`. Vite và plugin React đang cài yêu cầu phiên bản Node phù hợp; máy hiện tại đã kiểm tra bằng Node.js `24.19.0`.
4. `ootd.ts` đọc `OOTD_SPACE` khi gọi dịch vụ, sau khi server nạp `.env`. Trước đó biến được đọc ngay lúc import module nên thay Space trong `.env` không có tác dụng.
5. `.env.example` dùng giá trị key rỗng và README mô tả đúng API, cách chạy và kết quả dự phòng.

## Bước 1: Đẩy bản đã chỉnh lên GitHub

Mở terminal PowerShell tại **thư mục có `package.json` và `.git`**, tức `viet_phuc/`:

```powershell
Set-Location 'C:\Users\ASUS\Desktop\VietPhuc_Project\viet_phuc'
git status
git remote -v
npm.cmd run lint
npm.cmd run build
git diff
git add server.ts ootd.ts package.json package-lock.json .env.example README.md DEPLOY_AI_STUDIO.md
git commit -m "Prepare app for Google AI Studio deployment"
git push origin main
```

Repo này đã có `origin` và nhánh `main`, nên không cần tạo Git lại. GitHub dùng `git push` để gửi commit local lên remote, theo [hướng dẫn GitHub](https://docs.github.com/en/migrations/importing-source-code/using-the-command-line-to-import-source-code/adding-locally-hosted-code-to-github).

Repo GitHub cần có `package.json`, `package-lock.json`, `server.ts`, `ootd.ts`, các file server Gemini, `src/`, `public/`, `index.html`, cấu hình Vite/TypeScript và `metadata.json` ngay ở root repo. Root repo hiện tại đã có bố cục này: thư mục `viet_phuc/` trên máy chính là root Git, không phải thư mục cha `VietPhuc_Project/`.

Không cần upload `viet_phuc.zip`, `node_modules/`, `dist/` hoặc `.env`. Giữ thư mục `public/` trong repo vì đó là ảnh ứng dụng sử dụng.

Nếu push bị từ chối vì GitHub có commit mới, chạy `git fetch origin` và xem khác biệt trước khi hợp nhất. Không dùng force push để xử lý mặc định.

## Bước 2: Import vào Google AI Studio

1. Mở [Google AI Studio Build](https://aistudio.google.com/apps).
2. Ở ô nhập prompt, bấm **Add files (+) → Import from GitHub**.
3. Kết nối GitHub nếu được yêu cầu và cấp quyền truy cập repo này.
4. Chọn `Roony05/VietPhuc_Project`, nhánh `main` nếu giao diện cho chọn nhánh, rồi import.
5. Kiểm tra trong tab Code rằng có `server.ts`, `src/` và `public/img/`.

Đây là đường import được mô tả trong [tài liệu Google AI Studio](https://ai.google.dev/gemini-api/docs/aistudio-build-mode). Nếu không thấy repo trong danh sách, kiểm tra tài khoản GitHub đang kết nối và quyền truy cập repository.

Có thể dán prompt sau sau khi import:

```text
Hãy chạy project Việt Phục Remix vừa import và chuẩn bị Publish.

Đây là app React + Vite + TypeScript với backend Express trong server.ts.
Giữ giao diện, catalog và các tính năng hiện có.

Các lệnh:
- Cài dependency: npm ci, bao gồm devDependencies ở bước build.
- Development và preview trong workspace: npm run dev.
- Kiểm tra TypeScript: npm run lint.
- Build production: npm run build.
- Chạy production: npm start.
- Dùng Node.js >=22.12.0, ưu tiên Node.js 24.

Production phải phục vụ cả dist/ và các API trên cùng origin:
/api/status, /api/try-on, /api/personality, /api/suggest-look.
Server nghe trên 0.0.0.0 và process.env.PORT.

GEMINI_API_KEY và HF_TOKEN chỉ nằm ở server qua Secrets.
Không đưa key vào VITE_*, frontend hoặc vite.config.ts define.
OOTDiffusion dùng HF_TOKEN; Gemini dùng cho nội dung chữ.
Giữ metadata.json và toàn bộ ảnh trong public/img/.

Kiểm tra trang chủ, bộ lọc, thư viện, API status và bản production.
Chỉ sửa những gì cần để chạy/import/deploy; báo rõ lỗi nếu có.
```

Tài liệu xác nhận AI Studio có runtime Node.js, nhưng không cam kết mọi repository tùy ý đều chạy ngay sau import. Nếu agent sửa file để phù hợp workspace, xem diff để giữ đúng cấu trúc và tính năng.

## Bước 3: Cấu hình Secrets

Vào **Settings → Secrets**. [Tài liệu full-stack](https://ai.google.dev/gemini-api/docs/aistudio-fullstack) hướng dẫn thêm key dịch vụ bên ngoài tại đây.

| Biến | Cách cấu hình cho project |
| --- | --- |
| `GEMINI_API_KEY` | Kiểm tra key phía server được AI Studio thiết lập; nếu chưa có, thêm key của bạn. Key local không đi theo GitHub. |
| `HF_TOKEN` | Thêm token Hugging Face của bạn. Thiếu token thì chức năng ghép ảnh bị khóa. |
| `OOTD_SPACE` | Có thể dùng mặc định `levihsu/OOTDiffusion`; chỉ đổi nếu có Space tương thích Gradio API trong `ootd.ts`. |
| `APP_URL` | Code hiện tại không sử dụng, có thể để trống. |
| `PORT` | Để môi trường chạy cung cấp; không cố định thành `3000` trên Cloud Run. |

Lưu cấu hình rồi restart/refresh preview nếu cần. Mở `/api/status` trên origin đang chạy. Khi cả hai key được nạp, kết quả mong đợi là:

```json
{"tryOn":true,"tips":true}
```

Endpoint này chỉ cho biết key đã được cấu hình; nó không gọi dịch vụ để xác nhận token hợp lệ hoặc còn quota. Kiểm tra tiếp một gợi ý chữ và một lượt ghép ảnh bằng người mẫu có sẵn.

Hugging Face ZeroGPU có quota và hàng đợi riêng; xem [tài liệu ZeroGPU](https://huggingface.co/docs/hub/spaces-zerogpu). Publish trên Google không thay thế dịch vụ này hay cấp thêm GPU cho Space.

## Bước 4: Publish

Sau khi preview và thử đồ hoạt động, chọn **Publish**. Tài khoản đủ điều kiện Starter Tier có thể dùng **Get Started → Publish App**, tối đa 2 ứng dụng. Nếu không đủ điều kiện, dùng standard deployment với Cloud project và billing. App được triển khai thành service Cloud Run; xem [tài liệu Publish chính thức](https://ai.google.dev/gemini-api/docs/aistudio-deploying).

Sau khi publish, mở URL được cung cấp và kiểm tra lại:

- Trang chủ, bộ lọc, đổi màu trong thư viện và ảnh người mẫu.
- `/api/status` phản ánh đủ key ở bản đã publish.
- Gợi ý lookbook và bí mật tính cách có nội dung; `source: "local"` trong API là kết quả dự phòng, không phải Gemini vừa sinh.
- Ghép một ảnh thật, tải ảnh và lưu lookbook.
- Reload trang rồi mở Lookbook để xác nhận dữ liệu lưu ở trình duyệt đó.

Preview chạy được chưa xác nhận Secrets và lệnh start của bản publish đã đúng. Nếu bản live lỗi, đối chiếu log khởi động/build của deployment và cấu hình runtime.

## Cập nhật sau này

Sửa local → kiểm tra → commit/push GitHub → vào **Settings → GitHub** trong AI Studio để pull/sync thay đổi → kiểm tra preview → publish lại. Google mô tả đồng bộ hai chiều trong [tài liệu GitHub của Build](https://ai.google.dev/gemini-api/docs/aistudio-build-mode); push GitHub không nên được coi là đã tự cập nhật URL live.

## Các điểm còn cần lưu ý trong source

| Điểm | Ảnh hưởng thực tế |
| --- | --- |
| Ảnh khoảng 389 MiB | Repo/import/build nặng; ảnh catalog vài MB mỗi file làm thư viện tải nhiều dữ liệu. Nên tối ưu ảnh ở bước tiếp theo. Không có ngưỡng import chính thức nào được xác nhận trong các trang tài liệu đã đọc. |
| Lookbook dùng `localStorage` | Giới hạn 6 bộ, riêng theo trình duyệt và origin; dữ liệu localhost không chuyển sang URL publish. Chưa có tài khoản/database dùng chung. |
| Giới hạn 10 lượt nằm ở React state | Reload tạo lại lượt; backend chưa có xác thực hoặc giới hạn số lượt để bảo vệ quota chung khi mở public. |
| Gọi Hugging Face chưa có timeout/abort | Khi Space treo hoặc hàng đợi lâu, người dùng có thể chờ dài; cần xử lý timeout và hủy yêu cầu ở bước tăng độ ổn định. |
| Xử lý input API chưa chặt | Một số trường chữ được nhận trực tiếp; các handler async Express chưa có cơ chế bắt mọi lỗi. Nên bổ sung validation và xử lý lỗi trước khi dùng rộng rãi. |
| Thông tin văn hóa | Cả 132 bộ có `verified: false` và `meaningSource: "CẦN BỔ SUNG"`; component vẫn hiển thị nội dung. Đội cần kiểm chứng và ghi nguồn, nhất là trước khi nộp demo. |
| Lịch sử ảnh dùng chung giữa các bộ | Khi đổi bộ, ảnh cũ vẫn có thể được hiển thị/lưu với tên bộ đang chọn; `GeneratedImage` chưa lưu `outfitId`. |
| Prompt cũ ở thư mục cha | `PROMPTS_AI_STUDIO.md` mô tả cả tạo ảnh Gemini/phụ kiện, nhưng source hiện tại ghép bằng OOTDiffusion và chưa có luồng phụ kiện đó. Hướng dẫn triển khai ở đây bám theo code hiện tại. |

Những mục này được ghi nhận để bạn biết giới hạn của demo; lần chỉnh này tập trung vào khởi động và triển khai.

## Chẩn đoán nhanh

| Triệu chứng | Kiểm tra |
| --- | --- |
| Container không lên / lỗi PORT | Lệnh runtime phải là `npm start`; log phải cho thấy đúng `PORT` môi trường cung cấp. |
| `tsx` hoặc `cross-env` không tìm thấy | Repo phải chứa package.json và lockfile mới trong đó hai thư viện là runtime dependency. |
| UI có nhưng API 404 hoặc trả HTML | Có thể đang chạy Vite preview/static host; chạy server Express. |
| Nút Ghép ảnh bị khóa | Kiểm tra `HF_TOKEN` ở Secrets và `/api/status` trên đúng bản đang chạy. |
| Ghép ảnh lỗi 429/502/503 | Xem quota/token/endpoint/trạng thái Hugging Face; đây có thể là lỗi dịch vụ thử đồ. |
| Gợi ý vẫn có nhưng không dùng AI | Xem trường `source`, cấu hình key và log Gemini. Fallback được thiết kế để giữ nội dung khi Gemini lỗi. |
| Local có ảnh nhưng bản publish thiếu ảnh | Kiểm tra file `public/img/` đã commit/push, đúng tên và chữ hoa/thường trên Linux. |
| Mất lookbook sau đổi URL hoặc máy | Đây là hành vi hiện tại của lưu trữ local theo origin/trình duyệt. |

Google Cloud Node buildpacks mặc định chạy script build nếu có và lấy script start làm entrypoint, theo [tài liệu buildpacks](https://docs.cloud.google.com/docs/buildpacks/nodejs). Đây là cơ sở cho cấu hình source hiện tại; nếu AI Studio tạo cấu hình đóng gói riêng, kiểm tra log và lệnh thực tế của cấu hình đó.
