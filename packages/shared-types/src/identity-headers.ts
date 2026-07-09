// Nombre del header HTTP que transporta el id opaco de un carrito de
// invitado entre apps/storefront (que lo genera y lo guarda en cookie) y
// apps/api (que lo trata como bucket key sin verificación criptográfica,
// ver ARCHITECTURE.md §4). Single source of truth para ambos lados.
export const GUEST_ID_HEADER = "x-guest-id";

// Cookie httpOnly propia de apps/storefront (no relacionada con Auth.js) que
// guarda el id de invitado mientras no hay sesión. La crea/lee
// features/cart, y packages/auth la lee/borra al fusionar el carrito en el
// callback signIn — de ahí que el nombre viva en shared-types y no en
// ninguno de los dos paquetes.
export const GUEST_CART_COOKIE = "guest_cart_id";
