from app.utils.groq_client import get_groq_model
def get_topic_explanation(topic, level):
    prompt = f"""
    Explain the topic "{topic}" in a simple and clear way suitable for a student in {level}.
    Keep the explanation short, easy to understand, and focused.
    """
    llm = get_groq_model()
    response = llm.invoke(prompt)
    return response
