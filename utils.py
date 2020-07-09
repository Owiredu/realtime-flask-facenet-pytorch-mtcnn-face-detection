from PIL import Image
from io import BytesIO
import base64


def pil_image_to_base64(pil_image):
    """
    Convert a pillow image to a base64 image
    """
    buf = BytesIO()
    pil_image.save(buf, format="JPEG")
    return base64.b64encode(buf.getvalue())


def base64_to_pil_image(base64_img):
    """
    Converts a base64 image to a pillow image
    """
    return Image.open(BytesIO(base64.b64decode(base64_img)))
