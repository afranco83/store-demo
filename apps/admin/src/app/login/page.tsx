import type { Metadata } from "next";
import { Typography } from "@store-demo/ui";

import { LoginForm } from "@/features/auth/components/LoginForm";

export const metadata: Metadata = { title: "Iniciar sesión" };

export default function LoginPage() {
  return (
    <main className="mx-auto flex max-w-md flex-col gap-6 px-4 py-10">
      <Typography as="h1" variant="display">
        Admin
      </Typography>
      <LoginForm />
    </main>
  );
}
