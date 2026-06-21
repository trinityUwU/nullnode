# TODO — NULLNODE

## En cours
- [ ] Validation visuelle par Chris (le render motion se juge à l'œil)

## Réseau — prochaine étape (rendez-vous)
- [ ] Relai self-host aveugle (WebSocket) : présence + échange SDP chiffré vers destinataire
- [ ] Connexion ami-à-ami auto via le relai (clé déjà connue → skip saisie, juste SDP)
- [ ] Fallback dead-drop si relai down
- [ ] Présence temps réel (online/away/offline) dans le roster
- [ ] SAS / vérification de fingerprint guidée pour le badge 🛡

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
