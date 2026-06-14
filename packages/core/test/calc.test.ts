import { describe, expect, it } from "vitest"
import {
  calcolaLordo,
  calcolaTurno,
  forfettario,
  prestazioneOccasionale,
  type Contratto,
  FISCALE_CONTANTI,
} from "../src/index.js"

// "2026-06-13" è un sabato (weekend); "2026-06-15" è un lunedì (feriale).
const SABATO = "2026-06-13"
const LUNEDI = "2026-06-15"

function contratto(parts: Partial<Contratto>): Contratto {
  return {
    id: "c1",
    nome: "Test",
    tipo: "contanti",
    paese: "IT",
    paga: {},
    fiscale: FISCALE_CONTANTI,
    ...parts,
  }
}

describe("calcolaLordo — schema di paga componibile", () => {
  it("somma componenti a ora, a turno, a consegna, a km", () => {
    const lordo = calcolaLordo(
      { oraria: 8, aTurno: 5, aConsegna: 2, aKm: 0.5 },
      { data: LUNEDI, ore: 3, consegne: 10, km: 20 },
    )
    // 8*3 + 5 + 2*10 + 0.5*20 = 24 + 5 + 20 + 10 = 59
    expect(lordo).toBe(59)
  })

  it("applica il moltiplicatore weekend nei sabati/domeniche", () => {
    const lordo = calcolaLordo(
      { aTurno: 100, moltiplicatoreWeekend: 1.2 },
      { data: SABATO },
    )
    expect(lordo).toBe(120)
  })

  it("non applica il moltiplicatore weekend nei feriali", () => {
    const lordo = calcolaLordo(
      { aTurno: 100, moltiplicatoreWeekend: 1.2 },
      { data: LUNEDI },
    )
    expect(lordo).toBe(100)
  })

  it("il festivo ha priorità sul weekend", () => {
    const lordo = calcolaLordo(
      { aTurno: 100, moltiplicatoreWeekend: 1.2, moltiplicatoreFestivo: 1.5 },
      { data: SABATO, festivo: true },
    )
    expect(lordo).toBe(150)
  })

  it("aggiunge i bonus quest piatti dopo il moltiplicatore", () => {
    const lordo = calcolaLordo(
      {
        aConsegna: 3,
        moltiplicatoreWeekend: 2,
        quest: [
          { consegneMin: 10, bonus: 15 },
          { consegneMin: 20, bonus: 30 },
        ],
      },
      { data: SABATO, consegne: 10 },
    )
    // 3*10*2 = 60, + bonus soglia 10 (15). Soglia 20 non raggiunta. = 75
    expect(lordo).toBe(75)
  })

  it("integra al minimo garantito quando la paga è sotto", () => {
    const lordo = calcolaLordo(
      { aConsegna: 2, minimoGarantito: 40 },
      { data: LUNEDI, consegne: 5 },
    )
    expect(lordo).toBe(40) // 10 < 40 → integrato
  })
})

describe("regime contanti / a nero — nessuna trattenuta", () => {
  it("netto = lordo, mance a parte", () => {
    const c = contratto({ paga: { aTurno: 25, aConsegna: 1 } })
    const r = calcolaTurno(c, { data: LUNEDI, consegne: 10, mance: 8 })
    expect(r.lordo).toBe(35)
    expect(r.totaleTrattenute).toBe(0)
    expect(r.netto).toBe(35)
    expect(r.totale).toBe(43) // 35 + 8 mance
  })
})

describe("regime prestazione occasionale — ritenuta d'acconto 20%", () => {
  it("fisso + consegne, sotto i 5.000 € annui: solo ritenuta, niente contributi", () => {
    const c = contratto({
      tipo: "prestazione_occasionale",
      fiscale: prestazioneOccasionale(),
      paga: { aTurno: 25, aConsegna: 2 },
    })
    const r = calcolaTurno(c, { data: LUNEDI, consegne: 10, mance: 3 })
    expect(r.lordo).toBe(45)
    expect(r.ritenuta).toBe(9) // 45 * 0.20
    expect(r.contributi).toBe(0) // sotto soglia
    expect(r.netto).toBe(36)
    expect(r.totale).toBe(39)
  })
})

describe("prestazione occasionale — contributi solo sopra i 5.000 €", () => {
  it("turno interamente sotto soglia: contributi 0", () => {
    const c = contratto({
      tipo: "prestazione_occasionale",
      fiscale: prestazioneOccasionale(),
      paga: { aTurno: 100 },
    })
    const r = calcolaTurno(c, { data: LUNEDI }, { imponibileAnnuoPrecedente: 4000 })
    expect(r.contributi).toBe(0)
  })

  it("turno a cavallo della soglia: contributi solo sull'eccedenza", () => {
    const c = contratto({
      tipo: "prestazione_occasionale",
      fiscale: prestazioneOccasionale(0.2, 0.0869, 5000),
      paga: { aTurno: 400 },
    })
    // già 4800, +400 → 200 sotto soglia, 200 sopra. Contributi su 200.
    const r = calcolaTurno(c, { data: LUNEDI }, { imponibileAnnuoPrecedente: 4800 })
    expect(r.contributi).toBe(17.38) // 200 * 0.0869
  })

  it("turno interamente sopra soglia: contributi su tutto il lordo", () => {
    const c = contratto({
      tipo: "prestazione_occasionale",
      fiscale: prestazioneOccasionale(0.2, 0.0869, 5000),
      paga: { aTurno: 100 },
    })
    const r = calcolaTurno(c, { data: LUNEDI }, { imponibileAnnuoPrecedente: 6000 })
    expect(r.contributi).toBe(8.69) // 100 * 0.0869
  })
})

describe("regime forfettario", () => {
  it("imponibile = lordo × coefficiente; imposta + contributi su imponibile", () => {
    const c = contratto({
      tipo: "partita_iva_forfettario",
      fiscale: forfettario({ coefficienteRedditivita: 0.67, startup: true }),
      paga: { aTurno: 1000 },
    })
    const r = calcolaTurno(c, { data: LUNEDI })
    expect(r.imponibile).toBe(670) // 1000 * 0.67
    expect(r.imposta).toBe(33.5) // 670 * 0.05 (startup)
    expect(r.contributi).toBe(174.67) // 670 * 0.2607
    expect(r.netto).toBe(791.83) // 1000 - 33.5 - 174.67
  })
})
