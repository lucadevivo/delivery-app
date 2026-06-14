import type {
  Contratto,
  ContestoAnnuale,
  RisultatoCalcolo,
  Turno,
} from "./types.js"
import { calcolaLordo } from "./pay.js"
import { calcolaTrattenute } from "./tax.js"
import { arrotonda } from "./money.js"

// Orchestratore: dato un turno + il suo contratto (schema paga + schema fiscale)
// produce il risultato completo. È IL punto unico riusato da backend e app mobile.
export function calcolaTurno(
  contratto: Contratto,
  turno: Turno,
  ctx: ContestoAnnuale = {},
): RisultatoCalcolo {
  const lordo = calcolaLordo(contratto.paga, turno)
  const t = calcolaTrattenute(contratto.fiscale, lordo, ctx)

  const totaleTrattenute = arrotonda(t.ritenuta + t.imposta + t.contributi)
  const netto = arrotonda(lordo - totaleTrattenute)
  const mance = arrotonda(turno.mance ?? 0)

  return {
    lordo,
    imponibile: t.imponibile,
    ritenuta: t.ritenuta,
    imposta: t.imposta,
    contributi: t.contributi,
    totaleTrattenute,
    netto,
    mance,
    totale: arrotonda(netto + mance),
  }
}
