import { renderLogoMark } from "@/lib/logo-mark";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return renderLogoMark(180);
}
