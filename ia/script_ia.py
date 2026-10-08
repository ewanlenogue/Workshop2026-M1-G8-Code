import json
import os
import threading
import time
import requests
import numpy as np

import cv2
import mediapipe as mp
from flask import Flask, Response, jsonify

url_get_start = os.environ.get(
    "IA_URL_MOUVEMENT",
    "http://backend:3000/api/v1/mouvement"
)

url_get_stop = os.environ.get(
    "IA_URL_EMPREINTE",
    "http://backend:3000/api/v1/empreinte"
)

url_post = os.environ.get(
    "IA_URL_PERSONNES",
    "http://backend:3000/api/v1/personnes"
)

start = False

HOST = "0.0.0.0"
PORT = int(os.environ.get("IA_PORT", "8080"))
FENETRE = os.environ.get("IA_FENETRE", "0") == "1"
CAMERA_URL = os.environ.get(
    "IA_CAMERA_URL",
    "http://10.0.3.157:8081/stream.mjpg"
)
QUALITE_JPEG = 80
AIDE_CAMERA = (
    "Caméra indisponible — autoriser Python : "
    "Réglages > Confidentialité et sécurité > Caméra"
)

# État partagé entre la boucle caméra et le serveur HTTP (même process)
ETAT = {
    "jpeg": None,
    "sequence": 0,
    "nombre_personne": 0,
    "actif": False,
    "erreur": None,
}
VERROU = threading.Lock()

app = Flask(__name__)


@app.after_request
def autoriser_cors(reponse):
    reponse.headers["Access-Control-Allow-Origin"] = "*"
    reponse.headers["Cache-Control"] = "no-store"
    return reponse


@app.route("/")
def accueil():
    return (
        "<!doctype html><html lang='fr'><head><meta charset='utf-8'>"
        "<title>Sentinel-X — caméra</title></head>"
        "<body style='margin:0;background:#05070f;color:#d6e4f0;"
        "font-family:monospace;text-align:center'>"
        "<p style='margin:8px'>Sentinel-X — flux caméra</p>"
        "<img src='/stream.mjpg' style='width:100%;display:block'>"
        "</body></html>"
    )


@app.route("/stream.mjpg")
def flux():
    return Response(
        generer_flux(),
        mimetype="multipart/x-mixed-replace; boundary=frame",
    )


@app.route("/nombre_personnes")
def nombre_personnes():
    with VERROU:
        return jsonify(
            {
                "nombre_personne": ETAT["nombre_personne"],
                "actif": ETAT["actif"],
                "flux": ETAT["jpeg"] is not None,
                "erreur": ETAT["erreur"],
            }
        )


def generer_flux():
    sequence = -1

    while True:
        with VERROU:
            jpeg = ETAT["jpeg"]
            courante = ETAT["sequence"]

        if jpeg is None:
            time.sleep(0.1)
            continue

        if courante == sequence:
            time.sleep(0.01)
            continue

        sequence = courante
        yield b"--frame\r\nContent-Type: image/jpeg\r\n\r\n" + jpeg + b"\r\n"


def serveur_web():
    # use_reloader=False : évite de relancer un 2e process avec la caméra
    app.run(host=HOST, port=PORT, threaded=True, use_reloader=False)


def lire_arret():
    global start

    response_arret = requests.get(f"{url_get_stop}?limit=1")
    response_arret.raise_for_status()

    donnees = response_arret.json()

    if donnees:
        fingerprint_id = donnees[0].get("fingerprint_id")

        if fingerprint_id is not None and fingerprint_id >= 0:
            start = False

def lire_depart():
    global start

    response = requests.get(f"{url_get_start}?limit=1")
    response.raise_for_status()

    donnees = response.json()

    if donnees:
        start = bool(donnees[0]["motion"])
    else:
        start = False
        
def publier(frame, nombre_personne):
    ok, jpeg = cv2.imencode(
        ".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, QUALITE_JPEG]
    )

    with VERROU:
        if ok:
            ETAT["jpeg"] = jpeg.tobytes()
            ETAT["sequence"] += 1
        ETAT["nombre_personne"] = nombre_personne
        ETAT["actif"] = True
        ETAT["erreur"] = None


def signaler_erreur(message):
    with VERROU:
        ETAT["erreur"] = message
        ETAT["jpeg"] = None
        ETAT["nombre_personne"] = 0
        ETAT["actif"] = True


def veille():
    with VERROU:
        ETAT["jpeg"] = None
        ETAT["nombre_personne"] = 0
        ETAT["actif"] = False
        ETAT["erreur"] = None

    with open("nombre_personnes.json", "w") as fichier:
        json.dump({"nombre_personne": 0}, fichier)
        
def lire_flux_mjpeg(url):
    response = requests.get(url, stream=True, timeout=10)
    response.raise_for_status()

    buffer = b""

    for chunk in response.iter_content(chunk_size=4096):
        if not chunk:
            continue

        buffer += chunk

        while True:
            debut = buffer.find(b"\xff\xd8")
            if debut == -1:
                break

            fin = buffer.find(b"\xff\xd9", debut + 2)
            if fin == -1:
                break

            jpeg = buffer[debut:fin + 2]
            buffer = buffer[fin + 2:]

            image = cv2.imdecode(
                np.frombuffer(jpeg, dtype=np.uint8),
                cv2.IMREAD_COLOR
            )

            if image is not None:
                yield image

def main():
    threading.Thread(target=serveur_web, daemon=True).start()
    
    print(f"Flux IA  : http://localhost:{PORT}/stream.mjpg")
    print(f"Compteur    : http://localhost:{PORT}/nombre_personnes")
    print(f"Camera source   : {CAMERA_URL}")

    flux_camera = None
    aide_affichee = False

    with mp.solutions.face_detection.FaceDetection(
        min_detection_confidence=0.5
    ) as face_detection:
        try:
            while True:
                if start:
                    flux_camera = None
                    veille()
                    time.sleep(1)
                    continue

                # Ouverture paresseuse : la caméra n'est touchée qu'en marche,
                # sinon une permission refusée tuerait le serveur du flux.
                if flux_camera is None:
                    flux_camera = lire_flux_mjpeg(CAMERA_URL)
                try:
                    frame = next(flux_camera)
                    
                except StopIteration:
                    flux_camera = None
                    signaler_erreur("Le flux caméra est terminé")
                    time.sleep(1)
                    continue
                    
                except requests.RequestException as erreur:
                    flux_camera = None
                    signaler_erreur(
                        f"Impossible d'accéder au flux caméra : {erreur}"
                    )

                    if not aide_affichee:
                        print(
                            f"Impossible d'accéder à la caméra : {erreur}",
                            flush=True
                        )
                        aide_affichee = True
                        
                    time.sleep(2)
                    continue    


                except Exception as erreur:
                    flux_camera = None
                    signaler_erreur(
                        f"Erreur inattendue lors de la lecture du flux caméra : {erreur}"
                    )
                    time.sleep(2)
                    continue

                if aide_affichee:
                    print("Caméra opérationnelle", flush=True)
                    aide_affichee = False

                frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                resultats = face_detection.process(frame_rgb)
                compte_visage = 0

                if resultats.detections:
                    for detection in resultats.detections:
                        compte_visage += 1

                        box = detection.location_data.relative_bounding_box
                        ih, iw, _ = frame.shape
                        x, y = int(box.xmin * iw), int(box.ymin * ih)
                        w, h = int(box.width * iw), int(box.height * ih)
                        cv2.rectangle(frame, (x, y), (x + w, y + h), (225, 0, 0), 4)

                # Une seule personne reconnue -> cliché pour l'IA / les preuves
                if compte_visage == 1:
                    cv2.imwrite("captured_image.jpeg", frame)

                donnees = {"nombrePersonne": compte_visage}

                envoi = requests.post(
                    url_post,
                    json=donnees
                )
                envoi.raise_for_status()

                # Diffusion du flux vers le dashboard
                publier(frame, compte_visage)

                if FENETRE:
                    cv2.imshow("cam", frame)
                    if cv2.waitKey(1) & 0xFF == ord("q"):
                        break
                lire_depart()
                lire_arret()
        finally:
            flux_camera = None
                
            if FENETRE:
                cv2.destroyAllWindows()
                
            veille()


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nArrêt du module IA")
