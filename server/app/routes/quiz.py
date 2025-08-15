from flask import request, jsonify
import json,re
from app.utils.groq_client import get_groq_model
from app.utils.prompt_templates import quiz_prompt
from langchain_core.runnables import RunnableSequence

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

        # Optional: strip Markdown code block markers if present
        match = re.search(r"```(?:json)?\s*(.*?)\s*```", content, re.DOTALL)
        if match:
            content = match.group(1)

        # Parse the JSON string into Python object
        try:
            quiz_data = json.loads(content)  # This should be a dict like {"quiz": [...]}
        except json.JSONDecodeError:
            # If parsing fails, just return an error
            return jsonify({"error": "Invalid JSON from LLM", "raw": content})
        finally:
            # If quiz_data is {"quiz": [...]}, you can return that directly
            return jsonify(quiz_data)
    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500