import { AgeRange } from "../types";

/**
 * Câu nói cho từng nhân vật dân gian (FolkAvatar) trong màn chờ ghép ảnh.
 * Chỉ dùng ca dao, tục ngữ, đồng dao (dân gian) và Truyện Kiều (Nguyễn Du), không dùng thơ còn bản quyền.
 */

export interface FolkSaying {
  lines: string[];
  source: string;
}

export interface FolkCharacter {
  gender: "nam" | "nu";
  age: AgeRange;
  sayings: FolkSaying[];
}

const caDao = (...lines: string[]): FolkSaying => ({ lines, source: "Ca dao" });
const tucNgu = (line: string): FolkSaying => ({ lines: [line], source: "Tục ngữ" });
const dongDao = (...lines: string[]): FolkSaying => ({ lines, source: "Đồng dao" });
const kieu = (...lines: string[]): FolkSaying => ({ lines, source: "Truyện Kiều, Nguyễn Du" });

export const FOLK_CHARACTERS: FolkCharacter[] = [
  {
    gender: "nam",
    age: "tren_30", // Ông đồ
    sayings: [
      kieu("Trăm năm trong cõi người ta,", "Chữ tài chữ mệnh khéo là ghét nhau."),
      kieu("Mai cốt cách, tuyết tinh thần,", "Mỗi người một vẻ mười phân vẹn mười."),
      tucNgu("Tiên học lễ, hậu học văn."),
    ],
  },
  {
    gender: "nam",
    age: "23_30", // Thầy đồ
    sayings: [
      caDao("Muốn sang thì bắc cầu kiều,", "Muốn con hay chữ thì yêu lấy thầy."),
      tucNgu("Không thầy đố mày làm nên."),
      tucNgu("Nhất tự vi sư, bán tự vi sư."),
    ],
  },
  {
    gender: "nam",
    age: "19_22", // Sĩ tử
    sayings: [
      caDao("Chẳng tham ruộng cả ao liền,", "Tham về cái bút cái nghiên anh đồ."),
      tucNgu("Có công mài sắt, có ngày nên kim."),
    ],
  },
  {
    gender: "nam",
    age: "16_18", // Thư sinh
    sayings: [tucNgu("Học thầy không tày học bạn."), tucNgu("Học ăn, học nói, học gói, học mở."), tucNgu("Tốt gỗ hơn tốt nước sơn.")],
  },
  {
    gender: "nam",
    age: "duoi_16", // Cậu bé tóc trái đào
    sayings: [
      caDao("Thằng Bờm có cái quạt mo,", "Phú ông xin đổi ba bò chín trâu."),
      dongDao("Con mèo mà trèo cây cau,", "Hỏi thăm chú chuột đi đâu vắng nhà."),
      dongDao("Chi chi chành chành,", "Cái đanh thổi lửa."),
    ],
  },
  {
    gender: "nu",
    age: "duoi_16", // Cô bé tóc hai chỏm
    sayings: [
      dongDao("Dung dăng dung dẻ,", "Dắt trẻ đi chơi."),
      caDao("Cái bống là cái bống bang,", "Khéo sảy khéo sàng cho mẹ nấu cơm."),
    ],
  },
  {
    gender: "nu",
    age: "16_18", // Cô thôn nữ
    sayings: [
      caDao("Trên đồng cạn, dưới đồng sâu,", "Chồng cày, vợ cấy, con trâu đi bừa."),
      caDao("Ai ơi bưng bát cơm đầy,", "Dẻo thơm một hạt, đắng cay muôn phần."),
    ],
  },
  {
    gender: "nu",
    age: "19_22", // Tiểu thư
    sayings: [
      tucNgu("Người đẹp vì lụa, lúa tốt vì phân."),
      caDao("Gió đưa cành trúc la đà,", "Tiếng chuông Trấn Vũ, canh gà Thọ Xương."),
      caDao("Đường vô xứ Huế quanh quanh,", "Non xanh nước biếc như tranh họa đồ."),
    ],
  },
  {
    gender: "nu",
    age: "23_30", // Liền chị quan họ
    sayings: [
      caDao("Bầu ơi thương lấy bí cùng,", "Tuy rằng khác giống nhưng chung một giàn."),
      caDao("Yêu nhau cởi áo cho nhau,", "Về nhà mẹ hỏi qua cầu gió bay."),
    ],
  },
  {
    gender: "nu",
    age: "tren_30", // Bà đồ
    sayings: [tucNgu("Ăn quả nhớ kẻ trồng cây."), tucNgu("Thương người như thể thương thân."), tucNgu("Một con ngựa đau, cả tàu bỏ cỏ.")],
  },
];
