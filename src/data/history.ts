import { GarmentType } from "../types";

/**
 * "Có thể bạn chưa biết": lịch sử từng kiểu áo, chỉ gồm chi tiết đã đối chiếu với nguồn báo chí / cơ quan chính thống
 * (đọc ngày 03/10/2026). Thêm thông tin mới thì ghi kèm nguồn; giả thuyết thì ghi rõ là giả thuyết.
 */
export interface Source {
  label: string; // tên cơ quan / báo
  title: string; // tên bài
  url: string;
}

export interface GarmentHistory {
  facts: string[];
  timeline: { when: string; what: string }[];
  sources: Source[];
}

const VIETNAMPLUS_NGU_THAN: Source = {
  label: "VietnamPlus (TTXVN)",
  title: "Độc đáo áo ngũ thân - Bản sắc văn hoá Việt",
  url: "https://mega.vietnamplus.vn/doc-dao-ao-ngu-than-ban-sac-van-hoa-viet-5419.html",
};
const HANOIMOI_LEMUR: Source = {
  label: "Báo Hànộimới",
  title: "Áo dài Lemur - câu chuyện cải cách y phục phụ nữ Việt Nam",
  url: "https://nhipsonghanoi.hanoimoi.vn/ao-dai-lemur-cau-chuyen-cai-cach-y-phuc-phu-nu-viet-nam-627350.html",
};
const HOILHPN_TUAN_LE: Source = {
  label: "Hội Liên hiệp Phụ nữ Việt Nam",
  title: "Phát động \"Tuần lễ Áo dài\" năm 2024 từ ngày 1/3 đến 8/3 trên toàn quốc",
  url: "https://hoilhpn.org.vn/en/tin-chi-tiet/-/chi-tiet/hoi-lhpn-viet-nam-phat-%C4%91ong-034-tuan-le-ao-dai-034-nam-2024-tu-ngay-1-3-%C4%91en-8-3-tren-toan-quoc-63133-2.html",
};
const SCOV_QUAN_HO: Source = {
  label: "Ủy ban Nhà nước về người Việt Nam ở nước ngoài",
  title: "Dân ca Quan họ Bắc Ninh",
  url: "https://scov.gov.vn/ban-sac-van-hoa/dan-ca-quan-ho-bac-ninh.html",
};

export const GARMENT_HISTORY: Record<GarmentType, GarmentHistory> = {
  ao_ngu_than: {
    facts: [
      "Áo được ráp từ năm thân vải may dọc, cài năm khuy, tà dài chạm hoặc hơi quá gối.",
      "Năm 1744, chúa Võ vương Nguyễn Phúc Khoát (ở ngôi 1738–1765) ra chỉ dụ thay đổi y phục ở xứ Đàng Trong. Lê Quý Đôn có ghi chép về cuộc cải cách này trong sách Phủ biên tạp lục.",
      "Áo ngũ thân được xem là tiền thân của chiếc áo dài ngày nay, và phổ biến ở cả hai miền dưới triều Nguyễn.",
    ],
    timeline: [
      { when: "1744", what: "Chúa Nguyễn Phúc Khoát ra chỉ dụ cải cách y phục Đàng Trong" },
      { when: "1802–1945", what: "Triều Nguyễn, áo ngũ thân phổ biến khắp cả nước" },
      { when: "Ngày nay", what: "Được may lại để mặc dịp Tết, lễ hội, chụp ảnh" },
    ],
    sources: [VIETNAMPLUS_NGU_THAN],
  },
  ao_tac: {
    facts: [
      "Áo tấc là áo ngũ thân tay rộng, còn được gọi là áo lễ, áo thụng. Tên gọi được giải thích là từ phần viền áo rộng đúng một tấc.",
      "Kiểu áo hình thành khoảng 300 năm trước, gắn với cuộc định chế trang phục ở Đàng Trong của chúa Nguyễn Phúc Khoát.",
      "Áo tấc không phải thường phục: chỉ mặc trong các nghi lễ cưới, tang, tế, lễ hội lớn và ngày Tết. Nam nữ, mọi tầng lớp đều mặc, khác nhau ở chất liệu, màu sắc và hoa văn.",
      "Sau khi chế độ quân chủ kết thúc, áo tấc thưa dần, nhưng gần đây được chấn hưng mạnh, nhất là ở Huế.",
    ],
    timeline: [
      { when: "Thế kỷ XVIII", what: "Hình thành cùng cuộc định chế trang phục Đàng Trong" },
      { when: "Triều Nguyễn", what: "Là lễ phục trong các dịp trọng đại" },
      { when: "Ngày nay", what: "Được phục dựng, dùng trong lễ cưới, phim cổ trang, du lịch" },
    ],
    sources: [
      {
        label: "Tạp chí Văn hóa Nghệ An",
        title: "Áo Tấc (Áo ngũ thân tay rộng) một cổ phục quý đang hồi sinh",
        url: "http://vanhoanghean.com.vn/chi-tiet-tin-tuc/14921-ao-tac-ao-ngu-than-tay-rong-mot-co-phuc-quy-dang-hoi-sinh",
      },
    ],
  },
  ao_dai: {
    facts: [
      "Áo dài ngày nay phát triển từ áo ngũ thân, kiểu áo được định hình ở Đàng Trong từ năm 1744.",
      "Năm 1934, họa sĩ Nguyễn Cát Tường (tên Pháp là Lemur), tốt nghiệp Trường Cao đẳng Mỹ thuật Đông Dương, giới thiệu kiểu áo dài “Lemur” trên báo Phong Hóa. Đây là một trong những lần cải cách áo dài nổi tiếng nhất.",
      "Áo Lemur dựa trên áo dài ba thân, ôm theo dáng người hơn, có cổ lá sen, vai bồng, màu sắc tươi sáng. Năm 1937, ông mở hiệu may Lemur ở Hà Nội.",
      "Hằng năm, Hội Liên hiệp Phụ nữ Việt Nam phát động “Tuần lễ Áo dài” từ 1 đến 8/3 trên toàn quốc.",
    ],
    timeline: [
      { when: "1744", what: "Áo ngũ thân, tiền thân của áo dài, ra đời ở Đàng Trong" },
      { when: "1934", what: "Áo dài Lemur xuất hiện trên báo Phong Hóa" },
      { when: "1937", what: "Hiệu may Lemur khai trương tại Hà Nội" },
      { when: "Ngày nay", what: "“Tuần lễ Áo dài” từ 1 đến 8/3 hằng năm" },
    ],
    sources: [VIETNAMPLUS_NGU_THAN, HANOIMOI_LEMUR, HOILHPN_TUAN_LE],
  },
  ao_dai_cach_tan: {
    facts: [
      "So với áo dài truyền thống, áo dài cách tân thường có dáng suông rộng, không chiết eo chặt, dễ mặc và hợp nhiều hoàn cảnh như đi làm, dạo phố, đón Tết.",
      "Theo VnExpress, áo dài cách tân bắt đầu xuất hiện trên thị trường từ khoảng năm 2016 và thực sự bùng nổ vài năm gần đây, kể cả với nam giới.",
      "Tinh thần “cải cách áo dài” không mới: ngay từ năm 1934, họa sĩ Nguyễn Cát Tường đã làm mới áo dài với mẫu Lemur.",
    ],
    timeline: [
      { when: "1934", what: "Áo dài Lemur, một lần cách tân nổi tiếng" },
      { when: "2016", what: "Áo dài cách tân bắt đầu phổ biến trên thị trường" },
      { when: "Những năm gần đây", what: "Bùng nổ trong giới trẻ, nhất là dịp Tết" },
    ],
    sources: [
      {
        label: "VnExpress",
        title: "Cơn sốt áo dài cách tân của người Việt",
        url: "https://vnexpress.net/con-sot-ao-dai-cach-tan-cua-nguoi-viet-4706508.html",
      },
      HANOIMOI_LEMUR,
    ],
  },
  ao_tu_than: {
    facts: [
      "Áo được may từ bốn khổ vải hẹp. Hai vạt trước không cài khuy mà vắt chéo, giữ lại bằng thắt lưng; phần ngực để hở được che bằng chiếc yếm.",
      "Bộ trang phục đi cùng váy đen, khăn vấn quanh đầu và nón quai thao vành rộng khoảng 60–70 cm, có hai dây buộc bằng lụa.",
      "Đây là trang phục của liền chị Quan họ: áo tứ thân, mớ ba mớ bảy, yếm, thắt lưng hoa đào, nón quai thao. Liền anh mặc áo the, khăn xếp.",
      "Dân ca Quan họ Bắc Ninh được UNESCO ghi danh là Di sản văn hóa phi vật thể đại diện của nhân loại ngày 30/9/2009.",
    ],
    timeline: [
      { when: "Xưa", what: "Trang phục quen thuộc của phụ nữ vùng đồng bằng Bắc Bộ" },
      { when: "30/9/2009", what: "Dân ca Quan họ Bắc Ninh được UNESCO ghi danh" },
      { when: "Ngày nay", what: "Mặc trong lễ hội, hát Quan họ, chụp ảnh đầu xuân" },
    ],
    sources: [
      {
        label: "Báo Dân Việt",
        title: "Phụ nữ Việt với áo tứ thân, mớ ba, mớ bảy...",
        url: "https://danviet.vn/phu-nu-viet-voi-ao-tu-than-mo-ba-mo-bay-7777132348-d268698.html",
      },
      SCOV_QUAN_HO,
    ],
  },
  ao_ba_ba: {
    facts: [
      "Áo bà ba gắn với người Nam Bộ từ thế kỷ XIX. Nguồn gốc có nhiều giả thuyết: một thuyết cho rằng học giả Trương Vĩnh Ký đã cách tân từ kiểu áo của người dân đảo Penang (Malaysia); thuyết khác cho rằng người khai hoang phương Nam đã rút gọn áo dài cho hợp đời sống sông nước.",
      "Ban đầu áo có vạt lửng, nút vải thắt bên hông, về sau chuyển dần sang hàng nút ở giữa.",
      "Ngày nay áo bà ba vẫn xuất hiện trong lễ Tết, hội hè, biểu diễn cải lương, đờn ca tài tử và du lịch miệt vườn.",
    ],
    timeline: [
      { when: "Thế kỷ XIX", what: "Áo bà ba xuất hiện ở Nam Bộ (nguồn gốc còn nhiều giả thuyết)" },
      { when: "1965–1975", what: "Giai đoạn áo xẻ tà sâu hơn, chít eo nhiều hơn" },
      { when: "Ngày nay", what: "Biểu tượng của miền Tây, đi cùng khăn rằn" },
    ],
    sources: [
      {
        label: "Báo Thanh Niên",
        title: "Bà ba, khăn rằn biểu tượng của đất và người phương Nam",
        url: "https://thanhnien.vn/ba-ba-khan-ran-bieu-tuong-cua-dat-va-nguoi-phuong-nam-185230426180249809.htm",
      },
    ],
  },
};
