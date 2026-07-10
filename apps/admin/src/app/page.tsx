import { redirect } from "next/navigation";

// Sin dashboard propio (fuera de alcance del ROADMAP, Fase 7) — la
// gestión de catálogo es el punto de entrada natural de apps/admin.
export default function HomePage() {
  redirect("/products");
}
