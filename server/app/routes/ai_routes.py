from flask import Blueprint
from app.routes.quiz import generate_quiz
from app.routes.explain import explain_topic
ai_bp = Blueprint("ai", __name__)


@ai_bp.route("/quiz", methods=["POST"])
def quiz():
    return generate_quiz()

@ai_bp.route("/explain", methods=["POST"])
def explain():
    return explain_topic()