# ARBORESCENCE — NULLNODE

```
src/
  main.tsx                      Point d'entrée React
  App.tsx                       Compose scène + HUD + console + boot
  index.css                     Tailwind v4 + fonts + design system global
  shared/
    types.ts                    Types transverses (phase, identité, message, node)
    design/tokens.css           Variables CSS du design system (surfaces, accent, motion)
  crypto/
    identity.ts                 Identité X25519 + fingerprint (libsodium)
    encryption.ts               Session KX + scellage ChaCha20-Poly1305 (seal/open)
  transport/
    dead-drop.ts                Encode/décode des codes SDP copiables
    peer-link.ts                Lien WebRTC P2P (signaling manuel, no STUN)
  session/
    use-secure-session.ts       Hook orchestrateur : identité + transport + crypto + messages
  visualizer/
    network-core.ts             Géométrie des nodes + couleurs accent
    NetworkScene.tsx            Scène WebGL r3f (core, tunnels, nodes, bloom)
  boot/
    boot-lines.ts               Contenu de la séquence d'init
    BootSequence.tsx            Overlay terminal d'intro
  hud/
    HudOverlay.tsx              Bandeaux data (fingerprints, statut, cipher, clock)
  comms/
    DropCode.tsx                Bloc de code dead-drop copiable
    ConnectPanel.tsx            UI d'échange host/guest des dead-drops
    MessageStream.tsx           Flux de messages chiffrés + composer
    CommsConsole.tsx            Aiguille connect ↔ stream selon la phase

start.sh / stop.sh / restart.sh  Gestion process (PID, reset log)
logs/                            Logs runtime (reset au start)
STATE.md TODO.md ARCHITECTURE.md ARBORESCENCE.md README.md
```
