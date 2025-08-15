from flask import request, jsonify
from app.utils.langchain_model import get_topic_explanation

def explain_topic():
    data = request.json
    topic = data.get('topic')
    student_level = data.get('level', 'intermediate')

    if not topic:
        return jsonify({'error': 'Topic is required'}), 400

    try:
        explanation = get_topic_explanation(topic, student_level)
        return jsonify({'explanation': explanation.content})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
