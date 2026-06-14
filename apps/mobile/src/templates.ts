import {
  forfettario,
  prestazioneOccasionale,
  type SchemaFiscale,
  type SchemaPaga,
  type TipoContratto,
  FISCALE_CONTANTI,
} from "@rider/core"

// Template di partenza per l'onboarding: il rider sceglie il più vicino alla sua
// situazione e poi personalizza. Valori di esempio, tutti modificabili.
export interface Template {
  id: string
  nome: string
  descrizione: string
  tipo: TipoContratto
  paga: SchemaPaga
  fiscale: SchemaFiscale
  colore: string
}

export const TEMPLATES: Template[] = [
  {
    id: "glovo",
    nome: "Glovo / a consegna",
    descrizione: "Pagamento a consegna, con bonus a soglie. P.IVA forfettaria.",
    tipo: "partita_iva_forfettario",
    paga: {
      aConsegna: 4,
      quest: [{ consegneMin: 20, bonus: 10 }],
    },
    fiscale: forfettario({ coefficienteRedditivita: 0.67, startup: true }),
    colore: "#FFC244",
  },
  {
    id: "deliveroo",
    nome: "Deliveroo / a consegna + km",
    descrizione: "A consegna più una quota a km. P.IVA forfettaria.",
    tipo: "partita_iva_forfettario",
    paga: { aConsegna: 3, aKm: 0.4 },
    fiscale: forfettario({ coefficienteRedditivita: 0.67 }),
    colore: "#00CCBC",
  },
  {
    id: "occasionale",
    nome: "Prestazione occasionale",
    descrizione: "Fisso a turno + a consegna, ritenuta d'acconto 20%.",
    tipo: "prestazione_occasionale",
    paga: { aTurno: 25, aConsegna: 2 },
    fiscale: prestazioneOccasionale(),
    colore: "#7C5CFF",
  },
  {
    id: "oraria",
    nome: "Paga oraria",
    descrizione: "Compenso a ora, con maggiorazione weekend. Forfettario.",
    tipo: "partita_iva_forfettario",
    paga: { oraria: 8, moltiplicatoreWeekend: 1.2 },
    fiscale: forfettario({ coefficienteRedditivita: 0.67 }),
    colore: "#34C759",
  },
  {
    id: "contanti",
    nome: "Contanti / a nero",
    descrizione: "Pizzeria o locale che paga in contanti. Nessuna trattenuta.",
    tipo: "contanti",
    paga: { aTurno: 25, aConsegna: 1 },
    fiscale: FISCALE_CONTANTI,
    colore: "#FF6B6B",
  },
]
