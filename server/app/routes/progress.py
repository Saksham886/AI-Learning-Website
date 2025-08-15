from flask import request, jsonify
from app.utils.jwt_utils import decode_jwt
from app.models.progress_model import save_quiz, get_user_progress,save_explanation
from pymongo import MongoClient
from datetime import datetime
import os

mongo = MongoClient(os.getenv("MONGO_URI"))
db = mongo["edugenie"]

def save_quiz_result():
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    data = request.json

    if not data:
        return jsonify({"error": "Quiz result data is required"}), 400

    try:
        # Decode JWT token to get user_id
        payload = decode_jwt(token)
        user_id = payload.get("sub")
        if not user_id:
            return jsonify({"error": "Invalid token"}), 401

        # Extract quiz fields from request
        topic = data.get("topic")
        score = data.get("score")
        total_questions = data.get("totalQuestions")
        level = data.get("level")
        questions = data.get("questions", [])
        time_spent = data.get("timeSpent")

        if not topic or score is None or total_questions is None:
            return jsonify({"error": "Missing required quiz result fields"}), 400

        # Save both summary progress and full quiz details
        save_quiz(
            user_id=user_id,
            topic=topic,
            quiz_score=score,
            total_questions=total_questions,
            level=level,
            questions=questions,
            time_spent=time_spent
        )

        return jsonify({"message": "Quiz result saved successfully"})

    except Exception as e:
        return jsonify({"error": str(e)}), 401

def save_explanation_result():
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    data = request.json

    if not data:
        return jsonify({"error": "Quiz result data is required"}), 400

    try:
        # Decode JWT token to get user_id
        payload = decode_jwt(token)
        user_id = payload.get("sub")
        if not user_id:
            return jsonify({"error": "Invalid token"}), 401
        # Extract fields
        topic = data.get("topic")
        level = data.get("level")
        explanation = data.get("explanation")

        # Validate required fields
        if not topic or not level or not explanation:
            return jsonify({"error": "Missing required explanation fields"}), 400

        # Save/update explanation
        save_explanation(
            user_id=user_id,
            topic=topic,
            level=level,
            explanation=explanation
        )

        return jsonify({"message": "Explanation saved successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

def get_progress():
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if not token:
        return jsonify({"error": "Missing token"}), 401

    try:
        payload = decode_jwt(token)
        user_id = payload.get("sub")
        type_filter = request.args.get("type", "all").lower()

        quiz_data = list(db.quiz_result.find({"user_id": user_id}, {"_id": 0}))
        explanation_data = list(db.explanations.find({"user_id": user_id}, {"_id": 0}))

        for q in quiz_data:
            q["type"] = "quiz"
        for e in explanation_data:
            e["type"] = "explanation"

        if type_filter == "quiz":
            data = quiz_data
        elif type_filter == "explanation":
            data = explanation_data
        else:
            data = quiz_data + explanation_data

        return jsonify({"items": data})

    except Exception as e:
        return jsonify({"error": str(e)}), 401

def get_quiz_result(topic):
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    payload = decode_jwt(token)
    user_id = payload.get("sub")

    # Find quiz result for this user and topic
    result = db.quiz_result.find_one({"user_id": user_id, "topic": topic})
    # print(result)
    if not result:
        return jsonify({"error": "Result not found"}), 404
    # Convert Mongo result to dict (if it's a pymongo object)
    result["_id"] = str(result["_id"])  # Convert ObjectId to string
    print("after converting ",result)
    return jsonify(result), 200