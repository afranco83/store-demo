import { z } from "zod";

export const simulatedPaymentSchema = z.object({
  cardholderName: z.string().min(1, "El nombre del titular no puede estar vacío"),
  cardNumber: z.string().regex(/^\d{16}$/, "La tarjeta debe tener 16 dígitos"),
  expiryMonth: z.string().regex(/^(0[1-9]|1[0-2])$/, "Mes de caducidad inválido"),
  expiryYear: z.string().regex(/^\d{4}$/, "Año de caducidad inválido"),
  cvc: z.string().regex(/^\d{3,4}$/, "CVC inválido"),
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
