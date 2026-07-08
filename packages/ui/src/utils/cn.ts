import { cx } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

type ClassValue = Parameters<typeof cx>[number];

export function cn(...inputs: ClassValue[]) {
  return twMerge(cx(...inputs));
}
