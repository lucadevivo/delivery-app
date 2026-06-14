// Arrotondamento ai centesimi: i calcoli intermedi restano float, ma ogni
// importo esposto va arrotondato a 2 decimali per evitare derive di precisione.
export function arrotonda(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100
}

export function formatEuro(n: number, locale = "it-IT"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
  }).format(n)
}
