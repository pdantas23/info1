import countryToCurrency from "country-to-currency";

export type CountryOption = { code: string; label: string };

// Lista de países pro seletor manual (fallback quando a detecção por IP
// erra), construída a partir do próprio mapa país->moeda — sem manter uma
// lista de nomes de país à mão.
export function getCountryOptions(): CountryOption[] {
  const displayNames = new Intl.DisplayNames(["es"], { type: "region" });
  const codes = Object.keys(countryToCurrency);

  return codes
    .map((code) => ({ code, label: displayNames.of(code) ?? code }))
    .sort((a, b) => a.label.localeCompare(b.label, "es"));
}
