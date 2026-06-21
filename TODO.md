# TODO — NULLNODE

## En cours
- [ ] Validation visuelle par Chris (le render motion se juge à l'œil)

## Réseau — rendez-vous
- [x] Relai self-host aveugle : présence + acheminement blob opaque
- [x] Connexion ami-à-ami auto via le relai (icône 💬, clé déjà connue)
- [x] Présence temps réel (online/offline) dans le roster
- [x] Identité : pseudo#discriminant (dérivé clé), pseudo éditable
- [x] Friend requests consenties + store-and-forward (offline delivery)
- [ ] **Valider à la main : 2 fenêtres → demande d'ami → accept → chat** ← prochaine action
- [ ] Portabilité compte : seed phrase / export-import de clé (se connecter d'ailleurs)
- [ ] Fallback dead-drop si relai down (UI)
- [ ] TTL / purge des envelopes non-ackées (croissance non bornée du store, signalé par l'agent)
- [ ] Statut `away` (inactivité)
- [ ] SAS / vérification de fingerprint guidée (réintroduire le badge « verified »)
- [ ] STUN optionnel pour le WAN (aujourd'hui LAN/localhost only)

## Sécurité — dette
- [ ] Chiffrer l'identité au repos (passphrase → crypto_pwhash), aujourd'hui stockée en clair local

## Backlog (priorisé)
- [ ] Packaging Electron (rendu WebGL desktop cohérent)
- [ ] QR code pour le dead-drop SDP
- [ ] Transfert de fichiers chiffré (DataChannel)
- [ ] Reconnect / gestion phase `lost`
- [ ] STUN optionnel (toggle WAN) — garder LAN-only par défaut
- [ ] Verify de l'intégrité du handshake (affichage SAS / mot de passe vocal anti-MITM)

## Idées
- [ ] Voix P2P (WebRTC audio track) avec visualisation spectre dans la scène
- [ ] Thème accent alternatif (ambre) sélectionnable
