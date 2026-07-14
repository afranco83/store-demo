import { getTranslations } from "next-intl/server";
import { cn } from "@store-demo/ui";
import type { Category } from "@store-demo/shared-types";

import { Link } from "@/i18n/navigation";

const filterLinkClassName = "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors";
const activeFilterLinkClassName = "border-accent bg-accent text-accent-foreground";
const inactiveFilterLinkClassName = "border-gray-300 text-gray-700 hover:bg-gray-50";

export async function CategoryFilterNav({
  categories,
  activeCategorySlug,
}: {
  categories: Category[];
  activeCategorySlug?: string;
}) {
  const t = await getTranslations("products");

  return (
    <nav aria-label={t("filterByCategoryLabel")} className="flex flex-wrap gap-2">
      <Link
        href="/products"
        className={cn(
          filterLinkClassName,
          activeCategorySlug ? inactiveFilterLinkClassName : activeFilterLinkClassName,
        )}
      >
        {t("allCategories")}
      </Link>
      {categories.map((category) => (
        <Link
          key={category.id}
          // Objeto {pathname, query}, no un string con "?": el Link de
          // next-intl (createNavigation) no conserva de forma fiable el
          // query string cuando el href es un string plano — comprobado en
          // real (el filtro dejaba de navegar a ?category=...).
          href={{ pathname: "/products", query: { category: category.slug } }}
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
