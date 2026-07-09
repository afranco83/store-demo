import Link from "next/link";
import { Button, Typography } from "@store-demo/ui";
import { auth, logout } from "@store-demo/auth";

export default async function AccountPage() {
  const session = await auth();

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-10">
      <Typography as="h1" variant="display">
        Mi cuenta
      </Typography>
      <Typography variant="body">
        Hola, {session?.user.name} ({session?.user.email})
      </Typography>
      <Link href="/account/orders" className="font-medium text-accent">
        Ver mis pedidos
      </Link>
      <form action={logout}>
        <Button type="submit" intent="outline">
          Cerrar sesión
        </Button>
      </form>
    </main>
  );
}
