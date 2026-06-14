# @rider/mobile — app React Native (Expo)

App per il rider. Consuma le API di `@rider/api` e riusa il motore di calcolo
condiviso `@rider/core` (anteprima live del turno con lo stesso codice del backend).

Schermate: accesso/registrazione, dashboard del mese, lista turni, nuovo turno
(con anteprima netto/totale), contratti, nuovo contratto da **template**
(Glovo, Deliveroo, prestazione occasionale, paga oraria, contanti), profilo
(logout, export/cancellazione dati GDPR).

## Provarla sul telefono (Expo Go)

1. Installa **Expo Go** dallo store sul telefono.
2. Avvia il backend e rendilo raggiungibile dal telefono:
   - stesso Wi-Fi → usa l'IP LAN del computer (es. `http://192.168.1.20:4000`)
   - rete diversa → esponilo con un tunnel (es. `cloudflared tunnel --url http://localhost:4000`)
3. Punta l'app al backend (URL del passo 2):
   ```bash
   export EXPO_PUBLIC_API_URL=http://192.168.1.20:4000
   ```
   (oppure modifica `extra.apiUrl` in `app.json`)
4. Avvia Metro e inquadra il QR con Expo Go:
   ```bash
   pnpm --filter @rider/core build      # il motore condiviso dev'essere compilato
   pnpm --filter @rider/mobile start     # aggiungi --tunnel se il telefono è su un'altra rete
   ```

## Note monorepo (pnpm + Metro)

Metro non gestisce i symlink isolati di pnpm: il workspace usa
`nodeLinker: hoisted` + `shamefullyHoist: true` (in `pnpm-workspace.yaml`) e
`metro.config.js` osserva la root e i `node_modules` hoistati. Verifica del
bundle senza dispositivo: `npx expo export --platform android`.
