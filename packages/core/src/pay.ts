import type { SchemaPaga, Turno } from "./types.js"
import { arrotonda } from "./money.js"

// True se la data ISO cade di sabato o domenica.
export function isWeekend(data: string): boolean {
  const g = new Date(data + "T00:00:00").getDay() // 0 dom ... 6 sab
  return g === 0 || g === 6
}

// Calcola il LORDO di un turno (mance escluse) a partire dallo schema di paga.
// Ordine: base componibile → moltiplicatore festivo/weekend → bonus quest →
//         integrazione al minimo garantito.
export function calcolaLordo(paga: SchemaPaga, turno: Turno): number {
  const ore = turno.ore ?? 0
  const consegne = turno.consegne ?? 0
  const km = turno.km ?? 0

  const base =
    (paga.oraria ?? 0) * ore +
    (paga.aTurno ?? 0) +
    (paga.aConsegna ?? 0) * consegne +
    (paga.aKm ?? 0) * km

  // Un solo moltiplicatore alla volta: il festivo ha priorità sul weekend.
  let moltiplicatore = 1
  if (turno.festivo && paga.moltiplicatoreFestivo) {
    moltiplicatore = paga.moltiplicatoreFestivo
  } else if (isWeekend(turno.data) && paga.moltiplicatoreWeekend) {
    moltiplicatore = paga.moltiplicatoreWeekend
  }

  // I bonus quest sono importi piatti, aggiunti dopo il moltiplicatore.
  const bonusQuest = (paga.quest ?? [])
    .filter((q) => consegne >= q.consegneMin)
    .reduce((tot, q) => tot + q.bonus, 0)

  let lordo = base * moltiplicatore + bonusQuest

  if (paga.minimoGarantito != null && lordo < paga.minimoGarantito) {
    lordo = paga.minimoGarantito
  }

  return arrotonda(lordo)
}
