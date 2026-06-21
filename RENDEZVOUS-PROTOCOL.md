# RENDEZVOUS PROTOCOL — NULLNODE

Le relai de rendez-vous est un **relai aveugle** : il ne voit que des **adresses NULLNODE**
(clés publiques) et des **blobs opaques scellés**. Il ne déchiffre jamais rien, ne stocke aucun
message. Son seul rôle : présence + acheminement d'un blob de signaling vers le bon destinataire.

Self-hostable. Par défaut `ws://127.0.0.1:8787`.

## Transport
WebSocket JSON. Une connexion = un opérateur. L'opérateur s'identifie par son **adresse NULLNODE**
(`null:` + base64url(pubkey)), déjà produite par `src/identity/address.ts`.

## Messages CLIENT → RELAI
```ts
{ t: 'hello', addr: string }                 // s'enregistrer (présence online)
{ t: 'signal', to: string, payload: string } // acheminer un blob opaque vers `to`
{ t: 'ping' }                                 // heartbeat (toutes les 25s)
```
À la fermeture du socket → l'opérateur passe offline.

## Messages RELAI → CLIENT
```ts
{ t: 'welcome', online: string[] }                 // adresses online à la connexion
{ t: 'presence', addr: string, state: 'online' | 'offline' }
{ t: 'signal', from: string, payload: string }     // blob opaque entrant
{ t: 'pong' }
{ t: 'error', code: string }
```
Le relai **broadcast** les changements de présence à tous les connectés (petite échelle).
Le client filtre selon son roster.

## Sémantique du `payload` (OPAQUE pour le relai)
Le payload est un **sealed box** (`crypto_box_seal`) chiffré vers la clé publique du destinataire,
contenant `JSON.stringify({ kind: 'offer' | 'answer', sdp })`. Seul le destinataire peut l'ouvrir
avec sa keypair. Le relai ne voit que du ciphertext base64.

> Conversion clé : `crypto_box_seal` attend des clés **X25519 box**. Nos identités sont des keypairs
> `crypto_kx` (déjà X25519). Réutiliser `identity.publicKey` / `identity.privateKey` directement avec
> `sodium.crypto_box_seal(msg, peerPub)` et `sodium.crypto_box_seal_open(cipher, selfPub, selfPriv)`.

## Flux de connexion auto (A initie vers l'ami X, les deux online)
1. **A** : `PeerLink.createOffer()` → scelle `{kind:'offer',sdp}` vers `X.pub` → `signal{to:X.addr, payload}`.
   A connaît `X.pub` (roster). A dérive la session : `deriveSession(idA, X.pub, true)` (initiateur).
2. **X** reçoit `signal{from:A.addr, payload}` → ouvre le sealed box → c'est une offer →
   `deriveSession(idX, pubFrom, false)` (pubFrom = `decodeAddress(from)`) → `PeerLink.acceptOffer(sdp)` →
   scelle `{kind:'answer',sdp}` vers `pubFrom` → `signal{to:from, payload}`.
3. **A** reçoit `signal` → ouvre → answer → `PeerLink.acceptAnswer(sdp)`.
4. DataChannel ouvre → phase `secure`. Messagerie E2E déjà en place (ChaCha20-Poly1305).

## Limite connue (à documenter, pas à masquer)
Le relai aveugle voit le **graphe social** (qui signale qui) et la **présence** — métadonnées.
Acceptable pour un relai self-hosted que tu possèdes ; à noter dans la doc sécurité.

## Contrat existant à réutiliser (NE PAS réécrire)
- `src/transport/peer-link.ts` : `new PeerLink(onState, onMessage)`, `createOffer()`, `acceptOffer(offer)`,
  `acceptAnswer(answer)`, `send(raw)`, `close()`.
- `src/crypto/encryption.ts` : `deriveSession(self, peerPub, initiator)`, `seal`, `open`.
- `src/identity/address.ts` : `encodeAddress(pub)`, `decodeAddress(addr)`.
- `src/identity/use-identity.ts` : `useIdentity()` → `{ identity, address, callsign }`.
- `src/roster/use-roster.ts` : `useRoster(selfId)` → `{ friends, addFriend, removeFriend, toggleVerified }`.
  Les `Friend` ont `address`, `pub` (base64 std variant), `presence`.
- `src/session/use-secure-session.ts` : `useSecureSession(identity)` (canal dead-drop manuel actuel).
