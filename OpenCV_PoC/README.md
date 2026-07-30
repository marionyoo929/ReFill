# Product Recognition PoC

Opens a camera window, identifies a product using Claude Vision, stores it in **Firebase Firestore**, and returns structured product info. Built for hackathon integration with a React + Firebase web project.

---

## How it works

1. Camera opens in a desktop window
2. User points camera at any product and presses **SPACE**
3. Existing Firestore catalog is passed to Claude Vision → Claude matches against known products or identifies new ones
4. If matched in catalog → returns Firestore data instantly (no extra API cost)
5. If new → auto-added to Firestore with `source: "llm"`, then returned

**ESC** cancels and returns `null`.

---

## Setup

### 1. Firebase service account key

Go to **Firebase Console → Project Settings → Service accounts → Generate new private key**.

Download the JSON file and save it as `serviceAccountKey.json` in this directory.

> Never commit `serviceAccountKey.json` to git. Add it to `.gitignore`.

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Set Anthropic API key

```bash
cp .env.example .env
# Edit .env → ANTHROPIC_API_KEY=sk-ant-...
```

### 4. Smoke test

```bash
python main.py
```

macOS will prompt for camera permission on the first run.

---

## Return value

```json
{
  "product_id": "eclipse-캔디-스피아민트",
  "name": "Eclipse 캔디 스피아민트",
  "unit": "1통",
  "repurchase_period_days": 30,
  "source": "llm",
  "scanned_at": "2026-07-29T14:00:00.000000"
}
```

Returns `None` if the user cancels (ESC) or the product cannot be identified.

---

## Direct Python import

```python
from recognizer import recognize_and_insert
from db import init_db

init_db()  # call once at startup

result = recognize_and_insert()
if result:
    print(result["name"], result["repurchase_period_days"])
```

---

## Web integration — local HTTP bridge

Because this PoC opens a **desktop camera window**, it cannot run inside a browser. The recommended pattern for a React web app is:

```
[React button click] → HTTP POST → [Python local server] → [camera window opens] → returns JSON → [React receives result]
```

The product catalog now lives in **Firestore**, so the React app can read it directly — no need to go through the Python server for catalog queries.

### 1. Add Flask to the PoC

```bash
pip install flask flask-cors
```

Create `server.py`:

```python
from flask import Flask, jsonify
from flask_cors import CORS
from db import init_db
from recognizer import recognize_and_insert

app = Flask(__name__)
CORS(app)

init_db()

@app.route("/scan", methods=["POST"])
def scan():
    result = recognize_and_insert()
    if result is None:
        return jsonify({"status": "cancelled"}), 200
    return jsonify({"status": "ok", "product": result}), 200

if __name__ == "__main__":
    app.run(port=5050)
```

```bash
python server.py
```

---

### 2. Call from React

```tsx
// hooks/useProductScan.ts
import { useState } from "react";

export type Product = {
  product_id: string;
  name: string;
  unit: string;
  repurchase_period_days: number;
  source: string;
  scanned_at: string;
};

export function useProductScan() {
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);

  const scan = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5050/scan", { method: "POST" });
      const data = await res.json();
      if (data.status === "ok") {
        setProduct(data.product);
      }
    } finally {
      setLoading(false);
    }
  };

  return { scan, loading, product };
}
```

---

### 3. Read the product catalog directly from Firestore (React)

Since the catalog is now in Firestore, the React app can query it directly without going through the Python server:

```tsx
// hooks/useProductCatalog.ts
import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase"; // your initialized Firestore instance
import { Product } from "./useProductScan";

export function useProductCatalog() {
  const [catalog, setCatalog] = useState<Product[]>([]);

  useEffect(() => {
    // Real-time listener — updates automatically when Python server adds a new product
    const unsub = onSnapshot(collection(db, "products"), (snapshot) => {
      setCatalog(snapshot.docs.map((d) => d.data() as Product));
    });
    return unsub;
  }, []);

  return { catalog };
}
```

The `onSnapshot` listener means the React UI updates in real time the moment the Python server adds a newly scanned product to Firestore — no polling, no manual refresh needed.

---

### 4. Save scan history to Firestore (React)

The Python server already writes to the `scan_log` collection. If you also want to save scan history under a specific user in Firestore from the React side:

```tsx
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

async function saveUserScan(product: Product, userId: string) {
  await addDoc(collection(db, "users", userId, "scanned_products"), {
    ...product,
    savedAt: serverTimestamp(),
  });
}
```

Call it after a successful scan:

```tsx
const { scan, product } = useProductScan();

const handleScan = async () => {
  await scan();
  if (product) {
    await saveUserScan(product, currentUser.uid);
  }
};
```

---

## Firestore structure

```
products/
  {product_id}/
    product_id: "eclipse-캔디-스피아민트"
    name: "Eclipse 캔디 스피아민트"
    unit: "1통"
    repurchase_period_days: 30
    source: "llm" | "hardcoded"

scan_log/
  {auto_id}/
    product_id: "eclipse-캔디-스피아민트"
    scanned_at: "2026-07-29T14:00:00"

users/
  {userId}/
    scanned_products/
      {auto_id}/
        product_id: "eclipse-캔디-스피아민트"
        name: "Eclipse 캔디 스피아민트"
        ...
        savedAt: Timestamp
```

---

## Pre-seeding the catalog

To add known products before any scanning:

```bash
python -c "
from db import init_db, add_product
init_db()
add_product('Eclipse 캔디 스피아민트', '1통', 30, 'hardcoded')
"
```

---

## Notes for the web team

- **The Python server must be running locally** on the demo machine before the scan button works. Run `python server.py` once and leave it open.
- The camera window opens as a **native desktop window** — this is expected. The React UI stays open in the browser alongside it.
- `ANTHROPIC_API_KEY` and `serviceAccountKey.json` must both be present on the machine running the Python server.
- Both the Python server and the React app talk to the **same Firebase project** — the catalog is shared automatically.
- CORS is open (`*`) for development. Lock it down to your dev origin before any public demo.

---

## File structure

```
OpenCV_PoC/
├── main.py               # standalone demo runner
├── server.py             # Flask HTTP bridge for web integration  ← create this
├── recognizer.py         # core function: recognize_and_insert()
├── llm_lookup.py         # Claude Vision API + Firestore catalog matching
├── db.py                 # Firebase Admin SDK — Firestore read/write
├── requirements.txt
├── serviceAccountKey.json  # Firebase service account  ← git-ignored
├── .env                  # ANTHROPIC_API_KEY  ← git-ignored
└── .env.example
```
