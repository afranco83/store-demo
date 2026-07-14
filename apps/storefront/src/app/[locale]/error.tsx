"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button, Typography } from "@store-demo/ui";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errors");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-20 text-center">
      <Typography as="h1" variant="heading">
        {t("title")}
      </Typography>
      <Typography variant="body" className="text-gray-600">
        {t("description")}
      </Typography>
      <Button type="button" onClick={reset}>
        {t("retryButton")}
      </Button>
    </main>
  );
}
