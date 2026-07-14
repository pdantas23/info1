import countryToCurrency from "country-to-currency";

// Moeda padrão de um país (ISO 3166-1 alpha-2 -> ISO 4217). Países sem
// mapeamento (ou código inválido) caem em USD.
export function currencyForCountry(countryCode: string): string {
  const normalized = countryCode.toUpperCase();
  return (countryToCurrency as Record<string, string | undefined>)[normalized] ?? "USD";
}
