# ARCHITECTURE — NULLNODE

App de communication P2P chiffrée end-to-end, design-first. Aucun serveur de signaling,
aucun relais externe : l'échange initial passe par **dead-drop** (codes SDP copiés/collés).
Souverain par construction.

## Carte des domaines (`src/`)

Organisation par domaine métier (screaming architecture), pas par couche technique.

| Domaine | Responsabilité unique | Frontière publique |
|---|---|---|
| `crypto/` | Primitives : keypair X25519 + chiffrement ChaCha20-Poly1305. Les clés ne quittent jamais la mémoire. | `generateIdentity`, `deriveSession`, `seal`, `open` |
| `identity/` | Identité réseau **persistante** + adresse NULLNODE + callsign. S'appuie sur `crypto`. | `useIdentity`, `encodeAddress`, `decodeAddress`, `callsign`, `IdentityCard` |
| `roster/` | Carnet d'amis local (CRUD + persistance + présence + confiance). Aucun annuaire central. | `useRoster`, `NetworkPanel` |
| `transport/` | Lien WebRTC P2P + encodage des dead-drops SDP. Aucune logique crypto. | `PeerLink`, `encodeDrop`, `decodeDrop` |
| `session/` | Orchestration : relie identité, transport et chiffrement en une session vivante (phase, messages). | `useSecureSession` |
| `visualizer/` | Scène WebGL (r3f) du réseau de pairs. Lecture seule de la phase, aucune logique métier. | `NetworkScene` |
| `boot/` | Séquence d'initialisation terminal (overlay d'intro). | `BootSequence` |
| `hud/` | Bandeaux de données techniques (fingerprints, statut, cipher). Présentation pure. | `HudOverlay` |
| `comms/` | Console interactive : échange dead-drop puis flux de messages chiffrés. | `CommsConsole` |
| `shared/` | Types transverses + design system (tokens CSS). Uniquement ce qui est réellement partagé. | `types.ts`, `design/tokens.css` |

## Définitions anti-recouvrement

- **transport** = tuyau (WebRTC, SDP). Ne chiffre rien, ne connaît pas le contenu.
- **crypto** = serrure (clés, scellage). Ne connaît pas le réseau.
- **session** = le seul domaine autorisé à composer crypto + transport. Point d'entrée unique de l'UI.
- **visualizer / hud / comms** = présentation. Consomment `useSecureSession`, ne touchent ni au réseau ni aux clés directement.

## Règles de frontière

- L'UI ne parle jamais à `transport` ou `crypto` en direct → toujours via `session/useSecureSession`.
- `visualizer` et `hud` reçoivent la `phase` en lecture seule. Pas d'effet de bord.
- Un import vers l'interne d'un domaine (hors interface publique listée) = red flag.

## Choix techniques structurants

- **Electron** retenu (vs Tauri) : WebGL central → besoin du moteur Chromium cohérent. (Desktop packaging = étape ultérieure ; dev en web Vite.)
- **Pas de STUN/TURN** par défaut : candidats hôte/LAN uniquement, souveraineté. STUN optionnel pour le WAN (dette notée).
- **Dead-drop manuel** : zéro infra de signaling.
