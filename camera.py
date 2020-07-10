import threading
import binascii
from time import sleep
from utils import base64_to_pil_image, pil_image_to_base64


class Camera(object):

    def __init__(self, img_processor):
        self.to_process = []
        self.to_output = []
        self.img_processor = img_processor
        thread = threading.Thread(target=self.keep_processing, args=())
        thread.daemon = True
        thread.start()

    def process_one_frame(self):
        """
        Processes one frame
        """
        if not self.to_process:
            return
        try:
            # input is an ascii string. 
            input_str = self.to_process.pop(0)
            # convert it to a pil image
            input_img = base64_to_pil_image(input_str)
            # output_img is an PIL image
            output_img = self.img_processor.apply_processing(input_img)
            # output_str is a base64 string in ascii
            output_str = pil_image_to_base64(output_img)
            # convert a base64 string in ascii to base64 string in _bytes_
            self.to_output.append(binascii.a2b_base64(output_str))
        except:
            return

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
