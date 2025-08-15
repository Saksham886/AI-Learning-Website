from pymongo import MongoClient
from datetime import datetime
import os

mongo = MongoClient(os.getenv("MONGO_URI"))
db = mongo["edugenie"]

def save_quiz(user_id, topic, quiz_score, total_questions, level, questions, time_spent):
    """
    Saves or updates quiz progress for a topic.
    Stores all details including questions in one collection.
    Adds a 'type' field for filtering.
    """
    db.quiz_result.update_one(
        {"user_id": user_id, "topic": topic, "type": "quiz"},
        {
            "$set": {
                "quiz_score": quiz_score,
                "total_questions": total_questions,
                "level": level,
                "questions": questions,
                "time_spent": time_spent,
                "completed": True,
                "updated_at": datetime.utcnow(),
                "type": "quiz"
            },
            "$setOnInsert": {
                "created_at": datetime.utcnow()
            }
        },
        upsert=True
    )
    return {"status": "success", "message": "Quiz saved successfully"}


def save_explanation(user_id, topic, level, explanation):
    """
    Stores an explanation for a topic along with level and user ID.
    Adds a 'type' field for filtering.
    If the same user adds an explanation for the same topic & level,
    it updates the existing record.
    """
    db.explanations.update_one(
        {"user_id": user_id, "topic": topic, "level": level, "type": "explanation"},
        {
            "$set": {
                "explanation": explanation,
                "updated_at": datetime.utcnow(),
                "type": "explanation"
            },
            "$setOnInsert": {
                "created_at": datetime.utcnow()
            }
        },
        upsert=True
    )
    return {"status": "success", "message": "Explanation saved successfully"}

def get_user_progress(user_id):
    return list(db.progress.find({"user_id": user_id}, {"_id": 0}))
