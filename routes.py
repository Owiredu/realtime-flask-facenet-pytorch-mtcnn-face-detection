import os
from flask.globals import request
from werkzeug import utils
from img_processor import ImageProcessor
from flask import render_template, Response, url_for
from camera import Camera
from app import app, socketio, mail, db
import json


cameras_dict = dict()


@socketio.on('input_image', namespace='/capture')
def capture_input_image(input):
    """
    Gets the input frame and adds it to a queue
    """
    feed_id = input[0]
    input = input[1].split(",")[1]
    try:
        cameras_dict[feed_id].enqueue_input(input)
    except:
        pass


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


def gen(feed_id):
    """
    Video streaming generator function. 
    Generates frames to be sent to the client.
    """
    app.logger.info("Starting to generate frames ...")
    try:
        while True:
            frame = cameras_dict[feed_id].get_frame()
            yield (b'--frame\r\n'b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
    except:
        pass


@app.route('/video_feed_0/<feed_id>')
def video_feed_0(feed_id):
    """
    Video streaming route. Put this in the src attribute of an img tag.
    """
    if not cameras_dict.keys().__contains__(feed_id):
        cameras_dict[feed_id] = Camera(ImageProcessor(), feed_id)
    return Response(gen(feed_id), mimetype='multipart/x-mixed-replace; boundary=frame')


@app.route('/video_feed_1/<feed_id>')
def video_feed_1(feed_id):
    """
    Video streaming route. Put this in the src attribute of an img tag.
    """
    if not cameras_dict.keys().__contains__(feed_id):
        cameras_dict[feed_id] = Camera(ImageProcessor(), feed_id)
    return Response(gen(feed_id), mimetype='multipart/x-mixed-replace; boundary=frame')


@app.route('/video_feed_2/<feed_id>')
def video_feed_2(feed_id):
    """
    Video streaming route. Put this in the src attribute of an img tag.
    """
    if not cameras_dict.keys().__contains__(feed_id):
        cameras_dict[feed_id] = Camera(ImageProcessor(), feed_id)
    return Response(gen(feed_id), mimetype='multipart/x-mixed-replace; boundary=frame')


@app.route('/video_feed_3/<feed_id>')
def video_feed_3(feed_id):
    """
    Video streaming route. Put this in the src attribute of an img tag.
    """
    if not cameras_dict.keys().__contains__(feed_id):
        cameras_dict[feed_id] = Camera(ImageProcessor(), feed_id)
    return Response(gen(feed_id), mimetype='multipart/x-mixed-replace; boundary=frame')


def remove_aborted_threads(video_feed_ids):
    """
    Sets the checkable features to their default states
    """
    video_feed_ids = video_feed_ids.split("_")
    for feed_id in video_feed_ids:
        if cameras_dict.keys().__contains__(feed_id):
            cameras_dict.pop(feed_id)


@app.route('/remove_threads', methods=['POST'])
def remove_threads():
    """
    Sets the checkable features to their default states
    """
    try:
        video_feed_ids = request.form["videoFeedIds"]
        remove_aborted_threads(video_feed_ids)
        return Response(json.dumps({'message': 'Checkable items set to default successfully'}), status=200, mimetype='application/json')
    except:
        return Response(json.dumps({'message': 'Failed to set checkable items to default'}), status=400, mimetype='application/json')


def save_snapshot(feed_id):
    """
    Saves a the current frame
    """
    app.logger.info("Saving snapshot ...")
    cameras_dict[feed_id].snapshot = True


@app.route('/take_snapshot/<feed_id>', methods=['POST'])
def take_snapshot(feed_id):
    """
    Saves a the current frame
    """
    try:
        save_snapshot(feed_id)
        return Response(json.dumps({'message': 'Snapshot taken successfully'}), status=200, mimetype='application/json')
    except:
        return Response(json.dumps({'message': 'Failed to take snapshot'}), status=400, mimetype='application/json')


def save_video_stream(status, feed_id):
    """
    Activates video saving
    """
    app.logger.info("Saving video ...")
    if int(status) == 0:
        cameras_dict[feed_id].save_video = False
    else:
        cameras_dict[feed_id].save_video = True


@app.route('/save_video/<status_and_feed_id>', methods=['POST'])
def save_video(status_and_feed_id):
    """
    Activates video saving
    """
    try:
        status, feed_id = status_and_feed_id.split("_")
        save_video_stream(int(status), feed_id)
        return Response(json.dumps({'message': 'Video saving status has been turned ' + ('OFF' if status == "0" else 'ON') }), status=200, mimetype='application/json')
    except:
        return Response(json.dumps({'message': 'Failed to toggle video saving'}), status=400, mimetype='application/json')


def motion_detection_stream(status, feed_id):
    """
    Activates motion detection
    """
    app.logger.info("Motion detection ...")
    if int(status) == 0:
        cameras_dict[feed_id].motion_detection = False
    else:
        cameras_dict[feed_id].motion_detection = True


@app.route('/motion_detection/<status_and_feed_id>', methods=['POST'])
def motion_detection(status_and_feed_id):
    """
    Activates motion detection
    """
    try:
        status, feed_id = status_and_feed_id.split("_")
        motion_detection_stream(int(status), feed_id)
        return Response(json.dumps({'message': 'Motion detection has been turned ' + ('OFF' if status == "0" else 'ON') }), status=200, mimetype='application/json')
    except:
        return Response(json.dumps({'message': 'Failed to toggle motion detection'}), status=400, mimetype='application/json')