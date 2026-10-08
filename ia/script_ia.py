import json
import os
import threading
import time
import requests

import cv2
import mediapipe as mp
from flask import Flask, Response, jsonify

url_get_start = "http://localhost:8000/api/v1/mouvement"
url_get_stop = "https://localhost:8000/api/v1/empreinte"
url_post = "http://localhost:8000/api/v1/personnes"

start = False

HOST = "0.0.0.0"
PORT = int(os.environ.get("IA_PORT", "8080"))
FENETRE = os.environ.get("IA_FENETRE", "0") == "1"
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
    response_arret = requests.get(
        url_get_stop
    )
    response_arret.raise_for_status()
    donnee_arret = response_arret.json()

    if donnee_arret["fingerprint_id"] >= 0:
        start = False

def lire_depart():
    response = requests.get(url_get_start)
    response.raise_for_status()
    donnee_depart = response.json()
    if donnee_depart["motion"] :
        start = True
    else :
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


def main():
    threading.Thread(target=serveur_web, daemon=True).start()
    print(f"Flux MJPEG  : http://localhost:{PORT}/stream.mjpg")
    print(f"Compteur    : http://localhost:{PORT}/nombre_personnes")
    print("Dashboard   : renseigner VITE_CAMERA_URL avec l'adresse ci-dessus")

    cap = None
    aide_affichee = False

    with mp.solutions.face_detection.FaceDetection(
        min_detection_confidence=0.5
    ) as face_detection:
        try:
            while True:
                if start:
                    if cap is not None:
                        cap.release()
                        cap = None
                    veille()
                    time.sleep(1)
                    continue

                # Ouverture paresseuse : la caméra n'est touchée qu'en marche,
                # sinon une permission refusée tuerait le serveur du flux.
                if cap is None or not cap.isOpened():
                    cap = cv2.VideoCapture(0)
                    if not cap.isOpened():
                        signaler_erreur(AIDE_CAMERA)
                        if not aide_affichee:
                            print(AIDE_CAMERA, flush=True)
                            aide_affichee = True
                        cap = None
                        time.sleep(2)
                        continue

                try:
                    ok, frame = cap.read()
                except cv2.error:
                    ok, frame = False, None

                if not ok or frame is None:
                    signaler_erreur(AIDE_CAMERA)
                    time.sleep(0.5)
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
            if cap is not None:
                cap.release()
            if FENETRE:
                cv2.destroyAllWindows()
            veille()


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nArrêt du module IA")
