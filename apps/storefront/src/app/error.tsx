"use client";

import { useEffect } from "react";
import { Button, Typography } from "@store-demo/ui";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-20 text-center">
      <Typography as="h1" variant="heading">
        Algo ha ido mal
      </Typography>
      <Typography variant="body" className="text-gray-600">
        No se ha podido cargar esta página. Inténtalo de nuevo en unos segundos.
      </Typography>
      <Button type="button" onClick={reset}>
        Reintentar
      </Button>
    </main>
  );
}
