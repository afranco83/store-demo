import type { Ref } from "react";

import { cn } from "../../utils/cn";

export interface LocaleSwitcherOption {
  code: string;
  label: string;
  href: string;
}

export interface LocaleSwitcherProps {
  options: LocaleSwitcherOption[];
  activeLocale: string;
  /** aria-label del grupo — default en inglés, igual que el resto de labels
   * de accesibilidad de packages/ui (p. ej. Navbar.cartLabel); la app
   * consumidora pasa el valor traducido explícito. */
  groupLabel?: string;
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

export function LocaleSwitcher({
  options,
  activeLocale,
  groupLabel = "Language",
  className,
  ref,
}: LocaleSwitcherProps) {
  return (
    <div
      ref={ref}
      role="group"
      aria-label={groupLabel}
      className={cn("flex items-center gap-2 text-xs", className)}
    >
      {options.map((option, index) => (
        <span key={option.code} className="flex items-center gap-2">
          {index > 0 ? (
            <span aria-hidden="true" className="text-gray-600">
              /
            </span>
          ) : null}
          <a
            href={option.href}
            aria-current={option.code === activeLocale ? "true" : undefined}
            className={cn(
              "transition-colors",
              option.code === activeLocale
                ? "font-semibold text-white"
                : "text-gray-400 hover:text-accent-on-dark",
            )}
          >
            {option.label}
          </a>
        </span>
      ))}
    </div>
  );
}
