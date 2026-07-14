// Moedas que a Stripe trata como "zero-decimal" (o valor inteiro já é a
// unidade cobrada, sem multiplicar/dividir por 100).
// https://docs.stripe.com/currencies#zero-decimal
export const ZERO_DECIMAL_CURRENCIES = new Set([
  "BIF",
  "CLP",
  "DJF",
  "GNF",
  "JPY",
  "KMF",
  "KRW",
  "MGA",
  "PYG",
  "RWF",
  "UGX",
  "VND",
  "VUV",
  "XAF",
  "XOF",
  "XPF",
]);
