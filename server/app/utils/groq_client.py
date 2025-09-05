from langchain_groq import ChatGroq
import os
from dotenv import load_dotenv

load_dotenv()

def get_groq_model():
    return ChatGroq(
        api_key=os.getenv("GROQ_API_KEY"),
        model="gemma2-9b-it" 
    )
