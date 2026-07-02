import asyncio
import os
import sys

sys.path.append(os.path.abspath(os.path.dirname(__file__)))
from services.doc_processor import generate_stunning_pdf
import traceback

data = {
    "personal": {"name": "Test User"},
    "summary": "This is a test summary."
}

def main():
    try:
        path = generate_stunning_pdf(data, "test.pdf")
        print(f"Success: {path}")
    except Exception as e:
        print("ERROR OCCURRED:")
        traceback.print_exc()

main()
