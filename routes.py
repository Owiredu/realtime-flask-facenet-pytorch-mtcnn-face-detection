import os
from werkzeug import utils
from img_processor import ImageProcessor
from flask import render_template, Response, url_for
from camera import Camera
from app import app, socketio, mail, db
import json


camera = Camera(ImageProcessor())


@socketio.on('input_image', namespace='/capture')
def capture_input_image(input):
    """
    Gets the input frame and adds it to a queue
    """
    input = input.split(",")[1]
    camera.enqueue_input(input)


@socketio.on('connect', namespace='/capture')
def video_capture_connect():
    """
    Notifies that client video stream is connected to server
    """
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
    Generates frames to be sent to the client.
    """
    app.logger.info("Starting to generate frames ...")
    while True:
        frame = camera.get_frame()
        yield (b'--frame\r\n'b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')


@app.route('/video_feed')
def video_feed():
    """
    Video streaming route. Put this in the src attribute of an img tag.
    """
    return Response(gen(), mimetype='multipart/x-mixed-replace; boundary=frame')


def save_snapshot():
    app.logger.info("Saving snapshot ...")
    camera.snapshot = True


@app.route('/take_snapshot', methods=['POST'])
def take_snapshot():
    try:
        save_snapshot()
        return Response(json.dumps({'message': 'Snapshot taken successfully'}), status=200, mimetype='application/json')
    except:
        return Response(json.dumps({'message': 'Failed to take snapshot'}), status=400, mimetype='application/json')


def save_video_stream(status):
    app.logger.info("Saving video ...")
    if int(status) == 0:
        camera.save_video = False
    else:
        camera.save_video = True


@app.route('/save_video/<status>', methods=['POST'])
def save_video(status):
    try:
        save_video_stream(status)
        return Response(json.dumps({'message': 'Video saving status has been switched.'}), status=200, mimetype='application/json')
    except:
        return Response(json.dumps({'message': 'Failed to start video saving'}), status=400, mimetype='application/json')