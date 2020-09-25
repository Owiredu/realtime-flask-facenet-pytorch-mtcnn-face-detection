import threading
import os
import binascii
from time import sleep
from PIL import Image 
from utils import base64_to_pil_image, pil_image_to_base64


class Camera(object):

    def __init__(self, img_processor, feed_index):
        self.camera_id = str(feed_index)
        self.frame_tracker = 0  # track number of frames that have not been received.
        self.is_first_frame_display = False  # track if default image is displayed
        self.snapshot = False  # notify if snapshot should be saved
        self.save_video = False # notify whether video should be saved
        self.default_frame = pil_image_to_base64(Image.open(os.path.join('static', 'images', 'default_img.jpg')))
        self.to_process = []
        self.to_output = []
        self.img_processor = img_processor
        thread = threading.Thread(target=self.keep_processing, args=())
        thread.daemon = False
        thread.start()

    def process_one_frame(self):
        """
        Processes one frame
        """
        if not self.to_process:
            # display the default image if 100 or more consecutive frames have not been received
            if self.frame_tracker >= 100:
                self.enqueue_input(self.default_frame)
                self.frame_tracker = 0
                self.is_first_frame_display = True
            else:
                self.frame_tracker += 1
                self.is_first_frame_display = False
            return
        self.frame_tracker = 0
        # input is an ascii string.
        input_str = self.to_process.pop(0)
        # convert it to a pil image
        input_img = base64_to_pil_image(input_str)
         # output_img is an PIL image
         # do not resize default image
        if self.is_first_frame_display:
            output_img = self.img_processor.apply_processing(input_img, camera_id=self.camera_id, resize=False)
        else:
            output_img = self.img_processor.apply_processing(input_img, camera_id=self.camera_id, resize=True, snapshot=self.snapshot, save_video=self.save_video)
            # reset snapshot to false
            self.snapshot = False
        # output_str is a base64 string in ascii
        output_str = pil_image_to_base64(output_img)
        # convert a base64 string in ascii to base64 string in _bytes_
        self.to_output.append(binascii.a2b_base64(output_str))
        

    def keep_processing(self):
        """
        Process the frames one by one until stream is terminated
        """
        while True:
            self.process_one_frame()
            sleep(0.001)

    def enqueue_input(self, input_frame):
        """
        Adds images yet to be processed to a queue (list)
        """
        self.to_process.append(input_frame)

    def get_frame(self):
        """
        Gets a processed frame if any
        """
        while not self.to_output:
            sleep(0.005)
        return self.to_output.pop(0)
