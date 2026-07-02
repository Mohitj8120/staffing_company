import os
import sys

# Add backend directory to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from google import genai
from core.config import settings

client = genai.Client(api_key=settings.GEMINI_API_KEY)
for m in client.models.list():
    print(m.name)
