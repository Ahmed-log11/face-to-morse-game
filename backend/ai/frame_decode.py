import base64
from typing import Union, Optional

import cv2
import numpy as np


def _strip_data_url_prefix(b64: str) -> str:
    # Accept "data:image/jpeg;base64,...."
    if "," in b64 and "base64" in b64[:100]:
        return b64.split(",", 1)[1]
    return b64


def decode_frame(payload: Union[bytes, str, dict]) -> Optional[np.ndarray]:
    """
    Decodes a frame into a BGR OpenCV image.

    Supports:
      1) raw bytes (binary JPEG/PNG)
      2) base64 string (with or without data URL prefix)
      3) dict like {"image": "<base64>"} (common WS JSON format)
    """
    if payload is None:
        return None

    if isinstance(payload, dict):
        # Common shape: {"image": "...base64..."}
        img_b64 = payload.get("image")
        if not img_b64:
            return None
        payload = img_b64

    if isinstance(payload, str):
        try:
            b64 = _strip_data_url_prefix(payload)
            data = base64.b64decode(b64)
        except Exception:
            return None
        arr = np.frombuffer(data, dtype=np.uint8)
        img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
        return img

    if isinstance(payload, (bytes, bytearray)):
        arr = np.frombuffer(payload, dtype=np.uint8)
        img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
        return img

    return None
