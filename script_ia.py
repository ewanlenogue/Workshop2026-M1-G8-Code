import cv2
import mediapipe as mp
import json

cap = cv2.VideoCapture(0)
mp_draw = mp.solutions.drawing_utils
mp_face_detection = mp.solutions.face_detection

fichier = open('nombre_personnes.json', 'w')
data = {}

with mp_face_detection.FaceDetection(
    min_detection_confidence = 0.7
) as face_detection :
    while cap.isOpened():
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
                cv2.rectangle(frame,(x,y),(x+w,y+h),(0,255,255),2)

        fichier.seek(0)
        data['nombre_personne'] = compte_visage
        json.dump(data, fichier)
        fichier.truncate()
        
        if cv2.waitKey(1) & 0xFF == ord('a'):
            break
        cv2.imshow('cam',frame)
