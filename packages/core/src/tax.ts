import type { ContestoAnnuale, SchemaFiscale } from "./types.js"
import { arrotonda } from "./money.js"

export interface Trattenute {
  imponibile: number
  ritenuta: number
  imposta: number
  contributi: number
}

// Calcola tasse e contributi (STIMA per turno) dato il lordo e lo schema fiscale.
// L'IRPEF reale è annuale/progressiva: qui produciamo un accantonamento per turno.
export function calcolaTrattenute(
  fiscale: SchemaFiscale,
  lordo: number,
  ctx: ContestoAnnuale = {},
): Trattenute {
  switch (fiscale.tipo) {
    case "contanti":
      return { imponibile: lordo, ritenuta: 0, imposta: 0, contributi: 0 }

    case "prestazione_occasionale":
    case "co_co_co": {
      const ritenuta = lordo * fiscale.aliquotaRitenuta
      let contributi = 0
      if (fiscale.contributiPerc) {
        if (fiscale.sogliaContributiAnnua != null) {
          // Contributi solo sull'eccedenza oltre la soglia annua.
          const giaMaturato = ctx.imponibileAnnuoPrecedente ?? 0
          const sopraSogliaPrima = Math.max(
            0,
            giaMaturato - fiscale.sogliaContributiAnnua,
          )
          const sopraSogliaDopo = Math.max(
            0,
            giaMaturato + lordo - fiscale.sogliaContributiAnnua,
          )
          const eccedenzaQuesto = sopraSogliaDopo - sopraSogliaPrima
          contributi = eccedenzaQuesto * fiscale.contributiPerc
        } else {
          contributi = lordo * fiscale.contributiPerc
        }
      }
      return {
        imponibile: arrotonda(lordo),
        ritenuta: arrotonda(ritenuta),
        imposta: 0,
        contributi: arrotonda(contributi),
      }
    }

    case "partita_iva_forfettario": {
      const imponibile = lordo * fiscale.coefficienteRedditivita
      const imposta = imponibile * fiscale.impostaSostitutiva
      const contributi = imponibile * fiscale.contributiPerc
      return {
        imponibile: arrotonda(imponibile),
        ritenuta: 0,
        imposta: arrotonda(imposta),
        contributi: arrotonda(contributi),
      }
    }

    case "partita_iva_ordinario": {
      const imposta = lordo * fiscale.aliquotaStimata
      const contributi = lordo * fiscale.contributiPerc
      return {
        imponibile: arrotonda(lordo),
        ritenuta: 0,
        imposta: arrotonda(imposta),
        contributi: arrotonda(contributi),
      }
    }

    case "subordinato": {
      const imposta = lordo * fiscale.aliquotaStimata
      return {
        imponibile: arrotonda(lordo),
        ritenuta: 0,
        imposta: arrotonda(imposta),
        contributi: 0,
      }
    }
  }
}
