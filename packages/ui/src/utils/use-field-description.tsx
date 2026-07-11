import { useId } from "react";

export interface FieldDescription {
  fieldId: string;
  hintId: string | undefined;
  errorId: string | undefined;
  describedBy: string | undefined;
}

// Wiring de accesibilidad compartido por Input/Select/Textarea (3ª
// aparición del mismo bloque — AGENTS.md §1.9 AHA, extraído en vez de
// duplicado una vez más): id del campo, ids de hint/error solo si existen,
// y el aria-describedby resultante.
export function useFieldDescription({
  id,
  hint,
  error,
}: {
  id?: string;
  hint?: string;
  error?: string;
}): FieldDescription {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return { fieldId, hintId, errorId, describedBy };
}

// Párrafos de hint/error asociados por id al campo — el hint se oculta si
// hay error (no se muestran ambos a la vez).
export function FieldHintOrError({
  hint,
  error,
  hintId,
  errorId,
}: {
  hint?: string;
  error?: string;
  hintId?: string;
  errorId?: string;
}) {
  return (
    <>
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
    </>
  );
}
