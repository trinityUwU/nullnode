# STATE — NULLNODE

## Quoi
App desktop de communication P2P chiffrée E2E, esthétique « station de contrôle » (réf. terminal-industries.com).
Priorité design. Souverain : aucun serveur de signaling, aucun relais. Échange via dead-drop SDP.

## Modèle réseau (décidé 2026-06-21)
« Nouveau réseau » P2P souverain. Rendez-vous choisi : **relai self-host aveugle + fallback dead-drop**
(le relai ne voit que clés publiques + blobs chiffrés, jamais les messages). Briques :
- **Identité persistante** = keypair X25519 stable, stockée localement → c'est ton adresse.
- **Adresse NULLNODE** = `null:` + base64url(pubkey). Callsign 3-mots dérivé pour reconnaissance humaine.
- **Roster local** = carnet d'amis (pubkey + alias + présence + verified). Aucun annuaire central.
- **Trust** = vérif fingerprint manuelle → badge 🛡 (anti-MITM).
- Présence + reconnect auto = à brancher avec le relai (prochaine étape).

## État actuel (2026-06-21)
**v1 vitrine + socle réseau + rendez-vous — livré.**
- ✅ Scène WebGL refondue : data-sphere à shader (fresnel + flux noise, rendu « liquide »),
  3 couches de particules, connexions courbes + paquets animés, bloom/aberration/vignette/grain
- ✅ Identité persistante + adresse NULLNODE + callsign (`identity/`)
- ✅ Roster d'amis local : add / list / verify / remove + présence, persistant (`roster/`)
- ✅ **Relai de rendez-vous aveugle** (`relay/`, Bun WS, port 8791) : présence + acheminement
  de blobs opaques (`crypto_box_seal`). Validé E2E (2 clients, routing + PEER_OFFLINE).
- ✅ **Client rendez-vous** (`src/rendezvous/`) : sealed-signal (validé E2E : confidentialité +
  tiers bloqué) + RendezvousClient (WS, heartbeat, reconnexion) + `useRendezvous` (présence,
  connexion auto ami-à-ami via bouton CALL).
- ✅ Panneau réseau : statut RELAY UP/DOWN, présence temps réel, bouton CALL par ami online.

## Lancer le réseau complet
1. Relai : `cd relay && ./start.sh` (ws://127.0.0.1:8791). **Note : 8787 squatté sur la machine → défaut 8791.**
2. App : `./start.sh` (5180). Override possible via `VITE_RELAY_URL`.

## Validé E2E (par le parent)
- Relai : registre, welcome, signal routing (from correct, payload opaque intact), PEER_OFFLINE.
- Sealed-signal : round-trip offer, payload ≠ plaintext, tiers ne peut pas déchiffrer.
- UI : RELAY UP affiché, identité persistée, zéro erreur console.

## NON validé automatiquement (à tester à la main)
Flux **CALL complet ami-à-ami** (offer→answer→DataChannel→secure) : nécessite 2 fenêtres
navigateur avec 2 identités distinctes, qui s'ajoutent mutuellement, puis CALL. WebRTC DataChannel
ne se teste pas headless. Sans STUN → LAN/localhost uniquement (WAN = TODO).

- ✅ Stack : Vite + React + TS + Tailwind v4 + r3f/drei/postprocessing + GSAP/Framer Motion + libsodium
- ✅ Scène WebGL réseau (core wireframe, nodes pulsants, tunnels, bloom phosphore), phase-aware
- ✅ Boot sequence terminal (overlay d'intro)
- ✅ HUD (fingerprints, statut, cipher, clock)
- ✅ Crypto E2E réelle : identité X25519, session KX, ChaCha20-Poly1305 (seal/open)
- ✅ Transport WebRTC P2P + dead-drop SDP (encode/decode codes copiables)
- ✅ Console : flux host→offer / guest→answer / host→complete, puis messagerie chiffrée
- ✅ tsc clean (exit 0), zéro erreur console/page au runtime, WebGL OK (pas de context-lost)

## Lancer
`./start.sh` → http://localhost:5180 · `./stop.sh` · `./restart.sh`

## Tester le P2P (2 onglets)
1. Onglet A : OPEN SECURE CHANNEL → copier l'OFFER.
2. Onglet B : coller l'OFFER → ACCEPT & ANSWER → copier l'ANSWER.
3. Onglet A : coller l'ANSWER → ESTABLISH LINK. Canal sécurisé des deux côtés.

## Dette / prochaines étapes
- Packaging **Electron** (actuellement web Vite) — pour le rendu WebGL cohérent en desktop.
- STUN optionnel pour le WAN (aujourd'hui LAN/host candidates only).
- QR code pour le dead-drop (au lieu du copier/coller seul).
- Transfert de fichiers chiffré sur le DataChannel.
- Idle/reconnect handling (phase `lost`).
