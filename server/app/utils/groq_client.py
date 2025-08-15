from langchain_groq import ChatGroq
import os
from dotenv import load_dotenv

load_dotenv()

def get_groq_model():
    return ChatGroq(
        api_key=os.getenv("GROQ_API_KEY"),
        model="llama3-70b-8192"  # or mixtral-8x7b-32768
    )
