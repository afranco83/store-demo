import { z } from "zod";

// Sin mensajes de error custom a propósito: ver el mismo comentario en
// shipping-address.schema.ts.
export const simulatedPaymentSchema = z.object({
  cardholderName: z.string().min(1),
  cardNumber: z.string().regex(/^\d{16}$/),
  expiryMonth: z.string().regex(/^(0[1-9]|1[0-2])$/),
  expiryYear: z.string().regex(/^\d{4}$/),
  cvc: z.string().regex(/^\d{3,4}$/),
});
export type SimulatedPayment = z.infer<typeof simulatedPaymentSchema>;

// "Tarjeta mágica" de pago simulado: cualquier número de tarjeta (por lo
// demás válido) que termine en este dígito fuerza un fallo simulado en el
// servidor (ver POST /api/orders) — permite testear de verdad el camino de
// error sin depender de una pasarela de pago real. Función pura y sin I/O
// para poder reutilizarse igual en apps/api y en fixtures E2E.
export const SIMULATED_PAYMENT_DECLINE_LAST_DIGIT = "1";

export function isSimulatedPaymentDeclined(cardNumber: string): boolean {
  return cardNumber.endsWith(SIMULATED_PAYMENT_DECLINE_LAST_DIGIT);
}
