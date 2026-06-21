# STATE — NULLNODE

## Quoi
App desktop de communication P2P chiffrée E2E, esthétique « station de contrôle » (réf. terminal-industries.com).
Priorité design. Souverain : aucun serveur de signaling, aucun relais. Échange via dead-drop SDP.

## État actuel (2026-06-21)
**v1 vitrine design — livrée et fonctionnelle.**

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
