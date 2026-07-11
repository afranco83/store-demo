// Estilo compartido para las acciones de fila (Editar/Eliminar) de las
// tablas de administración — deliberadamente texto plano, sin el
// tratamiento visual completo de Button/buttonVariants (packages/ui), que
// añadiría padding/alto pensado para botones reales y rompería la densidad
// de una fila de tabla. Extraído aquí en vez de duplicado por
// ProductsTable/CategoriesTable (AGENTS.md §1.9 DRY).
export const rowActionLinkClassName = "text-sm font-medium text-accent";
export const rowActionDangerClassName = "text-sm font-medium text-red-600";
