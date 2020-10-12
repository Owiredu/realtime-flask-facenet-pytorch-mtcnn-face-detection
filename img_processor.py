from PIL import Image
from facenet_pytorch import MTCNN
from numpy.core.fromnumeric import resize
import torch
import cv2
import numpy as np
import os
import time
from app import app


class ImageProcessor(object):

    def __init__(self):
        # instantiate the face detector
        self.device = torch.device('cuda:0' if torch.cuda.is_available() else 'cpu')
        self.detector = MTCNN(keep_all=True, device=self.device)
        # set default values for settings values in case there is error loading the settings
        self.face_recog_conf_thresh = 70
        self.face_recog_sleep_duration = 1
        self.motion_sensitivity = 20
        self.motion_alarm_duration = 2
        self.motion_extra_recording = 1
        self.motion_email_notification = False
        self.motion_email_addresses = ''
        self.motion_email_sleep_duration = 1
        # count frames to skip as specified
        self.skip_frame_counter = 0
        # hold the previous detected face dimensions
        self.prev_dims = []
        # specify number of frames to skip
        self.num_of_frames_to_skip = 5
        # set the resized shape
        self.image_resize_shape = (320, 240)
        # initialize the general video writer for saving video
        self.video_writer_fourcc = cv2.VideoWriter_fourcc(*'XVID')
        self.video_writer = cv2.VideoWriter()
        self.fps = 30
        # monitor the recording stream so that whenever it is stopped and started, the next one has a different filename
        self.is_file_named = False
        self.video_writer_active = False
        # motion detection variables
        self.prev_frame = None
        self.cur_frame = None
        self.next_frame = None
        self.motion_frames_tracker = 0
        # initialize the video writer for motion detector
        self.motion_detection_writer_fourcc = cv2.VideoWriter_fourcc(*'XVID')
        self.motion_detection_writer = cv2.VideoWriter()
        self.is_motion_recording_named = False
        self.save_motion_detection = False
        self.prev_recording_time = 0.0


    def apply_processing(self, img, camera_id, resize, snapshot=False, save_video=False, facial_recognition=False, motion_detection=False):
        """
        Applies all the required processing to the images received from the video stream
        """
        # convert the pillow image to a numpy array for use in opencv
        img = self.pillow_to_cv2_img(img)
        # save the image if the snapshot is true
        if snapshot:
            self.take_snapshot(img, camera_id)
        # save the video if the save video is turned on
        if save_video:
            if not self.video_writer_active:
                self.activate_vid_saving_to_disk(camera_id)
                self.video_writer_active = True
            self.save_video_stream_to_file(img)
        else: 
            self.video_writer.release()
            self.is_file_named = False
            self.video_writer_active = False
        # resize the image if resize is true
        if resize:
            # resize the image to 320 x 240
            img = cv2.resize(img, self.image_resize_shape)
        # detection motion
        if motion_detection:
            # get first frame
            if self.motion_frames_tracker == 0:
                self.prev_frame = self.convertToGRAY(img)
                self.motion_frames_tracker += 1
            # get next frame
            elif self.motion_frames_tracker == 1:
                self.cur_frame = self.convertToGRAY(img)
                self.motion_frames_tracker += 1
            # get the following frame
            elif self.motion_frames_tracker == 2:
                self.next_frame = self.convertToGRAY(img)
                self.motion_frames_tracker += 1
            # detect motion for the first three frames upon activation
            elif self.motion_frames_tracker == 3:
                self.detect_motion(camera_id)
                self.motion_frames_tracker += 1
            # replace the frames and detect motion
            else:
                self.prev_frame = self.cur_frame
                self.cur_frame = self.next_frame
                self.next_frame = self.convertToGRAY(img)
                self.detect_motion(camera_id)
            # save motion detection scene
            # write the colored frame
            frame_to_record = img.copy()
            self.record_motion_detection(frame_to_record)
        else:
            # if motion detection is off, stop playing sound
            # pygame.mixer.music.stop()
            pass
        # skip frames specified
        if facial_recognition:
            if self.skip_frame_counter == self.num_of_frames_to_skip:
                # detect the faces
                faces, dims = self.detect_faces(img)
                # set the previous face dimensions detected the current one
                self.prev_dims = dims
                if dims:
                    # draw rectangles around the detected faces
                    for dim in dims:
                        self.rectangle(img, dim)
                # reset the frame skip counter to zero
                self.skip_frame_counter = 0
            elif self.prev_dims:
                # draw rectangles around the detected faces
                for dim in self.prev_dims:
                    self.rectangle(img, dim)
            # increment the frame skip counter
            self.skip_frame_counter += 1
        else:
            self.skip_frame_counter = 0
            self.prev_dims = []
        # convert numpy array to a pillow img
        img = self.cv2_img_to_pillow(img)
        return img


    def pillow_to_cv2_img(self, img):
        """
        Converts a pillow image to a numpy array
        """
        # convert a pillow image to a RGB numpy array
        img = np.array(img)
        # convert a RGB numpy array to a BGR numpy array
        img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
        return img
        

    def cv2_img_to_pillow(self, img):
        """
        Converts an image from a numpy array to a pillow image.
        """
        # convert image from BGR to RGB format
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        # convert a RGB numpy array to a pillow image
        img = Image.fromarray(img)
        return img


    def convertToRGB(self, img):  # argument types: Mat
        """
        This method converts bgr image to rgb
        """
        return cv2.cvtColor(img, cv2.COLOR_BGR2RGB)


    def convertToGRAY(self, img):  # argument types: Mat
        """
        This method converts bgr image to grayscale
        """
        return cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)


    def rectangle(self, img, rect):  # argument types: Mat, list
        """
        Draws a rectangle around the detected face
        """
        (x, y, w, h) = [int(val) for val in rect]
        cv2.rectangle(img, (x - 10, y - 10), (w + 10, h + 10), (0, 255, 0), 2, cv2.LINE_AA)

    def detect_faces(self, frame):
        """
        Detects faces using Multi-Task Cascaded Convolutional Neural Network
        """
        # detect the faces
        boxes, _ = self.detector.detect(frame)
        # return nothing if no face is detected
        if boxes is None:
            return None, None
        if len(boxes) == 0:
            return None, None
        # draw rectangles around the faces
        cropped_faces = []
        faces_dimensions = []
        for box in boxes:
            (x, y, w, h) = [int(val) for val in box]
            faces_dimensions.append((x, y, w, h))
            cropped_faces.append(frame[y : h, x : w])
        # return frame with detected faces
        return cropped_faces, faces_dimensions


    def take_snapshot(self, img, camera_id):  # argument types: Mat, String or int
        """
        Takes a snapshot
        """
        # get current time, extract the date from and create the folder if it does not exist. Name the image with the time value
        time_taken = time.time()
        current_date = time.strftime('%Y-%m-%d', time.localtime(int(time_taken)))
        os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'snapshots', current_date), exist_ok=True)
        image_path = os.path.join(app.config['UPLOAD_FOLDER'], 'snapshots', current_date, str(camera_id) + '_' + str(time_taken) + '.jpg')
        cv2.imwrite(image_path, img)


    # argument types: String or int
    def activate_vid_saving_to_disk(self, camera_id):
        """
        Starts saving the video to the local drive
        """
        # get current time, extract the date from and create the folder if it does not exist.
        # Name the video with the time value
        time_taken = time.time()
        current_date = time.strftime('%Y-%m-%d', time.localtime(int(time_taken)))
        os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'saved_videos', current_date), exist_ok=True)
        self.video_path = os.path.join(app.config['UPLOAD_FOLDER'], 'saved_videos', current_date, str(camera_id) + '_' + str(time_taken) + '.avi')
        # enable video recording
        self.is_file_named = True


    def save_video_stream_to_file(self, frame):  # argument types: Mat
        """
        This method saves the video when save is enabled
        """
        if self.is_file_named:
            # open video recording
            self.video_writer.open(self.video_path, self.video_writer_fourcc, self.fps, (frame.shape[1], frame.shape[0]), True)
            self.is_file_named = False
        # write the frame
        self.video_writer.write(frame)


    def detect_motion(self, camera_id):
        """
        This method detects motion and records the scene
        """
        # get frame for recording
        rec_frame = self.cur_frame.copy()
        # set frames to same size
        self.next_frame = cv2.resize(self.next_frame, (200, 200))
        self.cur_frame = cv2.resize(self.cur_frame, (200, 200))
        self.prev_frame = cv2.resize(self.prev_frame, (200, 200))
        # get the differences between the frames and use bitwise and operator to get the resolved differences
        # between three successive frames
        next_cur_diff = cv2.absdiff(self.next_frame, self.cur_frame)
        cur_prev_diff = cv2.absdiff(self.cur_frame, self.prev_frame)
        resolve_diff = cv2.bitwise_and(next_cur_diff, cur_prev_diff)
        # get the difference count and use to detect motion
        if (resolve_diff > 100 - self.motion_sensitivity).sum() > 50:
            # play motion detection sound
            # pygame.mixer.music.play(loops=int(60*self.motion_alarm_duration))
            # send motion email
            # if self.motion_email_notification:
            #     motion_email_time = time.time()
            #     if (motion_email_time - self.prev_motion_email_time) > 60 * self.motion_email_sleep_duration:
            #         self.prev_motion_email_time = motion_email_time
            #         motion_det_time = time.asctime()
            #         self.motion_email.set_motion_info(self.camera_id_for_db, motion_det_time, self.motion_email_addresses)
            #         self.motion_email.start()
            # start recording scene
            self.activate_motion_detection_recording(camera_id)


    def activate_motion_detection_recording(self, camera_id):
        """
        This method starts saving the motion detection scene to the local drive
        """
        # get current time, extract the date from and create the folder if it does not exist. Name the video with the time value
        time_taken = time.time()
        if (time_taken - self.prev_recording_time) >= 60 * self.motion_extra_recording:
            self.prev_recording_time = time_taken
            current_date = time.strftime('%Y-%m-%d', time.localtime(int(time_taken)))
            # only record in a separate video file when the interval between the different detections is larger set amount of time
            self.motion_detection_writer.release()
            os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'motion_detection', current_date), exist_ok=True)
            self.motion_recording_path = os.path.join(app.config['UPLOAD_FOLDER'], 'motion_detection', current_date, str(camera_id) + '_' + str(time_taken) + '.avi')
            self.save_motion_detection = True
            self.is_motion_recording_named = True


    def record_motion_detection(self, img):  # argument types: Mat
        """
        This method saves the motion detection scene when motion is detected
        """
        if self.save_motion_detection:
            frame_width, frame_height = img.shape[1], img.shape[0]
            if self.is_motion_recording_named:
                # open video recording
                self.motion_detection_writer.open(self.motion_recording_path, self.motion_detection_writer_fourcc, self.fps, (frame_width, frame_height), True) # true means colored
                self.is_motion_recording_named = False
            self.motion_detection_writer.write(img)
        else:
            # if motion detection is off, stop the recording
            self.motion_detection_writer.release()
            self.is_motion_recording_named = False
