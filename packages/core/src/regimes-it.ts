import type { SchemaFiscale } from "./types.js"

// Preset dei regimi fiscali italiani. Sono valori di default ragionevoli al
// 2026: vanno esposti come modificabili dall'utente, non cablati come prima.

export const FISCALE_CONTANTI: SchemaFiscale = { tipo: "contanti" }

// Prestazione occasionale: ritenuta d'acconto 20% + INPS gestione separata
// solo sull'eccedenza oltre 5.000 €/anno (quota lavoratore ≈ 1/3 di ~26%).
export function prestazioneOccasionale(
  aliquotaRitenuta = 0.2,
  contributiPerc = 0.0869,
  sogliaContributiAnnua = 5000,
): SchemaFiscale {
  return {
    tipo: "prestazione_occasionale",
    aliquotaRitenuta,
    contributiPerc,
    sogliaContributiAnnua,
  }
}

// Co.co.co: trattenuta IRPEF stimata + quota contributi a carico collaboratore.
export function coCoCo(aliquotaRitenuta = 0.23, contributiPerc = 0.0889): SchemaFiscale {
  return { tipo: "co_co_co", aliquotaRitenuta, contributiPerc }
}

// Regime forfettario: coefficiente redditività × imposta sostitutiva + INPS.
// startup=true → imposta sostitutiva 5% per i primi 5 anni.
export function forfettario(opts?: {
  coefficienteRedditivita?: number
  startup?: boolean
  contributiPerc?: number
}): SchemaFiscale {
  return {
    tipo: "partita_iva_forfettario",
    coefficienteRedditivita: opts?.coefficienteRedditivita ?? 0.67,
    impostaSostitutiva: opts?.startup ? 0.05 : 0.15,
    contributiPerc: opts?.contributiPerc ?? 0.2607,
  }
}

export function partitaIvaOrdinaria(
  aliquotaStimata = 0.27,
  contributiPerc = 0.2607,
): SchemaFiscale {
  return { tipo: "partita_iva_ordinario", aliquotaStimata, contributiPerc }
}

export function subordinato(aliquotaStimata = 0.25): SchemaFiscale {
  return { tipo: "subordinato", aliquotaStimata }
}
