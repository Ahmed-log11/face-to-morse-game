"""High-level detector used by FastAPI and local testing."""

from __future__ import annotations

from typing import Optional, Union, Dict, Any

import cv2
import numpy as np
import mediapipe as mp

from .frame_decode import decode_frame
from .blink_detector_v3 import MorseBlinkDetector, BlinkConfig


class MorseDetector:
    def __init__(self, blink_config: BlinkConfig | None = None):
        self.blinks = MorseBlinkDetector(blink_config or BlinkConfig())
        self._mp_face_mesh = mp.solutions.face_mesh
        self._face_mesh = self._mp_face_mesh.FaceMesh(
            static_image_mode=False,
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.3,
            min_tracking_confidence=0.5,
        )

    def _landmarks_to_pixels(self, face_landmarks, w: int, h: int) -> np.ndarray:
        pts = np.zeros((468, 2), dtype=np.float32)
        for i, lm in enumerate(face_landmarks.landmark[:468]):
            pts[i, 0] = lm.x * w
            pts[i, 1] = lm.y * h
        return pts

    def process(self, payload: Union[np.ndarray, bytes, str, Dict[str, Any]]) -> Optional[str]:
        if isinstance(payload, np.ndarray):
            frame_bgr = payload
        else:
            frame_bgr = decode_frame(payload)

        if frame_bgr is None:
            print("❌ Frame is None")
            return None

        frame_bgr = cv2.flip(frame_bgr, 1)

        h, w = frame_bgr.shape[:2]
        frame_rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)

        res = self._face_mesh.process(frame_rgb)

        if not res.multi_face_landmarks:
            print("❌ No face detected")
            return None
        else:
            print("✅ Face detected")

        pts_xy = self._landmarks_to_pixels(res.multi_face_landmarks[0], w, h)

        signal = self.blinks.process_landmarks(pts_xy)

        if signal:
            print(f"🚀 Signal detected: {signal}")

        return signal
    def reset(self) -> None:
        """Reset the blink detector so it re-calibrates for a new player.
        Called by the /reset-detector endpoint in main.py."""
        self.blinks.reset()  
    def close(self) -> None:
        if self._face_mesh is not None:
            self._face_mesh.close()
          