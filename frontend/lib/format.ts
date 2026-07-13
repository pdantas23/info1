export function formatPrice(cents: number, currency: string) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency }).format(cents / 100);
}
