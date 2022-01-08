import base64
import time
import io
import datetime as dt
import picamera 
import paho.mqtt.publish as publish
MQTT_SERVER = "home.egemeric.gen.tr"  #Write Server IP Address
MQTT_PATH = "/home/egemeric/camera"

camera = picamera.PiCamera()
camera.start_preview()
time.sleep(1)
def camJob():
    my_stream = io.BytesIO()
    camera.resolution = (1024, 768)
    camera.annotate_text = dt.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    camera.capture(my_stream, 'jpeg', quality=10)
    print(my_stream.getbuffer().nbytes)
    my_stream.seek(0)
    publish.single(MQTT_PATH, my_stream.read(), hostname=MQTT_SERVER)

while(True):
    camJob()
    time.sleep(0.5)

camera.stop_preview()
camera.stop()
