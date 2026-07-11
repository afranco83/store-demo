import type { Ref, TextareaHTMLAttributes } from "react";

import { cn } from "../../utils/cn";
import { FieldHintOrError, useFieldDescription } from "../../utils/use-field-description";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hint?: string;
  error?: string;
  ref?: Ref<HTMLTextAreaElement>;
}

export function Textarea({
  className,
  label,
  hint,
  error,
  id,
  rows = 4,
  ref,
  ...props
}: TextareaProps) {
  const { fieldId, hintId, errorId, describedBy } = useFieldDescription({ id, hint, error });

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={fieldId} className="text-sm font-medium text-gray-900">
        {label}
      </label>
      <textarea
        ref={ref}
        id={fieldId}
        rows={rows}
        className={cn(
          "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-red-500 aria-invalid:focus-visible:ring-red-500",
          className,
        )}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={describedBy}
        {...props}
      />
      <FieldHintOrError hint={hint} error={error} hintId={hintId} errorId={errorId} />
    </div>
  );
}
