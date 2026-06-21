# TODO — NULLNODE

## En cours
- [ ] Validation visuelle par Chris (le render motion se juge à l'œil)

## Réseau — rendez-vous
- [x] Relai self-host aveugle (WebSocket) : présence + acheminement blob opaque
- [x] Connexion ami-à-ami auto via le relai (bouton CALL, clé déjà connue)
- [x] Présence temps réel (online/offline) dans le roster
- [ ] **Valider à la main le flux CALL complet (2 fenêtres)** ← prochaine action
- [ ] Fallback dead-drop si relai down (UI : basculer vers ConnectPanel)
- [ ] Statut `away` (inactivité) en plus de online/offline
- [ ] SAS / vérification de fingerprint guidée pour le badge 🛡
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
