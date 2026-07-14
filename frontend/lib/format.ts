import { ZERO_DECIMAL_CURRENCIES } from "./currency/zeroDecimal";

// El locale "es-ES" no tiene símbolo mapeado para casi ninguna moneda
// latinoamericana (Intl.NumberFormat cae al código ISO, ej. "50,99 BRL" en
// vez de "R$ 50,99") — forzamos acá el símbolo que de verdad se usa en cada
// país en vez de confiar en esa resolución.
const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  BRL: "R$",
  MXN: "$",
  ARS: "$",
  COP: "$",
  CLP: "$",
  UYU: "$",
  PEN: "S/",
  GTQ: "Q",
  BOB: "Bs",
  PYG: "₲",
  VES: "Bs",
  DOP: "RD$",
  CRC: "₡",
  HNL: "L",
  NIO: "C$",
  PAB: "B/.",
};

// `amountInMinorUnits` é a unidade mínima cobrável da moeda: centavos para a
// maioria (USD, BRL, MXN...), o valor inteiro puro para moedas "zero-decimal"
// (CLP, JPY, KRW...) — ver lib/currency/zeroDecimal.ts.
export function formatPrice(amountInMinorUnits: number, currency: string) {
  const isZeroDecimal = ZERO_DECIMAL_CURRENCIES.has(currency);
  const value = isZeroDecimal ? amountInMinorUnits : amountInMinorUnits / 100;
  const amount = new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: isZeroDecimal ? 0 : 2,
    maximumFractionDigits: isZeroDecimal ? 0 : 2,
  }).format(value);
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency;
  return `${symbol} ${amount}`;
}
