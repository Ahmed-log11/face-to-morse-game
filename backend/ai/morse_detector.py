from __future__ import annotations

from typing import Optional, Union, Dict, Any

import cv2
import numpy as np
import mediapipe as mp

from .frame_decode import decode_frame
from .blink_detector import BlinkDetector, BlinkConfig


class MorseDetector:
    """
    High-level detector:
      input: a frame payload (bytes/base64/dict)
      output: "DOT"/"DASH"/None

    IMPORTANT: Create ONE instance and reuse it (do not re-init per frame).
    """
    def __init__(self, blink_config: BlinkConfig | None = None):
        self.blinks = BlinkDetector(blink_config or BlinkConfig())
        self._mp_face_mesh = mp.solutions.face_mesh
        self._face_mesh = self._mp_face_mesh.FaceMesh(
            static_image_mode=False,
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5,
        )

    def _landmarks_to_pixels(self, face_landmarks, w: int, h: int) -> np.ndarray:
        pts = np.zeros((468, 2), dtype=np.float32)
        for i, lm in enumerate(face_landmarks.landmark[:468]):
            pts[i, 0] = lm.x * w
            pts[i, 1] = lm.y * h
        return pts

    def process(self, payload: Union[bytes, str, Dict[str, Any]]) -> Optional[str]:
        """
        payload: bytes (binary JPEG), base64 string, or dict {"image": "<base64>"}
        returns: "DOT", "DASH", or None
        """
        frame_bgr = decode_frame(payload)
        if frame_bgr is None:
            return None

        h, w = frame_bgr.shape[:2]
        frame_rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)

        res = self._face_mesh.process(frame_rgb)
        if not res.multi_face_landmarks:
            return None

        pts_xy = self._landmarks_to_pixels(res.multi_face_landmarks[0], w, h)
        return self.blinks.process_landmarks(pts_xy)
