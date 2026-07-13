import type { AnchorHTMLAttributes, Ref } from "react";

import { cn } from "../../utils/cn";

export interface VersionBadgeProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  version: string;
  ref?: Ref<HTMLAnchorElement>;
}

export function VersionBadge({ version, className, ref, ...props }: VersionBadgeProps) {
  return (
    <a
      ref={ref}
      className={cn(
        "text-xs text-gray-500 underline-offset-2 hover:text-gray-700 hover:underline",
        className,
      )}
      {...props}
    >
      v{version}
    </a>
  );
}
