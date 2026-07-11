import type { Metadata } from "next";
import Link from "next/link";
import { Button, Typography } from "@store-demo/ui";
import { logout } from "@store-demo/auth";

import { getProfileAction } from "@/features/account/api/get-profile.action";
import { EditProfileForm } from "@/features/account/components/EditProfileForm";

export const metadata: Metadata = { title: "Mi cuenta" };

export default async function AccountPage() {
  const profile = await getProfileAction();

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-10">
      <Typography as="h1" variant="display">
        Mi cuenta
      </Typography>
      <EditProfileForm profile={profile} />
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
