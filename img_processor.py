from PIL import Image
from facenet_pytorch import MTCNN
import torch
import cv2
import numpy as np


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

    def apply_processing(self, img):
        """
        Applies all the required processing to the images received from the video stream
        """
        # convert the pillow image to a numpy array for use in opencv
        img = self.pillow_to_cv2_img(img)
        # resize the image to 320 x 240
        img = cv2.resize(img, self.image_resize_shape)
        # skip frames specified
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
        # convert numpy array to a pillow img
        img = self.cv2_img_to_pillow(img)
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
