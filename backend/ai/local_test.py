"""Run a quick local test of blink detection using your own webcam."""

from __future__ import annotations

import cv2

from .morse_detector import MorseDetector


def main() -> None:
    cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
    if not cap.isOpened():
        raise RuntimeError("Could not open webcam.")

    detector = MorseDetector()
    try:
        while True:
            ok, frame = cap.read()
            if not ok:
                print("❌ Failed to read frame")
                continue
            print("✅ Frame received", frame.shape)

            signal = detector.process(frame)
            if signal:
                print(signal)

            cv2.imshow("Face-to-Morse (blink test) - press q to quit", frame)
            if cv2.waitKey(1) & 0xFF == ord("q"):
                break
    finally:
        detector.close()
        cap.release()
        cv2.destroyAllWindows()


if __name__ == "__main__":
    main()