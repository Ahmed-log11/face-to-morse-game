from __future__ import annotations

import time
from dataclasses import dataclass
from typing import Optional, Tuple, List

import numpy as np


# MediaPipe FaceMesh landmark indices for eye aspect ratio (EAR) style measure.
# These are commonly used landmarks around each eye.
LEFT_EYE = [33, 160, 158, 133, 153, 144]
RIGHT_EYE = [362, 385, 387, 263, 373, 380]


def _dist(a: np.ndarray, b: np.ndarray) -> float:
    return float(np.linalg.norm(a - b))


def eye_aspect_ratio(pts: np.ndarray, eye_idx: List[int]) -> float:
    """
    EAR = (||p2-p6|| + ||p3-p5||) / (2*||p1-p4||)
    Using indices [p1,p2,p3,p4,p5,p6] = [0..5] in eye_idx mapping.
    """
    p1, p2, p3, p4, p5, p6 = [pts[i] for i in eye_idx]
    num = _dist(p2, p6) + _dist(p3, p5)
    den = 2.0 * _dist(p1, p4)
    if den <= 1e-6:
        return 0.0
    return num / den


@dataclass
class BlinkConfig:
    ear_threshold: float = 0.22     # adjust if needed after testing
    min_closed_ms: int = 50         # ignore ultra-short noise
    cooldown_ms: int = 300          # prevent repeated triggers from one blink
    both_eyes_as_dash: bool = True  # both blink together => DASH


class BlinkDetector:
    """
    Consumes face landmarks and emits "DOT"/"DASH" based on eye blinks.

    Mapping:
      - left blink => DOT
      - right blink => DASH
      - both blink together => DASH (optional)
    """
    def __init__(self, config: BlinkConfig | None = None):
        self.cfg = config or BlinkConfig()

        # state
        self._left_closed_since: Optional[float] = None
        self._right_closed_since: Optional[float] = None
        self._last_emit_time: float = 0.0

    def _can_emit(self, now: float) -> bool:
        return (now - self._last_emit_time) * 1000.0 >= self.cfg.cooldown_ms

    def process_landmarks(self, pts_xy: np.ndarray) -> Optional[str]:
        """
        pts_xy: (468, 2) array of landmark pixel coords for a single face.
        Returns: "DOT", "DASH", or None
        """
        now = time.time()

        left_ear = eye_aspect_ratio(pts_xy, LEFT_EYE)
        right_ear = eye_aspect_ratio(pts_xy, RIGHT_EYE)

        left_closed = left_ear < self.cfg.ear_threshold
        right_closed = right_ear < self.cfg.ear_threshold

        # track close/open transitions with timestamps
        if left_closed and self._left_closed_since is None:
            self._left_closed_since = now
        if (not left_closed) and self._left_closed_since is not None:
            left_closed_dur = (now - self._left_closed_since) * 1000.0
            self._left_closed_since = None
        else:
            left_closed_dur = 0.0

        if right_closed and self._right_closed_since is None:
            self._right_closed_since = now
        if (not right_closed) and self._right_closed_since is not None:
            right_closed_dur = (now - self._right_closed_since) * 1000.0
            self._right_closed_since = None
        else:
            right_closed_dur = 0.0

        # Emit when an eye re-opens after being closed long enough
        if not self._can_emit(now):
            return None

        left_blink = left_closed_dur >= self.cfg.min_closed_ms
        right_blink = right_closed_dur >= self.cfg.min_closed_ms

        if left_blink and right_blink and self.cfg.both_eyes_as_dash:
            self._last_emit_time = now
            return "DASH"

        if left_blink:
            self._last_emit_time = now
            return "DOT"

        if right_blink:
            self._last_emit_time = now
            return "DASH"

        return None
