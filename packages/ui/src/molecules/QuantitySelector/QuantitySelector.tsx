import type { Ref } from "react";
import { Minus, Plus } from "lucide-react";

import { Button } from "../../atoms/Button";
import { Icon } from "../../atoms/Icon";
import { cn } from "../../utils/cn";

export interface QuantitySelectorProps {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  label?: string;
  decreaseLabel?: string;
  increaseLabel?: string;
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max,
  disabled = false,
  label = "Quantity",
  decreaseLabel = "Decrease quantity",
  increaseLabel = "Increase quantity",
  className,
  ref,
}: QuantitySelectorProps) {
  const canDecrease = !disabled && value > min;
  const canIncrease = !disabled && (max === undefined || value < max);

  return (
    <div
      ref={ref}
      role="group"
      aria-label={label}
      className={cn("inline-flex items-center gap-3", className)}
    >
      <Button
        type="button"
        intent="outline"
        size="sm"
        disabled={!canDecrease}
        onClick={() => onChange(value - 1)}
        aria-label={decreaseLabel}
      >
        <Icon icon={Minus} size="sm" />
      </Button>
      <span className="min-w-6 text-center text-sm font-medium text-gray-900" aria-live="polite">
        {value}
      </span>
      <Button
        type="button"
        intent="outline"
        size="sm"
        disabled={!canIncrease}
        onClick={() => onChange(value + 1)}
        aria-label={increaseLabel}
      >
        <Icon icon={Plus} size="sm" />
      </Button>
    </div>
  );
}
