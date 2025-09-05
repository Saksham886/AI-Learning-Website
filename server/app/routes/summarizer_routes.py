# app/routes/summarizer_routes.py
import datetime
from flask import Blueprint, request, jsonify, send_file
from io import BytesIO
from fpdf import FPDF
import pdfplumber
import requests
from bs4 import BeautifulSoup
import trafilatura
from youtube_transcript_api import YouTubeTranscriptApi
import re


# Langchain imports
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.prompts import PromptTemplate
from langchain.chains.summarize import load_summarize_chain
from langchain_groq import ChatGroq
from langchain.schema import Document

import os
import sys
import asyncio

# ==== Fix for Windows Event Loop ====
if sys.platform.startswith('win'):
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

# ==== Init Blueprint ====
summarizer_bp = Blueprint("summarizer", __name__)

# ==== Load LLM ====
llm = ChatGroq(model="gemma2-9b-it", api_key=os.getenv("GROQ_API_KEY"))

# ==== Helper Functions ====
def create_pdf(summary_text):
    try:
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", size=12)
        for line in summary_text.split('\n'):
            pdf.multi_cell(0, 10, line)
        return pdf.output(dest='S').encode('latin1')
    except UnicodeEncodeError:
        return None

def load_pdf_from_memory(file):
    docs = []
    with pdfplumber.open(file) as pdf:
        text = ""
        for page in pdf.pages:
            text += page.extract_text() + "\n"
        docs.append(Document(page_content=text))
    return docs
def extract_video_id(url):
    """Extract video ID from YouTube URL"""
    pattern = r'(?:v=|\/)([0-9A-Za-z_-]{11}).*'
    match = re.search(pattern, url)
    return match.group(1) if match else None
# URL Summarizer
def get_youtube_transcript(url):
    """Get YouTube transcript"""
    video_id = extract_video_id(url)
    if not video_id:
        raise ValueError("Invalid YouTube URL")
    
    try:
        transcript_list = YouTubeTranscriptApi.get_transcript(video_id)
        transcript_text = ' '.join([item['text'] for item in transcript_list])
        return Document(page_content=transcript_text)
    except Exception as e:
        raise Exception(f"Could not retrieve transcript: {str(e)}")

def scrape_regular_url(url):
    """Scrape non-YouTube URLs"""
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    try:
        # Try trafilatura first (better for articles)
        downloaded = trafilatura.fetch_url(url)
        if downloaded:
            text = trafilatura.extract(downloaded)
            if text and len(text.strip()) > 100:
                return [Document(page_content=text)]
        
        # Fallback to requests + BeautifulSoup
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Remove unwanted elements
        for element in soup(['script', 'style', 'nav', 'header', 'footer']):
            element.decompose()
        
        text = soup.get_text(strip=True, separator='\n')
        return [Document(page_content=text)]
        
    except Exception as e:
        raise Exception(f"Failed to scrape URL: {str(e)}")
# ==== Prompt Templates ====
basic_prompt_template = PromptTemplate(
    input_variables=["text","ln"],
    template="""
You are a helpful assistant. Summarize the following content in {ln} language.
Keep the summary clear, concise, and ~300 words.

Content:
{text}
"""
)

map_prompt_template = PromptTemplate(
    input_variables=["text"],
    template="Please summarize the below text:\n\n{text}\n\nSummary:\n"
)

combine_prompt_template = PromptTemplate(
    input_variables=["text","ln"],
    template="""
Provide the final summary with important points.
Add a Title, intro, and present the summary as numbered points in {ln}.

Content:
{text}
"""
)

# ==== Routes ====
@summarizer_bp.route("/url", methods=["POST"])
def summarize_url():
    try:
        data = request.json
        url = data.get("url")
        ln = data.get("language", "English")
        
        if not url:
            return jsonify({"error": "URL is required"}), 400
        
        if "youtube.com" in url or "youtu.be" in url:
            documents = [get_youtube_transcript(url)]
        else:
            documents = scrape_regular_url(url)
        
        chain = load_summarize_chain(
            llm=llm,
            chain_type="stuff",
            prompt=basic_prompt_template
        )
        
        response = chain.invoke({
            "input_documents": documents,
            "text": documents[0].page_content,
            "ln": ln
        })
        
        return jsonify({"summary": response["output_text"]})
    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500



# PDF Summarizer
@summarizer_bp.route("/pdf", methods=["POST"])
def summarize_pdf():
    try:
        if "file" not in request.files:
            return jsonify({"error": "PDF file is required"}), 400

        file = request.files["file"]
        ln = request.form.get("language", "English")

        docs = load_pdf_from_memory(file)

        final_documents = RecursiveCharacterTextSplitter(
            chunk_size=2000, chunk_overlap=100
        ).split_documents(docs)

        summary_chain = load_summarize_chain(
            llm=llm,
            chain_type="map_reduce",
            map_prompt=map_prompt_template,
            combine_prompt=combine_prompt_template
        )

        response = summary_chain.invoke({
            "input_documents": final_documents,
            "text": final_documents[0].page_content,
            "ln": ln
        })

        return jsonify({"summary": response["output_text"]})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


