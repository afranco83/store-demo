const CLOUDINARY_UPLOAD_SEGMENT = "/image/upload/";

// Cloudinary sirve el original tal cual (sin redimensionar) salvo que se le
// pida explícitamente vía la propia URL — para las miniaturas de catálogo
// eso significa bajar de un JPEG de ~90KB a tamaño completo a un WebP de
// ~9KB al tamaño real de render, medido con Lighthouse (Fase 8, LCP). No
// aplica a packages/ui (ciego a Cloudinary/negocio, AGENTS.md §1.3): la
// transformación se resuelve aquí, antes de pasarle la URL a ProductCard.
export function buildCloudinaryThumbnailUrl(imageUrl: string, widthPx: number): string {
  const uploadIndex = imageUrl.indexOf(CLOUDINARY_UPLOAD_SEGMENT);
  if (uploadIndex === -1) {
    return imageUrl;
  }

  const insertAt = uploadIndex + CLOUDINARY_UPLOAD_SEGMENT.length;
  return `${imageUrl.slice(0, insertAt)}w_${widthPx},q_auto,f_auto/${imageUrl.slice(insertAt)}`;
}
