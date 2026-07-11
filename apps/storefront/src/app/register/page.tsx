import type { Metadata } from "next";
import Link from "next/link";
import { Typography } from "@store-demo/ui";

import { RegisterForm } from "@/features/auth/components/RegisterForm";

export const metadata: Metadata = { title: "Crear cuenta" };

export default function RegisterPage() {
  return (
    <main className="mx-auto flex max-w-md flex-col gap-6 px-4 py-10">
      <Typography as="h1" variant="display">
        Crear cuenta
      </Typography>
      <RegisterForm />
      <Typography variant="caption">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-medium text-accent">
          Inicia sesión
        </Link>
      </Typography>
    </main>
  );
}
