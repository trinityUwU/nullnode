# NULLNODE — Relai de rendez-vous aveugle

Serveur WebSocket standalone (Bun) qui assure **présence** + **acheminement** d'un blob de
signaling vers le bon destinataire. **Aveugle** : il ne voit que des adresses NULLNODE et des
`payload` opaques (sealed box base64). Il ne déchiffre rien, ne stocke aucun message.

## Lancement

```bash
./start.sh   # démarre en arrière-plan, PID dans logs/relay.pid, log reset à chaque start
./stop.sh    # arrête via le PID

# ou direct (foreground)
bun run start
```

## Port

`process.env.RELAY_PORT`, défaut `8791` → `ws://127.0.0.1:8791`.

## Protocole

Voir `../RENDEZVOUS-PROTOCOL.md`. Résumé :

- CLIENT → RELAI : `hello{addr}`, `signal{to,payload}`, `ping`
- RELAI → CLIENT : `welcome{online[]}`, `presence{addr,state}`, `signal{from,payload}`, `pong`, `error{code}`

Le `payload` reste **opaque** de bout en bout : seul le destinataire (clé privée X25519)
peut ouvrir le sealed box. Le relai n'y touche jamais.

## Limite connue

Le relai voit le **graphe social** (qui signale qui) et la **présence** — métadonnées.
Acceptable pour un relai self-hosted que tu possèdes.
