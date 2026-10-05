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
