import jwt
from flask import request, jsonify
from functools import wraps
import os
from datetime import datetime, timedelta

# Secret key from .env or fallback
SECRET_KEY = os.getenv("JWT_SECRET")

# Generate JWT
def generate_jwt(payload, expires_in=24):
    payload_copy = payload.copy()
    payload_copy["exp"] = datetime.utcnow() + timedelta(hours=expires_in)
    token = jwt.encode(payload_copy, SECRET_KEY, algorithm="HS256")
    return token

# Decode JWT
def decode_jwt(token):
    try:
        decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return decoded
    except jwt.ExpiredSignatureError:
        return {"error": "Token expired"}
    except jwt.InvalidTokenError:
        return {"error": "Invalid token"}

# Flask decorator to protect routes
def jwt_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if "Authorization" in request.headers:
            token = request.headers["Authorization"].split(" ")[1]  # "Bearer <token>"
        if not token:
            return jsonify({"error": "Missing token"}), 401

        decoded = decode_jwt(token)
        if "error" in decoded:
            return jsonify(decoded), 401

        return f(decoded, *args, **kwargs)  # Pass decoded payload to route
    return decorated
