import type { ReactNode, TdHTMLAttributes, ThHTMLAttributes } from "react";

import { cn } from "../../utils/cn";

export interface TableProps {
  children: ReactNode;
  caption?: string;
  className?: string;
}

// Wrapper con scroll horizontal propio: una tabla de administración (más
// columnas que una tarjeta de producto) no puede asumir que el viewport
// siempre la contiene, y el body de la página no debe scrollear en horizontal.
export function Table({ children, caption, className }: TableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={cn("w-full border-collapse text-left text-sm", className)}>
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children }: { children: ReactNode }) {
  return <thead className="border-b border-gray-200">{children}</thead>;
}

export function TableBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-gray-100">{children}</tbody>;
}

export function TableRow({ children, className }: { children: ReactNode; className?: string }) {
  return <tr className={cn("hover:bg-gray-50", className)}>{children}</tr>;
}

export function TableHeaderCell({
  children,
  className,
  ...props
}: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th scope="col" className={cn("px-4 py-3 font-medium text-gray-500", className)} {...props}>
      {children}
    </th>
  );
}

export function TableCell({
  children,
  className,
  ...props
}: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={cn("px-4 py-3 text-gray-900", className)} {...props}>
      {children}
    </td>
  );
}
