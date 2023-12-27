import requests
import csv
import cv2
from gaze_tracking import GazeTracking

gaze = GazeTracking()
webcam = cv2.VideoCapture(0)
csv_file_name = "data.csv"
eye_gaze_points=[]
ct=0


while True:
    # We get a new frame from the webcam
    _, frame = webcam.read()

    # We send this frame to GazeTracking to analyze it
    gaze.refresh(frame)

    frame = gaze.annotated_frame()
    text = ""

    if gaze.is_blinking():
        text = "Blinking"
        ct=ct+1
        if ct>50:
            print("wake up")
            ct=0
    elif gaze.is_right():
        text = "Looking right"
        ct=0
    elif gaze.is_left():
        text = "Looking left"
        ct=0
    elif gaze.is_center():
        text = "Looking center"
        ct=0

    url = 'http://localhost:5000/receiveMessage'
    

    payload = {'message': ct}
    response = requests.post(url, json=payload)

    if response.status_code == 200:
        print(ct)
    else:
        print('Failed to send message')


    cv2.putText(frame, text, (90, 60), cv2.FONT_HERSHEY_DUPLEX, 1.6, (147, 58, 31), 2)

    left_pupil = gaze.pupil_left_coords()
    right_pupil = gaze.pupil_right_coords()
    cv2.putText(frame, "Left pupil:  " + str(left_pupil), (90, 130), cv2.FONT_HERSHEY_DUPLEX, 0.9, (147, 58, 31), 1)
    cv2.putText(frame, "Right pupil: " + str(right_pupil), (90, 165), cv2.FONT_HERSHEY_DUPLEX, 0.9, (147, 58, 31), 1)

    cv2.imshow("Demo", frame)

    if cv2.waitKey(1) == 27:
        break
   
webcam.release()
cv2.destroyAllWindows()

 




