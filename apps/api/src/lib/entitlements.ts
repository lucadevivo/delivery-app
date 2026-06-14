// Entitlements derivati dal tier dell'utente. Al lancio tutto è gratis: "free"
// ha già accesso pieno. I flag esistono per attivare il paywall in futuro
// (trial / una tantum / premium) senza toccare il modello dati.
export interface Entitlements {
  tier: string
  contrattiIllimitati: boolean
  analiticaAvanzata: boolean
  exportDati: boolean
}

export function entitlementsFor(tier: string, trialEndsAt?: Date | null): Entitlements {
  const trialAttivo = trialEndsAt != null && trialEndsAt.getTime() > Date.now()

  // NB: al lancio nessuna funzione è bloccata (gratis per tutti). Quando si
  // introdurrà il paywall, basterà cambiare questi valori per i non-premium.
  return {
    tier: trialAttivo ? "trial" : tier,
    contrattiIllimitati: true,
    analiticaAvanzata: true,
    exportDati: true,
    // esempio futuro: analiticaAvanzata: premium,
  }
}
