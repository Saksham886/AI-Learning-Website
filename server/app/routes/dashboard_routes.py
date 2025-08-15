from flask import Blueprint, jsonify, request
from app.routes.dashboard import get_dashboard_data
from app.routes.progress import save_quiz_result,get_progress,save_explanation_result,get_quiz_result
dashboard_bp = Blueprint("dashboard", __name__)

@dashboard_bp.route("/", methods=["GET"])
def dashboard():
    return get_dashboard_data()

@dashboard_bp.route('/progress', methods=['GET'])
def report():
    return get_progress()

@dashboard_bp.route('/save/quiz',methods=['POST'])
def save_quiz_route():
    return save_quiz_result()

@dashboard_bp.route('/save/explanation',methods=['POST'])
def save_explanation_route():
    return save_explanation_result()

@dashboard_bp.route('/quiz-result/<string:topic>',methods=['GET'])
def getquizresult(topic):
    return get_quiz_result(topic)