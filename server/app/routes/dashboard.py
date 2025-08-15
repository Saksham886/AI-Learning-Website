from flask import jsonify, request
from app.utils.jwt_utils import decode_jwt
from app.models.progress_model import get_user_progress
from pymongo import MongoClient
from datetime import datetime
import os

mongo = MongoClient(os.getenv("MONGO_URI"))
db = mongo["edugenie"]
# def get_dashboard_data():
#     auth_header = request.headers.get("Authorization")
#     if not auth_header:
#         return jsonify({"error": "Missing token"}), 401

#     token = auth_header.split(" ")[1]
#     try:
#         decoded = decode_jwt(token)
#         user_id = decoded["sub"]
#     except Exception as e:
#         return jsonify({"error": "Invalid token"}), 401

#     progress = get_user_progress(user_id)
#     print(progress)

#     if not progress:
#         return jsonify({
#             "completed_topics": 0,
#             "total_topics": 0,
#             "percentage_complete": 0,
#             "recent_topics": []
#         })

#     topics = progress  # here progress is already a list of dicts

#     completed = [t for t in topics if t.get("completed")]
#     in_progress = [t for t in topics if not t.get("completed")]
#     total_topics = len(topics)
#     completed_count = len(completed)

#     percentage_complete = round((completed_count / total_topics) * 100, 2) if total_topics else 0

#     recent_topics = sorted(topics, key=lambda x: x.get("updated_at", ""), reverse=True)[:5]

#     return jsonify({
#         "completed_topics": completed_count,
#         "in_progress_topics": len(in_progress),
#         "total_topics": total_topics,
#         "percentage_complete": percentage_complete,
#         "recent_topics": recent_topics
#     })
def get_dashboard_data():
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        return jsonify({"error": "Missing token"}), 401

    token = auth_header.split(" ")[1]
    try:
        decoded = decode_jwt(token)
        user_id = decoded["sub"]
    except Exception as e:
        return jsonify({"error": "Invalid token"}), 401
    try:
        # 1️⃣ Total quiz given
        quiz_count = db.quiz_result.count_documents({"user_id": user_id})
        print(quiz_count)
        # 2️⃣ Total topics explained
        topics_count = db.explanations.count_documents({"user_id": user_id})

        # 3️⃣ Average quiz percentage
        quiz_results = db.quiz_result.find({"user_id": user_id})
        scores = []
        for q in quiz_results:
            total_q = q.get("total_questions", 0)
            score = q.get("quiz_score", 0)
            if total_q > 0:
                scores.append((score / total_q) * 100)  # percentage for each quiz

        avg_percent = round(sum(scores) / len(scores), 2) if scores else 0


        return jsonify({
            "total_quiz_given": quiz_count,
            "total_topics_explained": topics_count,
            "avg_quiz_percent": avg_percent
        }), 200

    except Exception as e:
        return jsonify({"message": str(e)}), 500