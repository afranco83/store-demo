import type { ReactNode, Ref } from "react";
import type { LucideIcon } from "lucide-react";

import { Icon } from "../../atoms/Icon";
import { Typography } from "../../atoms/Typography";
import { cn } from "../../utils/cn";

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

export function EmptyState({ icon, title, description, action, className, ref }: EmptyStateProps) {
  return (
    <div ref={ref} className={cn("flex flex-col items-center gap-3 py-12 text-center", className)}>
      <Icon icon={icon} size="lg" className="text-gray-400" />
      <Typography as="h3" variant="heading">
        {title}
      </Typography>
      {description ? (
        <Typography variant="caption" className="max-w-sm">
          {description}
        </Typography>
      ) : null}
      {action}
    </div>
  );
}
