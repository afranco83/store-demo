import { useId, type InputHTMLAttributes, type Ref } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../utils/cn";

const inputVariants = cva(
  "w-full rounded-md border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-red-500 aria-invalid:focus-visible:ring-red-500",
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

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size">, VariantProps<typeof inputVariants> {
  label: string;
  hint?: string;
  error?: string;
  ref?: Ref<HTMLInputElement>;
}

export function Input({ className, size, label, hint, error, id, ref, ...props }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-gray-900">
        {label}
      </label>
      <input
        ref={ref}
        id={inputId}
        className={cn(inputVariants({ size }), className)}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={describedBy}
        {...props}
      />
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
