"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { ReactNode } from "react";
import { CircleUserRound } from "lucide-react";

import { Button } from "../../atoms/Button";
import { Icon } from "../../atoms/Icon";
import { cn } from "../../utils/cn";

export interface UserMenuProps {
  /** Opciones del menú (enlaces/botones ya compuestos por el llamador — packages/ui no conoce next/link). */
  items: ReactNode;
  triggerLabel?: string;
  className?: string;
}

// Desplegable simple (no modal): a diferencia de CartDrawer no necesita focus
// trap propio, solo cerrarse con Escape o al hacer click fuera. Sin prop
// `ref` externa (mismo criterio que CartDrawer): ya usa un ref interno
// propio para detectar clicks fuera.
export function UserMenu({ items, triggerLabel = "Account menu", className }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <Button
        type="button"
        intent="ghost"
        size="sm"
        aria-label={triggerLabel}
        aria-haspopup="menu"
        aria-controls={menuId}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        <Icon icon={CircleUserRound} size="md" />
      </Button>
      {isOpen ? (
        <div
          id={menuId}
          role="menu"
          aria-label={triggerLabel}
          tabIndex={-1}
          // No añade navegación por teclado propia entre items (Escape ya se
          // gestiona a nivel de documento en el useEffect) — el listener
          // vacío y el tabIndex solo satisfacen las reglas de a11y que
          // exigen que un rol interactivo (`menu`) con onClick sea
          // programáticamente focusable.
          onKeyDown={() => {}}
          // Se difiere el cierre (en vez de setIsOpen(false) síncrono): si un
          // item es el submit button de un <form> (p. ej. logout), cerrar el
          // menú en el mismo tick lo desmonta antes de que el navegador
          // complete el envío nativo del formulario, cancelándolo.
          onClick={() => setTimeout(() => setIsOpen(false), 0)}
          className="absolute top-full right-0 z-10 mt-2 flex min-w-40 flex-col gap-0.5 rounded-md border border-gray-200 bg-white p-1 shadow-lg"
        >
          {items}
        </div>
      ) : null}
    </div>
  );
}
