"use client";

import { useState, useTransition } from "react";
import {
  PriceTag,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from "@store-demo/ui";
import { ORDER_STATUS_BADGES } from "@store-demo/core";
import { orderStatusSchema } from "@store-demo/shared-types";
import type { Order, OrderStatus } from "@store-demo/shared-types";

import { updateOrderStatusAction } from "../api/update-order-status.action";

export interface OrdersTableProps {
  orders: Order[];
}

const orderDateFormatter = new Intl.DateTimeFormat("es-ES", { dateStyle: "long" });

export function OrdersTable({ orders: initialOrders }: OrdersTableProps) {
  // Estado local, sembrado de la prop inicial: la Server Action ya
  // revalida la ruta (revalidatePath) para la próxima navegación real, así
  // que aquí basta con reflejar la respuesta confirmada del servidor sin
  // pedir de nuevo la lista entera — evita tanto el reboteo visual del
  // <select> (que antes leía la prop `order.status` sin cambiar durante la
  // petición) como el refetch completo de router.refresh() para actualizar
  // una sola fila.
  const [orders, setOrders] = useState(initialOrders);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const [errorByOrderId, setErrorByOrderId] = useState<Record<string, string>>({});
  const [, startTransition] = useTransition();

  function handleStatusChange(orderId: string, status: OrderStatus) {
    setPendingOrderId(orderId);
    setErrorByOrderId((current) => {
      const next = { ...current };
      delete next[orderId];
      return next;
    });
    startTransition(async () => {
      const result = await updateOrderStatusAction({ orderId, status });
      setPendingOrderId(null);
      if ("error" in result) {
        setErrorByOrderId((current) => ({ ...current, [orderId]: result.error }));
        return;
      }
      setOrders((current) => current.map((order) => (order.id === orderId ? result.order : order)));
    });
  }

  if (orders.length === 0) {
    return <p className="text-sm text-gray-600">No hay pedidos todavía.</p>;
  }

  return (
    <Table caption="Pedidos">
      <TableHeader>
        <TableRow>
          <TableHeaderCell>Cliente</TableHeaderCell>
          <TableHeaderCell>Email</TableHeaderCell>
          <TableHeaderCell>Fecha</TableHeaderCell>
          <TableHeaderCell>Total</TableHeaderCell>
          <TableHeaderCell>Estado</TableHeaderCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell>{order.shippingFullName}</TableCell>
            <TableCell>{order.userEmail}</TableCell>
            <TableCell>{orderDateFormatter.format(order.createdAt)}</TableCell>
            <TableCell>
              <PriceTag amountCents={order.totalCents} />
            </TableCell>
            <TableCell>
              <div className="flex flex-col gap-1">
                <Select
                  label={`Estado del pedido de ${order.shippingFullName}`}
                  hideLabel
                  size="sm"
                  disabled={pendingOrderId === order.id}
                  value={order.status}
                  onChange={(event) => {
                    const status = orderStatusSchema.parse(event.target.value);
                    handleStatusChange(order.id, status);
                  }}
                >
                  {orderStatusSchema.options.map((status) => (
                    <option key={status} value={status}>
                      {ORDER_STATUS_BADGES[status].label}
                    </option>
                  ))}
                </Select>
                {errorByOrderId[order.id] ? (
                  <p role="alert" className="text-sm text-red-600">
                    {errorByOrderId[order.id]}
                  </p>
                ) : null}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
