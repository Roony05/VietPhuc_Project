import { Screen } from "../types";

/**
 * Mỗi màn có 1 đường dẫn dạng #/... để nút Back của trình duyệt dùng được và gửi link cho người khác.
 * Dùng hash (#) nên chạy được cả khi publish lên AI Studio mà không cần cấu hình server.
 */
export const ROUTES: Record<Screen, string> = {
  home: "#/",
  filter: "#/chon-gu",
  recommend: "#/goi-y",
  gallery: "#/thu-vien",
  studio: "#/phong-thu-do",
  result: "#/ket-qua",
  finish: "#/hoan-tat",
  lookbook: "#/lookbook",
  profile: "#/ho-so",
};

export function screenFromHash(hash: string): Screen {
  const path = hash.split("?")[0] || "#/";
  const found = (Object.keys(ROUTES) as Screen[]).find((s) => ROUTES[s] === path);
  return found ?? "home";
}
