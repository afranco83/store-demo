import type { Ref } from "react";
import { Check } from "lucide-react";

import { Icon } from "../../atoms/Icon";
import { Typography } from "../../atoms/Typography";
import { cn } from "../../utils/cn";

export interface WizardStepItem {
  id: string;
  label: string;
}

export interface WizardStepsProps {
  steps: WizardStepItem[];
  currentStepId: string;
  completedStepIds: string[];
  navLabel?: string;
  completedStepLabel?: string;
  className?: string;
  ref?: Ref<HTMLElement>;
}

export function WizardSteps({
  steps,
  currentStepId,
  completedStepIds,
  navLabel = "Checkout progress",
  completedStepLabel = "Completed",
  className,
  ref,
}: WizardStepsProps) {
  return (
    <nav ref={ref} aria-label={navLabel} className={cn("w-full", className)}>
      <ol className="flex items-center">
        {steps.map((step, index) => {
          const isCurrent = step.id === currentStepId;
          const isCompleted = !isCurrent && completedStepIds.includes(step.id);
          const isLast = index === steps.length - 1;

          return (
            <li
              key={step.id}
              aria-current={isCurrent ? "step" : undefined}
              className={cn("flex items-center", !isLast && "flex-1")}
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full border text-sm font-medium",
                    isCurrent && "border-accent bg-accent text-accent-foreground",
                    isCompleted && "border-accent bg-accent-soft text-accent",
                    !isCurrent && !isCompleted && "border-gray-200 text-gray-400",
                  )}
                >
                  {isCompleted ? (
                    <Icon icon={Check} size="sm" label={completedStepLabel} />
                  ) : (
                    index + 1
                  )}
                </span>
                <Typography
                  variant="caption"
                  className={cn(
                    "font-medium",
                    (isCurrent || isCompleted) && "text-gray-900",
                    !isCurrent && !isCompleted && "text-gray-400",
                  )}
                >
                  {step.label}
                </Typography>
              </div>
              {!isLast && (
                <span
                  aria-hidden="true"
                  className={cn("mx-3 h-px flex-1", isCompleted ? "bg-accent" : "bg-gray-200")}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
