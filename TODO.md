# TODO — NULLNODE

> Backlog structuré pour **délégation à des sous-agents** (Opus cloud). Chaque tâche est
> autonome : contexte + fichiers + contrat + interdits. Lire `STATE.md`, `ARCHITECTURE.md`,
> `RENDEZVOUS-PROTOCOL.md` avant. Règle E2E : un sous-agent **produit**, ne valide pas
> (pas de navigateur/Playwright/serveur lancé) — la validation E2E revient au parent.
> Standards stricts : fichier ≤500 l, fonction ≤35 l, ligne ≤120, zéro `any`, `as` commenté,
> try/catch+log sur tout I/O, runtime Bun, noms kebab-case. `bunx tsc --noEmit` doit passer.

## État au 2026-06-21
App fonctionnelle : scène WebGL liquide, identité seed BIP39 portable (PSEUDO#disc),
relai aveugle + store-and-forward, demandes d'amis consenties, messagerie P2P chiffrée
avec historique persistant + non-lus + boot réel. **Mono-session WebRTC** (1 conversation
active à la fois). Relai sur :8791 (8787 squatté). Dev app :5180.

---

## P0 — À VALIDER À LA MAIN (parent + Chris, pas délégable)
- [ ] Flux 2 fenêtres bout-en-bout : 2 identités (1 en navigation privée) → demande d'ami →
      accept → 💬 → messages temps réel → refresh → historique persiste → vrais handles affichés.
- [ ] Vérifier que la connexion entrante ne force PLUS l'ouverture du chat côté récepteur
      (doit voir « X connected — open », pas un basculement auto).
- [ ] Restore : noter sa seed (RECOVERY PHRASE), RESTORE sur une autre instance → même identité.

---

## P1 — BACKUP DONNÉES ZERO-KNOWLEDGE — ✅ CORE LIVRÉ (2026-06-21)
Objectif : retrouver roster + historique sur un nouvel appareil via la seed, sans que le
relai puisse lire quoi que ce soit. Couvre le cas « seul connecté → nouvel appareil 3j après ».

- [x] **Crypto backup** (`src/backup/backup-crypto.ts`) : clé dérivée seed BIP39
      (`crypto_generichash` salé `nullnode-backup-v1`), `crypto_secretbox_easy`. seal/open.
- [x] **Endpoint relai backup** (`relay/src/backup-store.ts` + protocol/server) :
      `backup_put`/`backup_get`/`backup`, JSON `relay/data/backups.json` (1 blob/adresse). Opaque.
- [x] **Client backup** (`backup-sync.ts` + câblage `useRendezvous` + `BackupPanel`) : pull au
      login (merge convergent → reload si neuf), push debouncé 2s, EXPORT/IMPORT FILE (.ncb).
- [ ] **À VALIDER MAIN (P0)** : noter seed → autre navigateur → RESTORE seed → données récupérées.
- [ ] **Roster/history par-compte** (RESTE — dette multi-compte) : aujourd'hui localStorage global.
      À l'import d'une AUTRE seed dans le même navigateur, charger le roster/history de CE compte
      (préfixer les clés localStorage par l'adresse). Pas requis pour le mono-compte/nouvel appareil
      (déjà couvert), mais bloquant pour plusieurs comptes sur le même navigateur.

## P1 — MESSAGES ASYNCHRONES (recevoir pendant absence)
- [ ] Router les messages chiffrés via le **store-and-forward existant** (envelope kind:'dm')
      quand le DataChannel n'est pas ouvert. DataChannel reste prioritaire si les 2 sont online.
      Hook : étendre `social-envelope.ts` (nouveau kind) + traitement dans `use-rendezvous.ts`
      (appliquer un dm entrant à l'historique via la session). Délivrance offline déjà gérée par
      le relai (flush au hello).

## P1 — MULTI-CONVERSATION SIMULTANÉE
- [ ] Aujourd'hui mono-session : une seule connexion WebRTC active (`use-secure-session`).
      Refactor pour N PeerLink simultanés (Map<peerAddress, PeerLink/SessionKeys>), afin d'avoir
      plusieurs conversations ouvertes en parallèle. Gros refactor de `use-secure-session.ts`.
      Préalable propre avant l'UI nodes (sinon ouvrir une conv coupe l'autre).

---

## P2 — UI INTÉGRÉE AUX NODES (vision long terme, gros chantier dédié)
Remplacer les cartes par une UX où tout vit dans le graphe WebGL. Les cartes restent pour
le test jusqu'à ce que ce soit prêt.
- [ ] **Raycasting fiable** (LE point dur, signalé par Chris) : détection souris des nodes
      robuste (hitboxes généreuses, `raycaster.params.Points.threshold`, ou meshes invisibles
      d'interaction par-dessus les points). À soigner fortement, sinon hover/clic foireux.
- [ ] Hover node → label flottant (Messagerie, Historique, Notifications, Demandes d'amis,
      Profil, Paramètres). Chaque node = une section.
- [ ] Clic node → ouvre la section correspondante (panneau repliable ou overlay immersif,
      PAS de bureau à fenêtres — intégré au design).
- [ ] Section Messagerie depuis le node : dernières conversations triées, ouverture in-graph.
- [ ] Tri personnalisable des conversations par l'utilisateur (épingler, ordre manuel).
- [ ] Badges non-lus / notifications visibles directement sur les nodes (pulse, compteur).

## P2 — SÉCURITÉ & ROBUSTESSE
- [ ] Chiffrer la seed au repos (passphrase → `crypto_pwhash`) ; aujourd'hui en clair localStorage.
- [ ] SAS / vérification de fingerprint guidée (réintroduire un badge « verified » qui a du sens).
- [ ] TTL / purge des envelopes non-ackées côté relai (croissance non bornée, signalé par l'agent).
- [ ] Fallback dead-drop si relai down (UI : exposer ConnectPanel quand RELAY DOWN).
- [ ] STUN optionnel pour le WAN (aujourd'hui LAN/localhost only). Garder LAN par défaut.
- [ ] Statut `away` (inactivité) en plus de online/offline.

## P3 — PACKAGING & POLISH
- [ ] Packaging Electron (rendu WebGL desktop cohérent ; aujourd'hui web Vite).
- [ ] Réglages visuels : densité particules, intensité grain/aberration, thème accent alt (ambre).
- [ ] start.sh racine qui lance relai + app ensemble.

---

## Done (réf.)
- [x] Scène WebGL liquide (shader fresnel + particules + paquets + post-process)
- [x] Identité persistante + adresse NULLNODE + callsign
- [x] Seed phrase BIP39 portable (reveal + restore), validé E2E
- [x] Handle PSEUDO#discriminant (dérivé clé), pseudo éditable
- [x] Relai aveugle (présence + signaling) + store-and-forward, validé E2E
- [x] Demandes d'amis consenties (request/accept/decline) + réciprocité
- [x] Messagerie P2P chiffrée : historique persistant, vrais handles, non-lus, notif entrante
- [x] Boot réel piloté par les vrais sous-systèmes
