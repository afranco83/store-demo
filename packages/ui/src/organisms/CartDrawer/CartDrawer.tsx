"use client";

import { useEffect, useId, useRef } from "react";
import type { ReactNode } from "react";
import { ShoppingBag, X } from "lucide-react";

import { Button } from "../../atoms/Button";
import { Icon } from "../../atoms/Icon";
import { PriceTag } from "../../atoms/PriceTag";
import { Spinner } from "../../atoms/Spinner";
import { Typography } from "../../atoms/Typography";
import { CartLineItem, type CartLineItemProps } from "../../molecules/CartLineItem";
import { EmptyState } from "../../molecules/EmptyState";
import { cn } from "../../utils/cn";

export type CartDrawerItem = { id: string } & Pick<
  CartLineItemProps,
  | "name"
  | "imageUrl"
  | "priceCents"
  | "quantity"
  | "onQuantityChange"
  | "onRemove"
  | "maxQuantity"
  | "isUpdating"
  | "quantityLabel"
  | "decreaseQuantityLabel"
  | "increaseQuantityLabel"
  | "removeLabel"
>;

export interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartDrawerItem[];
  subtotalCents: number;
  isLoading?: boolean;
  errorMessage?: string;
  emptyStateAction?: ReactNode;
  title?: string;
  closeLabel?: string;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  subtotalLabel?: string;
  className?: string;
}

export function CartDrawer({
  isOpen,
  onClose,
  items,
  subtotalCents,
  isLoading = false,
  errorMessage,
  emptyStateAction,
  title = "Cart",
  closeLabel = "Close cart",
  emptyStateTitle = "Your cart is empty",
  emptyStateDescription = "Add products to see them here.",
  subtotalLabel = "Subtotal",
  className,
}: CartDrawerProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    previouslyFocusedElementRef.current = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();

    function getFocusableElements(): HTMLElement[] {
      if (!dialogRef.current) return [];
      return Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      );
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const focusableElements = getFocusableElements();
      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocusedElementRef.current?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        data-testid="cart-drawer-backdrop"
        className="absolute inset-0 bg-gray-900/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "relative flex h-dvh w-full max-w-md flex-col gap-4 bg-white p-6 shadow-xl focus:outline-none",
          className,
        )}
      >
        <div className="flex items-center justify-between">
          <Typography as="h2" variant="heading" id={titleId}>
            {title}
          </Typography>
          <Button type="button" intent="ghost" size="sm" onClick={onClose} aria-label={closeLabel}>
            <Icon icon={X} size="md" />
          </Button>
        </div>

        {errorMessage ? (
          <p role="alert" className="text-sm text-red-600">
            {errorMessage}
          </p>
        ) : null}

        {isLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <Spinner label="Loading cart" />
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title={emptyStateTitle}
            description={emptyStateDescription}
            action={emptyStateAction}
          />
        ) : (
          <div className="flex-1 divide-y divide-gray-100 overflow-y-auto">
            {items.map(({ id, ...item }) => (
              <CartLineItem key={id} {...item} />
            ))}
          </div>
        )}

        {!isLoading && items.length > 0 ? (
          <div className="flex items-center justify-between border-t border-gray-200 pt-4">
            <Typography variant="body" className="font-medium">
              {subtotalLabel}
            </Typography>
            <PriceTag amountCents={subtotalCents} size="lg" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
