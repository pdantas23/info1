import { ZERO_DECIMAL_CURRENCIES } from "./zeroDecimal";

// Arredonda pro valor mais próximo terminado em ",99" (ex: 50.99, 169.99) —
// o catálogo em dólar é sempre X.99, então preservar essa terminação mantém
// a sensação de preço psicológico muito mais perto do câmbio real do que
// cair num múltiplo redondo (ex: 50, 100).
function roundToNearestNinetyNine(value: number): number {
  return Math.round(value - 0.99) + 0.99;
}

// Equivalente pra moedas sem casas decimais (ex: JPY, KRW): arredonda pro
// inteiro mais próximo terminado em "99" (ex: 1499, 2999).
function roundToNearestNinetyNineWhole(value: number): number {
  return Math.round((value - 99) / 100) * 100 + 99;
}

// Converte um valor em centavos de USD pra unidade mínima da moeda alvo
// (inteiro puro se for zero-decimal, senão centavos), já arredondado.
export function convertUsdCentsToLocal(usdCents: number, currency: string, rate: number): number {
  // Sem conversão de fato (visitante já em USD): mantém o preço exato do
  // catálogo — o arredondamento "bonito" é só pra disfarçar um câmbio feio,
  // não pra alterar um preço psicológico (ex: $9.99) que o próprio catálogo já definiu.
  if (currency === "USD") return usdCents;

  const usdMajor = usdCents / 100;
  const localMajor = usdMajor * rate;

  if (ZERO_DECIMAL_CURRENCIES.has(currency)) {
    return Math.max(0, Math.round(roundToNearestNinetyNineWhole(localMajor)));
  }

  return Math.round(roundToNearestNinetyNine(localMajor) * 100);
}
