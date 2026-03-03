import cv2
from ai.morse_detector import MorseDetector


def main():
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Could not open webcam.")
        return

    detector = MorseDetector()

    print("Local AI test running.")
    print("Left blink => DOT | Right blink => DASH | Both blink => DASH")
    print("Press Q to quit.")

    while True:
        ok, frame = cap.read()
        if not ok:
            break

        # Encode to JPEG bytes to simulate what frontend would send
        ok2, buf = cv2.imencode(".jpg", frame, [int(cv2.IMWRITE_JPEG_QUALITY), 80])
        if ok2:
            signal = detector.process(buf.tobytes())
            if signal:
                print("SIGNAL:", signal)

        cv2.imshow("Face-to-Morse AI Test", frame)
        if (cv2.waitKey(1) & 0xFF) in (ord("q"), ord("Q")):
            break

    cap.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    main()
