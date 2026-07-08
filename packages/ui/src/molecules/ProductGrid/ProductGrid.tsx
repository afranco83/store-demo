import type { ReactNode, Ref } from "react";

import { cn } from "../../utils/cn";

export interface ProductGridProps {
  children: ReactNode;
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

export function ProductGrid({ children, className, ref }: ProductGridProps) {
  return (
    <div
      ref={ref}
      className={cn(
        "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        className,
      )}
    >
      {children}
    </div>
  );
}
