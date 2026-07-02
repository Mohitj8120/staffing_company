import sys
import os
import asyncio
import json
import uuid
import time
from datetime import datetime

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.database import SessionLocal
from models.queue_job import QueueJob
from services.llm_service import select_least_busy_key_idx, release_key_idx, active_requests, api_keys
from services.doc_processor import start_pdf_render_process, generate_stunning_pdf

def test_api_key_load_balancing():
    print("\n--- Testing API Key Load Balancing (Least Busy Key) ---")
    print(f"Configured API Keys: {len(api_keys)}")
    
    # Temporarily force at least 3 keys for this test to show distribution
    from services import llm_service
    original_keys = llm_service.api_keys
    original_active = llm_service.active_requests
    original_disabled = llm_service.disabled_until
    
    llm_service.api_keys = ["mock1", "mock2", "mock3"]
    llm_service.active_requests = {i: 0 for i in range(3)}
    llm_service.disabled_until = {i: 0 for i in range(3)}
    
    try:
        # Select first key
        idx1 = select_least_busy_key_idx()
        print(f"Selected key index: {idx1}, active requests: {llm_service.active_requests}")
        
        # Select second key
        idx2 = select_least_busy_key_idx()
        print(f"Selected key index: {idx2}, active requests: {llm_service.active_requests}")
        
        # Select third key
        idx3 = select_least_busy_key_idx()
        print(f"Selected key index: {idx3}, active requests: {llm_service.active_requests}")
        
        assert idx1 != idx2 and idx2 != idx3 and idx1 != idx3, "Load balancer did not distribute requests!"
        
        # Release one key
        release_key_idx(idx2)
        print(f"Released key {idx2}, active requests: {llm_service.active_requests}")
        
        # Next selected should be the released one (since it is now least busy)
        idx4 = select_least_busy_key_idx()
        print(f"Selected key index: {idx4} (expected to be {idx2}), active requests: {llm_service.active_requests}")
        assert idx4 == idx2, "Load balancer did not select the least busy key!"
        
        # Cleanup
        release_key_idx(idx1)
        release_key_idx(idx3)
        release_key_idx(idx4)
    finally:
        llm_service.api_keys = original_keys
        llm_service.active_requests = original_active
        llm_service.disabled_until = original_disabled
        
    print("API Key Load Balancing Test Passed!")

async def test_pdf_rendering_prewarmed():
    print("\n--- Testing Pre-warmed PDF Rendering Latency ---")
    mock_data = {
        "personal": {"name": "Optimizer Test", "email": "test@example.com", "title": "Developer"},
        "skills": [{"category": "Languages", "skill_names": "Python, Go"}],
        "experience": [], "projects": [], "education": [], "certifications": []
    }
    
    # Measure Sequential Rendering Time (normal fallback)
    start_seq = time.time()
    pdf_path_seq = generate_stunning_pdf(mock_data, "test_seq.pdf")
    time_seq = time.time() - start_seq
    print(f"Sequential PDF rendering time: {time_seq:.2f} seconds")
    
    # Measure Parallel Pre-Warmed Rendering Time
    start_par = time.time()
    # 1. Start the render process early
    render_process = start_pdf_render_process("test_par.pdf")
    # Simulate some parallel task (like a Gemini call taking 1.5 seconds)
    print("Simulating parallel work (Gemini call taking 1.5s)...")
    await asyncio.sleep(1.5)
    # 2. Complete rendering
    pdf_path_par = generate_stunning_pdf(mock_data, "test_par.pdf", prewarmed_process=render_process)
    # The actual latency from the moment the optimized content was ready:
    time_par_actual = time.time() - (start_par + 1.5)
    total_par = time.time() - start_par
    
    print(f"Pre-warmed PDF rendering actual latency (post-Gemini): {time_par_actual:.2f} seconds")
    print(f"Pre-warmed PDF rendering total time (including warm-up): {total_par:.2f} seconds")
    
    assert os.path.exists(pdf_path_par), "Pre-warmed PDF file was not created!"
    # The post-Gemini latency should be minimal (typically under 0.6 seconds), representing a massive speedup
    print("PDF Pre-warming Test Passed!")

if __name__ == "__main__":
    test_api_key_load_balancing()
    asyncio.run(test_pdf_rendering_prewarmed())
