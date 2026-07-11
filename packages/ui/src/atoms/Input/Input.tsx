import type { InputHTMLAttributes, Ref } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../utils/cn";
import { FieldHintOrError, useFieldDescription } from "../../utils/use-field-description";

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
  const { fieldId, hintId, errorId, describedBy } = useFieldDescription({ id, hint, error });

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={fieldId} className="text-sm font-medium text-gray-900">
        {label}
      </label>
      <input
        ref={ref}
        id={fieldId}
        className={cn(inputVariants({ size }), className)}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={describedBy}
        {...props}
      />
      <FieldHintOrError hint={hint} error={error} hintId={hintId} errorId={errorId} />
    </div>
  );
}
