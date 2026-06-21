# NULLNODE

Communication P2P chiffrée end-to-end, design-first. Esthétique « station de contrôle »
(réf. terminal-industries.com). Aucun serveur de signaling, aucun relais externe :
l'échange initial passe par **dead-drop** — des codes SDP que tu copies/colles entre pairs.
Souverain par construction.

## Stack
Vite · React + TypeScript · Tailwind v4 · react-three-fiber + drei + postprocessing (WebGL) ·
Framer Motion · libsodium (X25519 + ChaCha20-Poly1305) · WebRTC DataChannel.

## Lancer
```bash
./start.sh        # http://localhost:5180
./stop.sh
./restart.sh
```
Ou : `bun install && bun run dev`.

## Établir un canal (dead-drop, zéro serveur)
1. **Hôte** : `OPEN SECURE CHANNEL` → copie l'OFFER, envoie-la au pair (canal de ton choix).
2. **Pair** : colle l'OFFER → `ACCEPT & ANSWER` → copie l'ANSWER, renvoie-la à l'hôte.
3. **Hôte** : colle l'ANSWER → `ESTABLISH LINK`. Canal sécurisé établi.

Les messages sont chiffrés end-to-end ; les clés sont générées localement et ne quittent jamais la mémoire.

## Port
- Dev : `5180`

## Note WebGL / desktop
Le rendu WebGL cible un packaging **Electron** (moteur Chromium cohérent). Le dev tourne en web Vite.
Sans STUN par défaut : connexion LAN/host. Pour le WAN, ajouter un STUN (voir TODO).
