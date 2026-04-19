"""Blink detector V3 – relative comparison approach with silent calibration."""

from __future__ import annotations

import time
from dataclasses import dataclass
from typing import Optional, List

import numpy as np

# ─── MediaPipe Face Mesh landmark indices (unchanged from V2) ───
LEFT_EYE = [33, 160, 158, 133, 153, 144]
RIGHT_EYE = [362, 385, 387, 263, 373, 380]

FOREHEAD = 10
NOSE_TIP = 1
CHIN = 152


def _dist(a: np.ndarray, b: np.ndarray) -> float:
    return float(np.linalg.norm(a - b))


def eye_aspect_ratio(pts: np.ndarray, eye_idx: List[int]) -> float:
    """
    Standard EAR formula — same as your V2, no changes needed here.
    """
    p1, p2, p3, p4, p5, p6 = [pts[i] for i in eye_idx]
    num = _dist(p2, p6) + _dist(p3, p5)
    den = 2.0 * _dist(p1, p4)
    if den <= 1e-6:
        return 0.0
    return num / den


@dataclass
class BlinkConfig:
    # ─── Silent calibration ───
    # Runs during your existing countdown. Player just stares at screen.
    # 3 seconds matches your countdown timer perfectly.
    calibrate_seconds: float = 3.0

    # Safety bounds — if calibration captures something outside this range,
    # clamp it. Prevents garbage baselines from bad lighting or no face.
    baseline_min: float = 0.12
    baseline_max: float = 0.45

    # ─── Smoothing ───
    ema_alpha: float = 0.40  # Slightly smoother than your V2 (was 0.45)

    # ─── Relative comparison — THE KEY CHANGE ───
    # Instead of "is this eye closed?" we ask "how much did each eye
    # drop compared to its own baseline?"
    #
    # drop_ratio = current_EAR / baseline_EAR
    #   1.0 = eye fully open (same as baseline)
    #   0.5 = eye at 50% of its open size
    #   0.0 = eye fully closed
    #
    # A wink is detected when ONE eye drops significantly more than the other.

    # How much an eye must drop from its baseline to count as "closed"
    # 0.70 means EAR must fall to 70% of baseline (a 30% drop)
    close_drop: float = 0.70

    # How much difference between the two eyes to call it a wink vs natural blink
    # If left drops to 0.50 and right drops to 0.85, the difference is 0.35
    # which is above 0.18, so it's a wink (the left eye), not a natural blink.
    min_asymmetry: float = 0.18

    # ─── Natural blink rejection ───
    # If BOTH eyes drop below this ratio simultaneously and with similar
    # amounts (asymmetry < min_asymmetry), it's an involuntary blink → ignore
    both_close_drop: float = 0.75

    # ─── Frame and timing requirements ───
    closed_frames_required: int = 2   # Must be closed for 2+ frames to count
    cooldown_ms: int = 300            # Min gap between signals (slightly longer
                                      # than V2's 250 to reduce double-triggers)

    # ─── Head pose ───
    max_down_pitch_ratio: float = 0.55  # Same as V2

    # ─── Adaptive baseline ───
    # Slowly adjusts baseline when eyes are open to handle gradual
    # lighting or position changes during gameplay
    baseline_drift_rate: float = 0.003


class MorseBlinkDetector:
    """
    Left/right wink detector using relative comparison.

    HOW IT WORKS:
    1. During countdown (3 sec), silently captures each eye's open baseline
    2. During gameplay, every frame:
       - Compute how much each eye dropped from ITS OWN baseline
       - If one eye dropped a lot and the other didn't → that's a wink
       - If both eyes dropped similarly → natural blink, ignore it

    WHY THIS IS BETTER THAN V2:
    - No fixed threshold that fails for small eyes
    - Crosstalk is handled by comparing relative drops, not absolute values
    - Works for different eye shapes because everything is relative to
      that person's own baseline

    PLAYER EXPERIENCE:
    - Position yourself → click ready → countdown 3..2..1 → play
    - Left wink = DOT
    - Right wink = DASH
    - No extra calibration steps
    """

    def __init__(self, config: BlinkConfig | None = None):
        self.cfg = config or BlinkConfig()

        self._t0 = time.time()
        self._calibrating = True

        # Calibration sample collection
        self._calib_left: List[float] = []
        self._calib_right: List[float] = []

        # Personal baselines (set after calibration)
        self._baseline_left: Optional[float] = None
        self._baseline_right: Optional[float] = None

        # Smoothed EAR values
        self._ema_left: Optional[float] = None
        self._ema_right: Optional[float] = None

        # Wink state tracking
        self._left_closed_frames = 0
        self._right_closed_frames = 0
        self._wink_active: Optional[str] = None  # "LEFT" or "RIGHT" while wink is held
        self._last_emit_time = 0.0

    @property
    def is_calibrated(self) -> bool:
        return not self._calibrating

    @property
    def debug_info(self) -> dict:
        """
        Display this on screen during development.
        Shows what the detector sees every frame.
        """
        left_drop = 0.0
        right_drop = 0.0
        if self._baseline_left and self._ema_left:
            left_drop = self._ema_left / self._baseline_left
        if self._baseline_right and self._ema_right:
            right_drop = self._ema_right / self._baseline_right

        return {
            "calibrating": self._calibrating,
            "baseline_left": round(self._baseline_left or 0, 4),
            "baseline_right": round(self._baseline_right or 0, 4),
            "ema_left": round(self._ema_left or 0, 4),
            "ema_right": round(self._ema_right or 0, 4),
            "left_drop_ratio": round(left_drop, 3),   # 1.0 = open, 0.5 = half closed
            "right_drop_ratio": round(right_drop, 3),
            "asymmetry": round(abs(left_drop - right_drop), 3),
            "wink_active": self._wink_active,
        }

    def _can_emit(self, now: float) -> bool:
        return (now - self._last_emit_time) * 1000.0 >= self.cfg.cooldown_ms

    def _pitch_ratio(self, pts: np.ndarray) -> float:
        """Detect if head is tilted down — same as V2."""
        fh = pts[FOREHEAD]
        nose = pts[NOSE_TIP]
        chin = pts[CHIN]
        up = _dist(fh, nose)
        down = _dist(nose, chin)
        if up <= 1e-6:
            return 1.0
        return down / up

    def _apply_ema(self, prev: Optional[float], x: float) -> float:
        if prev is None:
            return x
        a = self.cfg.ema_alpha
        return a * x + (1.0 - a) * prev

    def _finalize_calibration(self) -> None:
        """
        Compute personal baselines from collected samples.
        Uses median to be robust against any accidental blinks
        during the countdown.
        """
        if self._calib_left:
            bl = float(np.median(self._calib_left))
            self._baseline_left = max(self.cfg.baseline_min,
                                      min(self.cfg.baseline_max, bl))
        else:
            self._baseline_left = 0.25  # Safe fallback

        if self._calib_right:
            br = float(np.median(self._calib_right))
            self._baseline_right = max(self.cfg.baseline_min,
                                       min(self.cfg.baseline_max, br))
        else:
            self._baseline_right = 0.25

        # Initialize EMA with baselines
        self._ema_left = self._baseline_left
        self._ema_right = self._baseline_right

        self._calibrating = False

    def _update_baselines(self, left_ear: float, right_ear: float) -> None:
        """
        Slowly drift baselines toward current open-eye values.
        Only called when both eyes appear open (no wink active).
        Handles gradual lighting or position changes.
        """
        r = self.cfg.baseline_drift_rate
        if self._baseline_left:
            self._baseline_left = (1.0 - r) * self._baseline_left + r * left_ear
        if self._baseline_right:
            self._baseline_right = (1.0 - r) * self._baseline_right + r * right_ear

    def process_landmarks(self, pts_xy: np.ndarray) -> Optional[str]:
        """
        Process one frame of face landmarks.

        Returns:
            "DOT"   — left wink detected
            "DASH"  — right wink detected
            None    — no event (or still calibrating, or natural blink)
        """
        now = time.time()

        # ─── Head pose guard (same as V2) ───
        pitch = self._pitch_ratio(pts_xy)
        if pitch < self.cfg.max_down_pitch_ratio:
            self._left_closed_frames = 0
            self._right_closed_frames = 0
            self._wink_active = None
            return None

        # ─── Compute EAR for each eye ───
        left_ear = eye_aspect_ratio(pts_xy, LEFT_EYE)
        right_ear = eye_aspect_ratio(pts_xy, RIGHT_EYE)

        # ═══════════════════════════════════════════════════
        # CALIBRATION: Runs silently during your countdown
        # Player is staring at screen with both eyes open.
        # We just collect samples — no UI prompts needed.
        # ═══════════════════════════════════════════════════
        if self._calibrating:
            elapsed = now - self._t0
            if elapsed < self.cfg.calibrate_seconds:
                # Only collect samples that look like open eyes
                # (reject any accidental blinks during countdown)
                if left_ear > self.cfg.baseline_min and right_ear > self.cfg.baseline_min:
                    self._calib_left.append(left_ear)
                    self._calib_right.append(right_ear)
                return None

            # Countdown is over — finalize baselines
            self._finalize_calibration()
            return None

        # ═══════════════════════════════════════════════════
        # DETECTION: Relative comparison approach
        # ═══════════════════════════════════════════════════
        if self._baseline_left is None or self._baseline_right is None:
            return None

        # Smooth the raw EAR values
        self._ema_left = self._apply_ema(self._ema_left, left_ear)
        self._ema_right = self._apply_ema(self._ema_right, right_ear)

        # ─── Compute drop ratios ───
        # How much has each eye dropped relative to its OWN baseline?
        # 1.0 = fully open (same as baseline)
        # 0.5 = dropped to half its open size
        #
        # This is the key insight: we don't care about absolute EAR values.
        # A person with small eyes (baseline 0.18) who drops to 0.09
        # has a ratio of 0.50 — same as a person with big eyes (baseline
        # 0.34) who drops to 0.17. Both are clearly winking.
        left_ratio = self._ema_left / self._baseline_left
        right_ratio = self._ema_right / self._baseline_right

        # ─── Is each eye "closed"? ───
        left_closed = left_ratio < self.cfg.close_drop
        right_closed = right_ratio < self.cfg.close_drop

        # ─── How different are the two eyes? ───
        # High asymmetry = one eye closed much more than the other = WINK
        # Low asymmetry = both eyes similar = natural blink or both open
        asymmetry = abs(left_ratio - right_ratio)

        # ─── Natural blink rejection ───
        # Both eyes dropped similarly? That's an involuntary blink.
        if left_closed and right_closed and asymmetry < self.cfg.min_asymmetry:
            self._left_closed_frames = 0
            self._right_closed_frames = 0
            self._wink_active = None
            return None

        # ─── Determine which eye is winking ───
        # The eye with the LOWER ratio (bigger drop) is the one winking.
        # The other eye might have partially closed too (crosstalk)
        # but asymmetry check ensures there's enough difference.

        if left_closed and asymmetry >= self.cfg.min_asymmetry and left_ratio < right_ratio:
            # Left eye dropped more → left wink
            self._left_closed_frames += 1
            self._right_closed_frames = 0
        elif right_closed and asymmetry >= self.cfg.min_asymmetry and right_ratio < left_ratio:
            # Right eye dropped more → right wink
            self._right_closed_frames += 1
            self._left_closed_frames = 0
        else:
            # ─── Both eyes open — check if a wink just ended ───
            # Signals are emitted on RELEASE (when eye reopens), not on close.
            # This prevents multiple signals from one long wink.

            if self._wink_active == "LEFT" and self._left_closed_frames >= self.cfg.closed_frames_required:
                self._left_closed_frames = 0
                self._wink_active = None
                if self._can_emit(now):
                    self._last_emit_time = now
                    return "DOT"

            if self._wink_active == "RIGHT" and self._right_closed_frames >= self.cfg.closed_frames_required:
                self._right_closed_frames = 0
                self._wink_active = None
                if self._can_emit(now):
                    self._last_emit_time = now
                    return "DASH"

            self._left_closed_frames = 0
            self._right_closed_frames = 0
            self._wink_active = None

            # Both eyes open — good time to adapt baselines
            self._update_baselines(self._ema_left, self._ema_right)

            return None

        # ─── Track active wink ───
        # We know one eye is winking. Record which one.
        # Signal is only emitted when the eye REOPENS (in the else block above).
        if self._left_closed_frames >= self.cfg.closed_frames_required:
            self._wink_active = "LEFT"
        elif self._right_closed_frames >= self.cfg.closed_frames_required:
            self._wink_active = "RIGHT"

        return None

    def reset(self) -> None:
        """Reset everything — call this to re-calibrate."""
        self.__init__(self.cfg)
