from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.models.user_model import get_user_collection
from app.services.auth_service import hash_password, verify_password
from config import Config
from pymongo import MongoClient
import bson

auth_bp = Blueprint("auth", __name__)
mongo = MongoClient(Config.MONGO_URI)
db = mongo["edugenie"]
users = get_user_collection(db)

@auth_bp.route("/signup", methods=["POST"])
def register():
    data = request.json
    email = data.get("email")
    password = data.get("password")
    name = data.get("name")

    if users.find_one({"email": email}):
        return jsonify({"error": "User already exists"}), 409

    hashed_pw = hash_password(password)
    users.insert_one({
        "name": name,
        "email": email,
        "password": hashed_pw
    })

    return jsonify({"message": "User registered successfully"}), 201

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    user = users.find_one({"email": email})
    if not user or not verify_password(password, user["password"]):
        return jsonify({"error": "Invalid credentials"}), 401

    token = create_access_token(identity=str(user["_id"]))
    return jsonify({"access_token": token}), 200

@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user = users.find_one({"_id": bson.ObjectId(user_id)}, {"password": 0})
    user["_id"] = str(user["_id"])
    return jsonify(user)
