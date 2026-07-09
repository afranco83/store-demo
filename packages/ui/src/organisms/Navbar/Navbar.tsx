import type { ReactNode, Ref } from "react";
import { ShoppingCart } from "lucide-react";

import { Badge } from "../../atoms/Badge";
import { Button } from "../../atoms/Button";
import { Icon } from "../../atoms/Icon";
import { cn } from "../../utils/cn";

export interface NavbarProps {
  logoSlot: ReactNode;
  navSlot: ReactNode;
  /** Login/cuenta — se renderiza a la derecha, junto al carrito. */
  authSlot?: ReactNode;
  cartItemCount?: number;
  onCartClick: () => void;
  cartLabel?: string;
  className?: string;
  ref?: Ref<HTMLElement>;
}

export function Navbar({
  logoSlot,
  navSlot,
  authSlot,
  cartItemCount = 0,
  onCartClick,
  cartLabel = "Open cart",
  className,
  ref,
}: NavbarProps) {
  return (
    <header
      ref={ref}
      className={cn(
        "flex items-center justify-between gap-4 border-b border-gray-200 bg-white px-4 py-3",
        className,
      )}
    >
      <div className="flex items-center gap-6">
        {logoSlot}
        <nav className="flex items-center gap-4">{navSlot}</nav>
      </div>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          intent="ghost"
          size="sm"
          onClick={onCartClick}
          aria-label={cartLabel}
          className="relative"
        >
          <Icon icon={ShoppingCart} size="md" />
          {cartItemCount > 0 ? (
            <Badge
              intent="accent"
              size="sm"
              className="absolute -top-1.5 -right-1.5 min-w-5 justify-center px-1"
            >
              {cartItemCount}
            </Badge>
          ) : null}
        </Button>
        {authSlot}
      </div>
    </header>
  );
}
