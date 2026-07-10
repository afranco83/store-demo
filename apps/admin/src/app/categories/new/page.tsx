import { Typography } from "@store-demo/ui";

import { CategoryForm } from "@/features/categories/components/CategoryForm";

export default function NewCategoryPage() {
  return (
    <main className="mx-auto flex max-w-xl flex-col gap-6 px-4 py-10">
      <Typography as="h1" variant="display">
        Nueva categoría
      </Typography>
      <CategoryForm />
    </main>
  );
}
