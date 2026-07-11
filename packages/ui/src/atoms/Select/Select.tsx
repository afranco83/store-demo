import type { Ref, SelectHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../utils/cn";
import { FieldHintOrError, useFieldDescription } from "../../utils/use-field-description";

const selectVariants = cva(
  "w-full rounded-md border border-gray-300 bg-white text-gray-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-red-500 aria-invalid:focus-visible:ring-red-500",
  {
    variants: {
      size: {
        sm: "h-8 px-2.5 text-sm",
        md: "h-10 px-3 text-sm",
        lg: "h-12 px-4 text-base",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

export interface SelectProps
  extends
    Omit<SelectHTMLAttributes<HTMLSelectElement>, "size">,
    VariantProps<typeof selectVariants> {
  label: string;
  /** Mantiene el label accesible (asociado por `htmlFor`) pero lo oculta visualmente — para usos donde el contexto visual ya lo da otra cosa (p. ej. la cabecera de columna de una tabla). */
  hideLabel?: boolean;
  hint?: string;
  error?: string;
  ref?: Ref<HTMLSelectElement>;
}

export function Select({
  className,
  size,
  label,
  hideLabel = false,
  hint,
  error,
  id,
  children,
  ref,
  ...props
}: SelectProps) {
  const { fieldId, hintId, errorId, describedBy } = useFieldDescription({ id, hint, error });

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={fieldId}
        className={cn("text-sm font-medium text-gray-900", hideLabel && "sr-only")}
      >
        {label}
      </label>
      <select
        ref={ref}
        id={fieldId}
        className={cn(selectVariants({ size }), className)}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={describedBy}
        {...props}
      >
        {children}
      </select>
      <FieldHintOrError hint={hint} error={error} hintId={hintId} errorId={errorId} />
    </div>
  );
}
