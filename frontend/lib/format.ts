import { ZERO_DECIMAL_CURRENCIES } from "./currency/zeroDecimal";

// `amountInMinorUnits` é a unidade mínima cobrável da moeda: centavos para a
// maioria (USD, BRL, MXN...), o valor inteiro puro para moedas "zero-decimal"
// (CLP, JPY, KRW...) — ver lib/currency/zeroDecimal.ts.
export function formatPrice(amountInMinorUnits: number, currency: string) {
  const isZeroDecimal = ZERO_DECIMAL_CURRENCIES.has(currency);
  const value = isZeroDecimal ? amountInMinorUnits : amountInMinorUnits / 100;
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency,
    maximumFractionDigits: isZeroDecimal ? 0 : 2,
  }).format(value);
}
