import base64
import json
import re

import anthropic
import cv2
from dotenv import load_dotenv

load_dotenv()

_client = None


def _get_client() -> anthropic.Anthropic:
    global _client
    if _client is None:
        _client = anthropic.Anthropic()
    return _client


_SYSTEM = """You are a product identification assistant for a shopping repurchase tracker.

You will receive:
1. An image of a product
2. An existing product catalog (JSON array)

Your job:
- First try to match the product in the image to an existing catalog entry.
- If matched, return ONLY:
  {"matched": true, "product_id": "<existing product_id>"}

- If the product is NOT in the catalog, identify it and return ONLY:
  {"matched": false, "name": "<Korean name>", "unit": "<e.g. 1통/1개/1박스>", "repurchase_period_days": <integer>}

- If you cannot identify the product at all, return ONLY:
  {"error": "unknown"}

Return ONLY the JSON object. No explanation, no markdown."""


def lookup_by_image(frame, existing_products: list[dict]) -> dict | None:
    _, buf = cv2.imencode(".jpg", frame)
    image_b64 = base64.standard_b64encode(buf).decode("utf-8")

    catalog_json = json.dumps(
        [{"product_id": p["product_id"], "name": p["name"]} for p in existing_products],
        ensure_ascii=False,
    )

    try:
        message = _get_client().messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=256,
            system=_SYSTEM,
            messages=[{
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": "image/jpeg",
                            "data": image_b64,
                        },
                    },
                    {
                        "type": "text",
                        "text": f"Existing catalog:\n{catalog_json}\n\nIdentify the product in the image.",
                    },
                ],
            }],
        )
        text = message.content[0].text.strip()
    except Exception as e:
        print(f"[llm_lookup] API error: {e}")
        return None

    match = re.search(r"\{.*\}", text, re.DOTALL)
    if not match:
        print(f"[llm_lookup] No JSON in response: {text!r}")
        return None

    try:
        data = json.loads(match.group())
    except json.JSONDecodeError as e:
        print(f"[llm_lookup] JSON parse error: {e}")
        return None

    if data.get("error") == "unknown":
        return None

    if data.get("matched"):
        if "product_id" not in data:
            print(f"[llm_lookup] matched=true but no product_id: {data}")
            return None
        return {"matched": True, "product_id": data["product_id"]}

    required = {"name", "unit", "repurchase_period_days"}
    if not required.issubset(data):
        print(f"[llm_lookup] Missing keys in new-product response: {data}")
        return None

    return {
        "matched": False,
        "name": str(data["name"]),
        "unit": str(data["unit"]),
        "repurchase_period_days": int(data["repurchase_period_days"]),
    }
