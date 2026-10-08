# Workshop2026-M1-G8-Code
C'est un github pour stocker tout ce qu'il faut pour le workshop

## Resume du sujet

Le workshop consiste a concevoir **Sentinel-X**, un boitier autonome de surveillance pour les micro-centrales energetiques isolees d'AetherCorp. Le systeme doit detecter les risques environnementaux, les intrusions physiques et les menaces reseau, puis transmettre les alertes a un PC Serveur Local.

Le projet repose sur quatre piliers :

- **IoT** : un ESP8266 collecte les mesures du DHT22, du MQ-2 et du capteur PIR, puis pilote l'ecran OLED, les LEDs et le buzzer.
- **Developpement** : une API centralise les donnees et un dashboard affiche les mesures et les alertes en temps reel.
- **IA** : une webcam USB est analysee localement pour detecter une presence humaine, tandis qu'un modele identifie les anomalies dans les series temporelles des capteurs.
- **Infrastructure et cybersecurite** : la stack est deployee avec Docker Compose, les communications sont chiffrees et le serveur est durci puis audite par pentest.

Le prototype final doit comprendre le boitier fabrique au Fablab, le code complet, un dossier technique PDF, une presentation PowerPoint et une video verticale de 60 secondes appelee **Sentinel Drop**. La demonstration devra montrer le fonctionnement de bout en bout : ESP8266, serveur local, API, dashboard, alertes et intelligence artificielle.

## Lancer le projet (backend + dashboard)

### 1. Base de données et API

```bash
cd backend
cp .env.example .env          # renseigner DB_HOST / DB_USER / DB_PASSWORD / DB_NAME
npm install
npm run migrate               # crée les tables
npm run seed                  # (optionnel) jeu de démonstration réinjecté via la CLI mysql
npm run start                 # API sur http://localhost:3000
```

`npm run seed` exécute `backend/seed.sql` avec la CLI MySQL (`--default-character-set=utf8mb4`).
Il ne touche qu'aux données de l'appareil de démo `tourelle-esp8266` et peut donc être rejoué.

### 2. Dashboard

```bash
cd frontend
cp .env.example .env
npm install
npm run dev                   # http://localhost:5173
```

| Variable | Rôle | Défaut |
| --- | --- | --- |
| `VITE_API_URL` | base de l'API Express | `http://localhost:3000/api` |
| `VITE_CAMERA_URL` | URL du flux caméra : MJPEG (`…/stream.mjpg`, lu avec `<img>`) ou vidéo (`mp4/m3u8`, lu avec `<video>`). `vide` = panneau caméra désactivé | `http://localhost:8080/stream.mjpg` |
| `VITE_COMMANDS_API_URL` | API matérielle qui reçoit les ordres buzzer / porte | `$VITE_API_URL/v1/commandes` |

### 3. Origine des données affichées

Aucune valeur n'est écrite en dur dans le front : tout est récupéré (rafraîchi toutes les 15 s)
depuis l'API, qui interroge MySQL.

| Panneau | Endpoint | Table |
| --- | --- | --- |
| Capteurs (température, humidité, air, RSSI, uptime) + graphique | `GET /api/v1/telemetrie` | `telemetry` |
| Journal / détails d'événement | `GET /api/v1/empreinte` et `GET /api/v1/mouvement` | `fingerprint_events`, `movements` |
| Répartition des événements | les 3 endpoints ci-dessus | agrégat |
| Statut de la zone (feu + état) | `GET /api/v1/mouvement` (`motion` le plus récent) | `movements` |
| Caméra (flux live + compteur de personnes) | `VITE_CAMERA_URL` → module IA (voir §4) | — |
| Buzzer / ouverture de porte | `POST VITE_COMMANDS_API_URL` : `{"action":"buzzer_on"\|"buzzer_off"\|"open_door","action_id":"…","sent_at":"…"}` | — (à implémenter côté API matérielle) |

### 4. Module IA — flux caméra en direct dans le dashboard

```bash
cd ia
./venv/bin/python script_ia.py
```

Le module ouvre la webcam, détecte les visages (MediaPipe) et **diffuse le flux en direct**
dans le panneau « CAMÉRA (VISION IA) » du dashboard, avec le compteur de personnes.
La fenêtre OpenCV locale n'est plus nécessaire (elle reste accessible avec `IA_FENETRE=1`).
Les sorties historiques sont conservées : `nombre_personnes.json` et `captured_image.jpeg`.

| URL | Rôle |
| --- | --- |
| `http://localhost:8080/stream.mjpg` | flux MJPEG affiché par le panneau (= `VITE_CAMERA_URL`) |
| `http://localhost:8080/nombre_personnes` | `{"nombre_personne":…, "actif":…, "flux":…, "erreur":…}` → la pastille du panneau |
| `http://localhost:8080/` | aperçu du flux dans le navigateur |

**Contrôle** : `ia/arret.json` → `{"arret": 1}` démarre la caméra, `{"arret": 0}` la met en veille
(le panneau affiche alors « Caméra en veille » et le compteur repasse à 0).

**États affichés par le panneau caméra** :

| Affichage | Signification |
| --- | --- |
| image + pastille verte « N personne(s) détectée(s) » | flux reçu, détection en cours |
| « Connexion au module IA… » | serveur joignable, première image en attente |
| « Caméra en veille » | `arret.json = 0` |
| « ⚠ » + message | caméra non ouverte (permission macOS manquante) |
| « 🚫 Module IA injoignable » | `script_ia.py` non lancé — nouvelle tentative toutes les 10 s |

> **macOS** : au premier lancement, accepter « Python souhaite accéder à la caméra ».
> En cas de refus : *Réglages > Confidentialité et sécurité > Caméra* → cocher l'application
> qui lance le script (Terminal, iTerm, PyCharm…), puis relancer `script_ia.py`.
>
> Port modifiable avec `IA_PORT=9000` (penser à mettre `VITE_CAMERA_URL` à jour).
