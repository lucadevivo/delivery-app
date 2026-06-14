export function euro(n: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(n)
}

export function meseCorrente(): string {
  return new Date().toISOString().slice(0, 7) // YYYY-MM
}

export function oggi(): string {
  return new Date().toISOString().slice(0, 10) // YYYY-MM-DD
}

export function formatData(iso: string): string {
  return new Intl.DateTimeFormat("it-IT", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  }).format(new Date(iso + "T00:00:00"))
}

export function formatMese(meseISO: string): string {
  return new Intl.DateTimeFormat("it-IT", {
    month: "long",
    year: "numeric",
  }).format(new Date(meseISO + "-01T00:00:00"))
}
