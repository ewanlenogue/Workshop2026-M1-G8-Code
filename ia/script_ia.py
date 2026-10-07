import cv2
import mediapipe as mp
import mss
import json
import requests

url_get_start = "http://localhost:8000/api/v1/mouvement"
url_get_stop = "https://localhost:8000/api/v1/empreinte"
url_post = "http://localhost:8000/api/v1/personnes"

cap = cv2.VideoCapture(0)
mp_draw = mp.solutions.drawing_utils
mp_face_detection = mp.solutions.face_detection

fichier = open('nombre_personnes.json', 'w')
data = {}
while True :

    response = requests.get(url_get_start)
    response.raise_for_status()
    donnee_depart = response.json()
    on_tourne = donnee_depart["motion"]

    if on_tourne :
        with mss.MSS() as sct:
            with mp_face_detection.FaceDetection(
                min_detection_confidence = 0.5
            ) as face_detection :
                while on_tourne :
                    if cap.isOpened() :
                        compte_visage = 0

                        ret, frame = cap.read()
                        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                        face_results = face_detection.process(frame_rgb)
                
                        if face_results.detections :
                            for detection in face_results.detections:
                                compte_visage += 1
                                
                                box = detection.location_data.relative_bounding_box
                                ih, iw, _ = frame.shape
                                x, y, w, h = int(box.xmin * iw), int(box.ymin * ih), int(box.width * iw), int(box.height * ih)
                                cv2.rectangle(frame,(x,y),(x+w,y+h),(225,0,0),4)

                        if compte_visage == 1 :
                            cv2.imwrite("captured_image.png", frame)  

                        donnees = {"nombrePersonne": compte_visage}
                        envoi = requests.post(url_post, json=donnees)
                        envoi.raise_for_status()

                        response_arret = requests.get(url_get_stop)
                        response_arret.raise_for_status()
                        donnee_arret = response_arret.json()

                        if cv2.waitKey(1) and donnee_arret["fingerprint_id"] >= 0:
                            on_tourne = False
                        cv2.imshow('cam',frame)
