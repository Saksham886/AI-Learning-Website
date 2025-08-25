from flask import request, jsonify
import json,re
from app.utils.groq_client import get_groq_model
from app.utils.prompt_templates import quiz_prompt
from langchain_core.runnables import RunnableSequence

def extract_json(content: str):
    # Try to capture JSON inside triple backticks
    match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", content, re.DOTALL)
    if match:
        return match.group(1)

    # Fallback: try to find first {...} block
    match = re.search(r"(\{.*\})", content, re.DOTALL)
    if match:
        return match.group(1)

    return None

def generate_quiz():
    data = request.json
    topic = data.get("topic")
    level = data.get("level", "high school")
    num_questions = data.get("num_questions", 5)

    if not topic:
        return jsonify({"error": "Topic is required"}), 400

    llm = get_groq_model()
    chain = RunnableSequence(quiz_prompt | llm)

    prompt_input = {
        "topic": topic,
        "level": level,
        "num_questions": num_questions
    }
    try:
        result = chain.invoke(prompt_input)
        content = result.content
        json_str = extract_json(content)

        if not json_str:
            return jsonify({"error": "No JSON found", "raw": content})

        try:
                quiz_data = json.loads(json_str)
                return jsonify(quiz_data)
        except json.JSONDecodeError as e:
            return jsonify({"error": "Invalid JSON from LLM", "raw": json_str, "details": str(e)})

    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500