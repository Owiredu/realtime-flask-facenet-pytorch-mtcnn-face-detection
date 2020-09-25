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


    def apply_processing(self, img, camera_id, resize, snapshot=False, save_video=False, recognize_faces=False, detect_motion=False):
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
        # skip frames specified
        if recognize_faces:
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
