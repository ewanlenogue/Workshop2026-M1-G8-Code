# Backend Sentinel-X

Backend HTTP du boitier Sentinel-X. Il recoit les donnees de la tourelle
ESP8266, enregistre les evenements utiles en MySQL et expose les mouvements
pour le traitement IA.

## Technologies

- Node.js
- Express
- MySQL
- `mysql2`
- `dotenv`

## Installation

Depuis le dossier `backend` :

```bash
npm install
```

Configurer les variables de connexion dans `.env` :

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=sentinel_x
```

Executer les migrations :

```bash
npm run migrate
```

Demarrer le serveur :

```bash
npm start
```

Pour le developpement :

```bash
npm run dev
```

Le serveur est disponible par defaut sur `http://localhost:3000`.

## API

Toutes les routes utilisent `Content-Type: application/json`.

### Recevoir la telemetrie

```http
POST /api/v1/temetrie
```

Requete :

```json
{
  "device_id": "tourelle-esp8266",
  "temperature": 23.5,
  "humidity": 52.0,
  "air_raw": 310,
  "air_level": "Normal",
  "rssi": -68,
  "uptime_s": 345
}
```

La reponse `201` contient l'identifiant cree :

```json
{
  "message": "Telemetrie enregistree",
  "id": 1
}
```

Les donnees sont stockees dans `telemetry`.

### Enregistrer un mouvement

```http
POST /api/v1/mouvement
```

Requete :

```json
{
  "device_id": "tourelle-esp8266",
  "motion": true,
  "timestamp": 1775560800
}
```

Le champ `timestamp` est un timestamp Unix fourni par le capteur. Les
evenements sont stockes dans `movements`.

### Lire les mouvements pour l'IA

```http
GET /api/v1/mouvement
```

Filtres optionnels :

```http
GET /api/v1/mouvement?device_id=tourelle-esp8266&from=1775560000&to=1775560800&limit=50
```

- `device_id` : filtre par appareil ;
- `from` et `to` : bornes de timestamp Unix ;
- `limit` : entre `1` et `1000`, `100` par defaut.

La reponse est triee du mouvement le plus recent au plus ancien.

### Enregistrer une empreinte

```http
POST /api/v1/empreinte
```

Requete :

```json
{
  "device_id": "tourelle-esp8266",
  "fingerprint_id": 1
}
```

`fingerprint_id` peut etre un entier positif, `null` ou une chaine vide.
L'identifiant est reconnu s'il existe dans `fingerprint_registry`. Sinon,
la reponse contient `intrus: true`.

Les lectures sont stockees dans `fingerprint_events`.

### Retourner le nombre de personnes

```http
POST /api/v1/personnes
```

Requete :

```json
{
  "nombrePersonne": 2
}
```

Reponse :

```json
{
  "nombrePersonne": 2
}
```

Cette route ne persiste pas le resultat en base.

## Base de donnees

Tables conservees :

- `telemetry` : mesures de temperature, humidite, qualite de l'air, RSSI et
  duree de fonctionnement ;
- `movements` : evenements de mouvement et timestamp du capteur ;
- `fingerprint_events` : historique des lectures d'empreintes ;
- `fingerprint_registry` : liste minimale des identifiants d'empreintes
  autorises ;
- `migrations` : suivi des migrations appliquees.

Les anciennes tables `sensors`, `fingerprints`, `commands` et `users` sont
retirees par les migrations de nettoyage et ne doivent plus etre utilisees.

## Documentation Swagger / OpenAPI

La specification est disponible dans `openapi.yaml`. Elle peut etre ouverte
avec Swagger Editor ou importee dans Swagger UI.

Exemple avec Docker :

```bash
docker run --rm -p 8080:8080 \
  -e SWAGGER_JSON=/tmp/openapi.yaml \
  -v "$PWD/openapi.yaml:/tmp/openapi.yaml" \
  swaggerapi/swagger-ui
```

La documentation sera disponible sur `http://localhost:8080`.

URL Swagger UI :

```text
http://localhost:8080
```

La specification OpenAPI brute est disponible dans :

```text
backend/openapi.yaml
```
