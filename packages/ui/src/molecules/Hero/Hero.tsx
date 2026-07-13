import type { ReactNode, Ref } from "react";

import { Typography } from "../../atoms/Typography";
import { cn } from "../../utils/cn";

export interface HeroProps {
  /** Etiqueta corta encima del título (p. ej. "Nueva colección"). */
  eyebrow?: string;
  title: string;
  description?: string;
  /** CTA, p. ej. un `<Link>` estilizado con `buttonVariants`. */
  action?: ReactNode;
  className?: string;
  ref?: Ref<HTMLElement>;
}

export function Hero({ eyebrow, title, description, action, className, ref }: HeroProps) {
  return (
    <section
      ref={ref}
      className={cn(
        "flex flex-col items-start gap-4 rounded-2xl bg-linear-to-br from-accent to-accent-hover px-8 py-16 text-accent-foreground sm:px-12",
        className,
      )}
    >
      {eyebrow ? (
        <Typography
          as="span"
          variant="caption"
          className="font-semibold tracking-wide text-accent-foreground uppercase"
        >
          {eyebrow}
        </Typography>
      ) : null}
      <Typography as="h1" variant="display" className="text-accent-foreground">
        {title}
      </Typography>
      {description ? (
        <Typography variant="body" className="max-w-xl text-accent-foreground">
          {description}
        </Typography>
      ) : null}
      {action}
    </section>
  );
}
