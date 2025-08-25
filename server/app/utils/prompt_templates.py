from langchain_core.prompts import PromptTemplate

quiz_prompt = PromptTemplate.from_template(
    """You are an expert quiz generator.
Generate {num_questions} multiple choice questions on the topic: "{topic}" 
for a student at the {level} level. 
Format as JSON like this:
the correct answer indexing should be 0 based
{{
  "quiz": [
    {{
      "id": 1,
      "question": "Which of the following is NOT a JavaScript data type?",
      "options": ["String", "Boolean", "Float", "Object"],
      "correctAnswer": 2,
      "explanation": "JavaScript has Number type (which includes integers and floating-point numbers), not a separate Float type.",
    }},
    ...
  ]
}}Please return the quiz in VALID JSON format, with all field names and strings enclosed in double quotes."""
)
