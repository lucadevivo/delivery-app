import { and, eq, like, lt, ne } from "drizzle-orm"
import {
  calcolaTurno,
  type Contratto,
  type RisultatoCalcolo,
  type Turno,
} from "@rider/core"
import { type ContrattoRow, turni } from "@rider/db"
import { db } from "./db"

// Ricostruisce un Contratto di dominio dalla riga DB (paese è "IT" al lancio).
function toContratto(row: ContrattoRow): Contratto {
  return {
    id: row.id,
    nome: row.nome,
    tipo: row.tipo,
    paese: "IT",
    paga: row.paga,
    fiscale: row.fiscale,
    colore: row.colore ?? undefined,
  }
}

// Somma l'imponibile già maturato nell'anno per quel contratto, PRIMA di questa
// data: serve al motore per i contributi che scattano solo sopra soglia annua.
async function imponibileAnnuoPrecedente(
  userId: string,
  contrattoId: string,
  data: string,
  escludiTurnoId?: string,
): Promise<number> {
  const anno = data.slice(0, 4)
  const conds = [
    eq(turni.userId, userId),
    eq(turni.contrattoId, contrattoId),
    like(turni.data, `${anno}-%`),
    lt(turni.data, data),
  ]
  if (escludiTurnoId) conds.push(ne(turni.id, escludiTurnoId))

  const rows = await db
    .select({ risultato: turni.risultato })
    .from(turni)
    .where(and(...conds))

  return rows.reduce((tot, r) => tot + (r.risultato?.imponibile ?? 0), 0)
}

// Calcola il risultato di un turno usando il motore condiviso @rider/core.
export async function calcolaRisultato(
  userId: string,
  contrattoRow: ContrattoRow,
  turno: Turno,
  escludiTurnoId?: string,
): Promise<RisultatoCalcolo> {
  const ctx = {
    imponibileAnnuoPrecedente: await imponibileAnnuoPrecedente(
      userId,
      contrattoRow.id,
      turno.data,
      escludiTurnoId,
    ),
  }
  return calcolaTurno(toContratto(contrattoRow), turno, ctx)
}
