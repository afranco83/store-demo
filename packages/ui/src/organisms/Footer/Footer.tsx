import type { ReactNode, Ref } from "react";

import { Typography } from "../../atoms/Typography";
import { cn } from "../../utils/cn";

export interface FooterColumn {
  heading: string;
  /** Enlaces de la columna (p. ej. `<Link>` de Next), inyectados por la app consumidora. */
  links: ReactNode;
}

export interface FooterProps {
  /** Nombre de marca + tagline corta. */
  brandSlot: ReactNode;
  columns: FooterColumn[];
  /** Texto de copyright, alineado a la izquierda de la barra inferior. */
  bottomStart?: ReactNode;
  /** Enlaces secundarios (repo, versión...), alineados a la derecha de la barra inferior. */
  bottomEnd?: ReactNode;
  className?: string;
  ref?: Ref<HTMLElement>;
}

export function Footer({
  brandSlot,
  columns,
  bottomStart,
  bottomEnd,
  className,
  ref,
}: FooterProps) {
  return (
    <footer
      ref={ref}
      className={cn("border-t border-gray-800 bg-gray-900 text-gray-300", className)}
    >
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr]">
        <div className="max-w-xs">{brandSlot}</div>
        {columns.map((column) => (
          <nav key={column.heading} aria-label={column.heading}>
            <Typography as="h3" variant="body" className="text-sm font-semibold text-white">
              {column.heading}
            </Typography>
            <div className="mt-3 flex flex-col gap-2 text-sm [&_a]:text-gray-300 [&_a]:transition-colors [&_a:hover]:text-accent-on-dark">
              {column.links}
            </div>
          </nav>
        ))}
      </div>
      <div className="border-t border-gray-800">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-4 text-xs text-gray-400 sm:flex-row">
          <div>{bottomStart}</div>
          {/* Sin selector [&_a:hover] genérico aquí a propósito: bottomEnd
              mezcla enlaces con tratamientos de hover distintos (GitHub vs.
              VersionBadge), y ese selector ganaría por especificidad CSS al
              hover:text-white que VersionBadge define en su propia clase —
              cada enlace se encarga de su propio hover. */}
          <div className="flex items-center gap-4">{bottomEnd}</div>
        </div>
      </div>
    </footer>
  );
}
