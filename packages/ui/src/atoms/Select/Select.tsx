import { useId, type Ref, type SelectHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../utils/cn";

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
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const hintId = hint ? `${selectId}-hint` : undefined;
  const errorId = error ? `${selectId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={selectId}
        className={cn("text-sm font-medium text-gray-900", hideLabel && "sr-only")}
      >
        {label}
      </label>
      <select
        ref={ref}
        id={selectId}
        className={cn(selectVariants({ size }), className)}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={describedBy}
        {...props}
      >
        {children}
      </select>
      {hint && !error ? (
        <p id={hintId} className="text-sm text-gray-500">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="text-sm text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
