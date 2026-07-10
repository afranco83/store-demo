import { Typography } from "@store-demo/ui";
import { logout } from "@store-demo/auth";

export default function ForbiddenPage() {
  return (
    <main className="mx-auto flex max-w-md flex-col gap-4 px-4 py-10">
      <Typography as="h1" variant="display">
        Sin permisos
      </Typography>
      <Typography variant="body" className="text-gray-600">
        Tu cuenta no tiene permisos de administrador para acceder a esta aplicación.
      </Typography>
      <form action={logout}>
        <button type="submit" className="text-sm font-medium text-accent">
          Cerrar sesión
        </button>
      </form>
    </main>
  );
}
