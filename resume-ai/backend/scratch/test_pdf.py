import asyncio
import os
import sys

sys.path.append(os.path.abspath(os.path.dirname(__file__)))
from services.doc_processor import generate_stunning_pdf

data = {
    "personal": {"name": "Test"},
    "summary": "This is a test."
}

async def main():
    try:
        path = await generate_stunning_pdf(data, "test.pdf")
        print(f"Success: {path}")
    except Exception as e:
        import traceback
        traceback.print_exc()

asyncio.run(main())
