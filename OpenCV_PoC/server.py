from flask import Flask, jsonify
from flask_cors import CORS

from db import init_db, get_all_products
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


@app.route("/products", methods=["GET"])
def products():
    return jsonify(get_all_products()), 200


if __name__ == "__main__":
    app.run(port=5050)
