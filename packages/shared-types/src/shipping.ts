// Tarifa de envío simulada: fuente única de verdad compartida entre
// apps/api (cálculo real/autoritativo al crear el pedido) y apps/storefront
// (estimación mostrada en el paso de revisión antes de confirmar).
export const FLAT_SHIPPING_CENTS = 499;
export const FREE_SHIPPING_THRESHOLD_CENTS = 5000;

export function calculateShippingCents(subtotalCents: number): number {
  return subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : FLAT_SHIPPING_CENTS;
}
