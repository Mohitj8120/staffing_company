import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.llm_service import parse_resume

try:
    print("Testing parse_resume...")
    result = parse_resume("Mohit\nSoftware Engineer\n5 years of experience")
    print("Success:", result)
except Exception as e:
    import traceback
    traceback.print_exc()
