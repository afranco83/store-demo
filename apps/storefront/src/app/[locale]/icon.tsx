import { renderLogoMark } from "@/lib/logo-mark";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return renderLogoMark(32);
}
