import Link from "next/link";
import { cn } from "@store-demo/ui";
import type { Category } from "@store-demo/shared-types";

const filterLinkClassName = "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors";
const activeFilterLinkClassName = "border-accent bg-accent text-accent-foreground";
const inactiveFilterLinkClassName = "border-gray-300 text-gray-700 hover:bg-gray-50";

export function CategoryFilterNav({
  categories,
  activeCategorySlug,
}: {
  categories: Category[];
  activeCategorySlug?: string;
}) {
  return (
    <nav aria-label="Filtrar por categoría" className="flex flex-wrap gap-2">
      <Link
        href="/products"
        className={cn(
          filterLinkClassName,
          activeCategorySlug ? inactiveFilterLinkClassName : activeFilterLinkClassName,
        )}
      >
        Todas
      </Link>
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/products?category=${category.slug}`}
          className={cn(
            filterLinkClassName,
            activeCategorySlug === category.slug
              ? activeFilterLinkClassName
              : inactiveFilterLinkClassName,
          )}
        >
          {category.name}
        </Link>
      ))}
    </nav>
  );
}
