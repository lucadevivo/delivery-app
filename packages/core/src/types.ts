// Modello di dominio condiviso tra backend e app mobile.
// Separa tre concetti che nella prima webapp erano fusi:
//   1. il TIPO DI CONTRATTO/rapporto col committente
//   2. lo SCHEMA DI PAGA (come si calcola il lordo da un turno)
//   3. lo SCHEMA FISCALE (come si calcolano tasse/contributi sul lordo)

export type IsoDate = string // "YYYY-MM-DD"

export type TipoContratto =
  | "contanti" // pagamento in contanti / non tassato ("a nero")
  | "prestazione_occasionale" // ritenuta d'acconto 20%, soglia INPS 5.000 €
  | "co_co_co" // collaborazione coordinata e continuativa
  | "partita_iva_forfettario"
  | "partita_iva_ordinario"
  | "subordinato" // dipendente: trattenute a carico del datore

// ---- Schema di paga: come nasce il lordo di un turno ----

export interface SogliaQuest {
  consegneMin: number // consegne necessarie per sbloccare il bonus
  bonus: number // € extra una tantum al raggiungimento
}

export interface SchemaPaga {
  oraria?: number // € per ora lavorata
  aTurno?: number // € fisso per turno
  aConsegna?: number // € per consegna
  aKm?: number // € per km percorso
  moltiplicatoreWeekend?: number // es. 1.2 = +20% sulla paga (no mance), sab/dom
  moltiplicatoreFestivo?: number // es. 1.5, applicato se il turno è marcato festivo
  quest?: SogliaQuest[] // bonus a soglie di consegne (stile Glovo/Deliveroo)
  minimoGarantito?: number // se la paga calcolata è sotto, viene integrata al minimo
}

// ---- Schema fiscale: unione discriminata per tipo ----
// NB: l'IRPEF reale è annuale e progressiva. Per turno il motore produce una
// STIMA/accantonamento, così il rider mette da parte il giusto e riconcilia poi.

export interface FiscaleContanti {
  tipo: "contanti"
}

export interface FiscaleRitenuta {
  tipo: "prestazione_occasionale" | "co_co_co"
  aliquotaRitenuta: number // es. 0.20
  // INPS gestione separata: si applica solo sull'eccedenza oltre la soglia annua.
  sogliaContributiAnnua?: number // es. 5000 (prestazione occasionale)
  contributiPerc?: number // quota a carico del lavoratore sull'eccedenza
}

export interface FiscaleForfettario {
  tipo: "partita_iva_forfettario"
  coefficienteRedditivita: number // es. 0.67 (servizi) → imponibile = lordo × coeff
  impostaSostitutiva: number // 0.05 (startup primi 5 anni) | 0.15
  contributiPerc: number // INPS gestione separata su imponibile, es. 0.2607
}

export interface FiscaleOrdinario {
  tipo: "partita_iva_ordinario"
  aliquotaStimata: number // IRPEF effettiva stimata (accantonamento)
  contributiPerc: number
}

export interface FiscaleSubordinato {
  tipo: "subordinato"
  aliquotaStimata: number // trattenute effettive stimate sul lordo
}

export type SchemaFiscale =
  | FiscaleContanti
  | FiscaleRitenuta
  | FiscaleForfettario
  | FiscaleOrdinario
  | FiscaleSubordinato

// ---- Contratto: lega uno schema paga a uno schema fiscale ----

export interface Contratto {
  id: string
  nome: string // es. "Glovo", "Desy Pizza", "AppetEat"
  tipo: TipoContratto
  paese: "IT" // progettato per nazione; al lancio solo Italia
  paga: SchemaPaga
  fiscale: SchemaFiscale
  colore?: string
}

// ---- Turno: gli input grezzi di una sessione di lavoro ----

export interface Turno {
  data: IsoDate
  ore?: number // ore lavorate
  consegne?: number
  km?: number
  mance?: number // contanti, fuori dal lordo tassabile
  festivo?: boolean // attiva il moltiplicatore festivo
}

// Contesto annuale opzionale: serve a calcolare i contributi marginali sopra soglia.
export interface ContestoAnnuale {
  imponibileAnnuoPrecedente?: number // imponibile già maturato nell'anno prima di questo turno
}

// ---- Risultato del calcolo ----

export interface RisultatoCalcolo {
  lordo: number // paga prima delle tasse (mance escluse)
  imponibile: number // base imponibile usata per il calcolo fiscale
  ritenuta: number // ritenuta d'acconto (occasionale / co.co.co)
  imposta: number // imposta sostitutiva o IRPEF stimata
  contributi: number // contributi previdenziali (INPS)
  totaleTrattenute: number // ritenuta + imposta + contributi
  netto: number // lordo − totaleTrattenute
  mance: number // mance in contanti
  totale: number // netto + mance (quanto entra davvero in tasca)
}
