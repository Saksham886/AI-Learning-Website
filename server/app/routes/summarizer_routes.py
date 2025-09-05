# app/routes/summarizer_routes.py
import datetime
from flask import Blueprint, request, jsonify, send_file
from io import BytesIO
from fpdf import FPDF
import pdfplumber
import requests
from bs4 import BeautifulSoup

import re
# Langchain imports
from langchain_community.document_loaders import YoutubeLoader
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
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)
    pdf.set_auto_page_break(auto=True, margin=15)
    
    # Replace unsupported characters with '?'
    safe_text = summary_text.encode("latin-1", "replace").decode("latin-1")
    
    for line in safe_text.split('\n'):
        pdf.multi_cell(0, 10, line)
    
    return pdf.output(dest='S').encode('latin1')

def load_pdf_from_memory(file):
    docs = []
    with pdfplumber.open(file) as pdf:
        text = ""
        for page in pdf.pages:
            text += page.extract_text() + "\n"
        docs.append(Document(page_content=text))
    return docs

def get_youtube_transcript_langchain(url):
    try:
        loader = YoutubeLoader.from_youtube_url(
            url,
            add_video_info=True,  # Adds title, description, etc.
            language=["en", "es", "fr", "de", "hi"],  # Multiple language support
            translation="en"  # Translate to English if needed
        )
        
        # Load the document
        documents = loader.load()
        
        if not documents or not documents[0].page_content.strip():
            raise Exception("No transcript available for this video")
            
        return documents[0]  # Return the Document object directly
        
    except Exception as e:
        error_msg = str(e)
        if "transcript" in error_msg.lower() or "subtitle" in error_msg.lower():
            raise Exception("This YouTube video doesn't have transcripts/subtitles available. Please try a different video with subtitles enabled.")
        else:
            raise Exception(f"Could not retrieve transcript: {error_msg}")
        
def scrape_regular_url(url):
    """Scrape non-YouTube URLs using requests + BeautifulSoup"""
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Remove unwanted elements
        for element in soup(['script', 'style', 'nav', 'header', 'footer', 'aside']):
            element.decompose()
        
        # Try to find main content areas first
        main_content = soup.find('main') or soup.find('article') or soup.find('div', class_=['content', 'main-content', 'post-content'])
        
        if main_content:
            text = main_content.get_text(strip=True, separator='\n')
        else:
            text = soup.get_text(strip=True, separator='\n')
            
        if len(text.strip()) < 100:
            raise Exception("Could not extract sufficient content from this URL")
            
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
            try:
                # Use LangChain YouTube loader
                document = get_youtube_transcript_langchain(url) 
                documents = [document]
            except Exception as e:
                print(e)
                return jsonify({
                    "error": str(e)
                    
                }), 400
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
