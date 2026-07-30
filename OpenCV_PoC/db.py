import re
from datetime import datetime

import firebase_admin
from firebase_admin import credentials, firestore

_db = None


def _to_product_id(name: str) -> str:
    s = name.lower().strip()
    s = re.sub(r"\s+", "-", s)
    s = re.sub(r"[^a-z0-9가-힣-]", "", s)
    return s


def init_db():
    global _db
    if not firebase_admin._apps:
        cred = credentials.Certificate("serviceAccountKey.json")
        firebase_admin.initialize_app(cred)
    _db = firestore.client()


def _client():
    if _db is None:
        raise RuntimeError("Call init_db() before using the database.")
    return _db


def get_product(product_id: str) -> dict | None:
    doc = _client().collection("products").document(product_id).get()
    return doc.to_dict() if doc.exists else None


def get_product_by_name(name: str) -> dict | None:
    return get_product(_to_product_id(name))


def get_all_products() -> list[dict]:
    return [doc.to_dict() for doc in _client().collection("products").stream()]


def add_product(name: str, unit: str, repurchase_period_days: int, source: str = "llm") -> str:
    product_id = _to_product_id(name)
    _client().collection("products").document(product_id).set({
        "product_id": product_id,
        "name": name,
        "unit": unit,
        "repurchase_period_days": repurchase_period_days,
        "source": source,
    })
    return product_id


def log_scan(product_id: str):
    _client().collection("scan_log").add({
        "product_id": product_id,
        "scanned_at": datetime.now().isoformat(),
    })
