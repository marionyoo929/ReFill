from datetime import datetime

import cv2

from db import get_product, get_all_products, add_product, log_scan
from llm_lookup import lookup_by_image


def _draw_overlay(frame, text: str, color=(255, 255, 255)):
    cv2.putText(
        frame, text,
        (10, 30),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.8,
        color,
        2,
        cv2.LINE_AA,
    )


def recognize_and_insert() -> dict | None:
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("[recognizer] Cannot open camera.")
        return None

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                continue

            display = frame.copy()
            _draw_overlay(display, "SPACE: scan  |  ESC: cancel")
            cv2.imshow("Product Scanner", display)

            key = cv2.waitKey(1) & 0xFF

            if key == 27:  # ESC
                break

            if key == 32:  # SPACE
                identifying = frame.copy()
                _draw_overlay(identifying, "Identifying...", color=(0, 200, 255))
                cv2.imshow("Product Scanner", identifying)
                cv2.waitKey(1)

                catalog = get_all_products()
                result = lookup_by_image(frame, catalog)

                if result is None:
                    error_frame = frame.copy()
                    _draw_overlay(error_frame, "Cannot identify. Try again.", color=(0, 0, 255))
                    cv2.imshow("Product Scanner", error_frame)
                    cv2.waitKey(1500)
                    continue

                if result["matched"]:
                    # DB hit via LLM — fetch full record
                    product = get_product(result["product_id"])
                else:
                    # New product — add to DB then fetch
                    product_id = add_product(
                        name=result["name"],
                        unit=result["unit"],
                        repurchase_period_days=result["repurchase_period_days"],
                        source="llm",
                    )
                    product = get_product(product_id)

                if product is None:
                    continue

                log_scan(product["product_id"])
                return {**product, "scanned_at": datetime.now().isoformat()}

    finally:
        cap.release()
        cv2.destroyAllWindows()

    return None
