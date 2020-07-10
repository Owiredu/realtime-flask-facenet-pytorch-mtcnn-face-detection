from sys import stdout
from img_processor import ImageProcessor
import logging
from flask import Flask, render_template, Response
from flask_socketio import SocketIO
from engineio.payload import Payload
from camera import Camera
from utils import base64_to_pil_image, pil_image_to_base64


app = Flask(__name__)
app.logger.addHandler(logging.StreamHandler(stdout))
app.config['SECRET_KEY'] = b'x\xb3\x10\xfad\xb0MYg0N\xe5\xdd\x0c\xa7\xee+\x1c\x0cb\x97e\xc3fT\x1d~\xbd\xc2\x0b\x06='
app.config['DEBUG'] = True

Payload.max_decode_packets = 100000
socketio = SocketIO(app)
camera = Camera(ImageProcessor())


@socketio.on('input_image', namespace='/capture')
def capture_input_image(input):
    input = input.split(",")[1]
    camera.enqueue_input(input)


@socketio.on('connect', namespace='/capture')
def video_capture_connect():
    app.logger.info("client connected")


@app.route('/')
def index():
    """
    Video streaming home page.
    """
    return render_template('face-detection.html')


def gen():
    """
    Video streaming generator function.
    """
    app.logger.info("starting to generate frames!")
    while True:
        frame = camera.get_frame()
        yield (b'--frame\r\n'b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')


@app.route('/video_feed')
def video_feed():
    """
    Video streaming route. Put this in the src attribute of an img tag.
    """
    return Response(gen(), mimetype='multipart/x-mixed-replace; boundary=frame')


if __name__ == '__main__':
    socketio.run(app)
