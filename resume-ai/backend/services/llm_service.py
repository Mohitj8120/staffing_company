import os
from google import genai
from google.genai import types
from core.config import settings
from core.schemas import ResumeSchema
from prompts.prompts import PARSER_PROMPT, OPTIMIZER_PROMPT
import json
import time

import threading

# Parse API keys from settings for rotation
api_keys = []
if settings.GEMINI_API_KEYS:
    api_keys = [k.strip() for k in settings.GEMINI_API_KEYS.split(",") if k.strip()]
if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY not in api_keys:
    api_keys.append(settings.GEMINI_API_KEY)

# Thread-safe load balancer structures
key_selection_lock = threading.Lock()
active_requests = {i: 0 for i in range(len(api_keys))}
disabled_until = {i: 0 for i in range(len(api_keys))}

def select_least_busy_key_idx() -> int:
    with key_selection_lock:
        now = time.time()
        available_keys = [i for i in range(len(api_keys)) if disabled_until[i] < now]
        if not available_keys:
            available_keys = list(range(len(api_keys)))
            
        selected_idx = min(available_keys, key=lambda i: active_requests[i])
        active_requests[selected_idx] += 1
        return selected_idx

def release_key_idx(idx: int):
    with key_selection_lock:
        if active_requests[idx] > 0:
            active_requests[idx] -= 1

def disable_key_idx(idx: int, duration: float = 60.0):
    with key_selection_lock:
        disabled_until[idx] = time.time() + duration

def generate_with_fallback(model_name: str, **kwargs):
    if not api_keys:
        raise Exception("No API keys configured!")
        
    max_retries = len(api_keys)
    attempts = 0
    
    while attempts < max_retries:
        key_idx = select_least_busy_key_idx()
        key_to_use = api_keys[key_idx]
        temp_client = genai.Client(api_key=key_to_use)
        
        try:
            # Try up to 3 times per key for transient errors like 503
            for retry in range(3):
                try:
                    return temp_client.models.generate_content(model=model_name, **kwargs)
                except Exception as inner_e:
                    inner_err_str = str(inner_e)
                    if "503" in inner_err_str or "500" in inner_err_str or "UNAVAILABLE" in inner_err_str:
                        print(f"Transient error with Gemini on key {key_idx + 1} (503), retrying in {2 ** retry} seconds...")
                        time.sleep(2 ** retry)
                        if retry == 2:
                            raise inner_e # bubble up after 3 retries
                    else:
                        raise inner_e # Not a 503, bubble up immediately
                        
        except Exception as e:
            error_str = str(e)
            err_lower = error_str.lower()
            if (
                "429" in error_str 
                or "quota" in err_lower 
                or "resource_exhausted" in err_lower 
                or "depleted" in err_lower 
                or "prepayment" in err_lower 
                or "billing" in err_lower
            ):
                print(f"API Key {key_idx + 1}/{len(api_keys)} exhausted/disabled (error: {error_str}). Disabling for 3600s and rotating to next key...")
                disable_key_idx(key_idx, 3600.0)
                attempts += 1
                time.sleep(0.5)
                continue
            else:
                raise e
        finally:
            release_key_idx(key_idx)
                
    raise Exception(f"All {len(api_keys)} API keys have exhausted their quotas!")

def inline_refs(schema, defs):
    if isinstance(schema, dict):
        if "$ref" in schema:
            ref_name = schema["$ref"].split("/")[-1]
            resolved = defs.get(ref_name, {}).copy()
            return inline_refs(resolved, defs)
        new_schema = {}
        for k, v in schema.items():
            new_schema[k] = inline_refs(v, defs)
        return new_schema
    elif isinstance(schema, list):
        return [inline_refs(item, defs) for item in schema]
    else:
        return schema

def get_resolved_schema(model):
    schema = model.model_json_schema()
    defs = schema.pop("$defs", {})
    resolved = inline_refs(schema, defs)
    
    def strip_titles(s):
        if isinstance(s, dict):
            if "title" in s and isinstance(s["title"], str):
                s.pop("title", None)
            for k, v in s.items():
                if k == "properties" and isinstance(v, dict):
                    for prop_schema in v.values():
                        strip_titles(prop_schema)
                else:
                    strip_titles(v)
        elif isinstance(s, list):
            for v in s:
                strip_titles(v)
        return s
        
    return strip_titles(resolved)

RESOLVED_RESUME_SCHEMA = get_resolved_schema(ResumeSchema)

def parse_resume(resume_text: str) -> dict:
    """
    Parses plain text from a resume and converts it to a structured JSON dictionary.
    """
    try:
        response = generate_with_fallback(
            model_name='gemini-2.5-flash',
            contents=f"{PARSER_PROMPT}\n\nResume Text:\n{resume_text}",
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=RESOLVED_RESUME_SCHEMA,
                temperature=0.1,
            ),
        )
        return json.loads(response.text)
    except Exception as e:
        print(f"Error parsing resume: {e}")
        raise

def optimize_resume(
    resume_data: dict, 
    jd_text: str, 
    mode: str = "standard", 
    page_count: str = "auto",
    opt_strategy: str = None,
    default_tone: str = None,
    preserve_grades: bool = True,
    auto_shorten: bool = True
) -> dict:
    """
    Tailors the resume data based on the provided Job Description and user preferences.
    """
    try:
        resume_json_str = json.dumps(resume_data)
        
        mode_instructions = ""
        if mode == "redesign":
            mode_instructions = (
                "**MAGIC REDESIGN MODE**: The user has requested a premium, highly-tailored redesign of their resume. "
                "You MUST drastically optimize the content to perfectly fit the role described in the JD. "
            )
            
        # Add strict page length instructions
        if page_count == "1":
            mode_instructions += (
                "**CRITICAL CONSTRAINT (1 PAGE MAXIMUM)**: You MUST aggressively condense the resume to strictly fit on a single page. "
                "You MUST limit experience bullet points to a MAXIMUM of 2-3 per role. "
                "You MUST limit project bullet points to a MAXIMUM of 2 per project. "
                "OMIT older/less relevant roles, projects, or certifications if the list is long. "
                "DO NOT output a Summary section. Cut all fluff and prioritize maximum density."
            )
        elif page_count == "2":
            mode_instructions += (
                "**CRITICAL CONSTRAINT (2 PAGES COMPREHENSIVE)**: The user specifically requested a detailed 2-page resume. "
                "Provide comprehensive bullet points (4-6 per role) emphasizing deep technical details, leadership, and extensive project scopes. "
                "Do NOT artificially condense the experience."
            )
        else:
            # Auto mode
            mode_instructions += (
                "Keep the same overall length/depth as the original resume (if the original is short, keep it punchy for 1-page; "
                "if it's long, keep it comprehensive for 2-page). "
            )
            
        if mode == "redesign":
            mode_instructions += (
                "Use high-impact action verbs, emphasize metrics, and rewrite summaries to sound incredibly professional and tailored. "
                "Make it highly professional and ats friendly not very fancy but simple."
            )

        # Add user preferences custom directives
        if opt_strategy:
            mode_instructions += f"\n- **OPTIMIZATION STRATEGY**: You MUST apply the strategy: '{opt_strategy}'."
            if "star" in opt_strategy.lower():
                mode_instructions += " Focus heavily on describing bullet points with clear Situation, Task, Action, and Result (quantifiable metrics)."
            elif "keyword" in opt_strategy.lower():
                mode_instructions += " Inject high-density exact match keywords from the Job Description into the skills, experience, and project descriptions."
            elif "academic" in opt_strategy.lower():
                mode_instructions += " Prioritize academic history alignment and match formatting precisely."
                
        if default_tone:
            mode_instructions += f"\n- **OUTPUT STYLE & TONE**: You MUST write using a style matching: '{default_tone}'."
            
        if preserve_grades:
            mode_instructions += (
                "\n- **CRITICAL CONSTRAINT (GRADE PROTECTION)**: You MUST preserve all GPA scores, academic percentages, grades, and marks EXACTLY as they appear in the base resume. "
                "Do NOT simplify, modify, scale, remove, or alter them under any circumstances."
            )
            
        if auto_shorten:
            mode_instructions += (
                "\n- **CRITICAL CONSTRAINT (SHORT BULLETS)**: Enforce strict conciseness. "
                "Every experience or project bullet point MUST be strictly limited to 1-2 lines maximum. "
                "Do NOT write long paragraphs or blocky text blocks."
            )
            
        prompt_content = (
            f"{OPTIMIZER_PROMPT}\n\n"
            f"{mode_instructions}\n\n"
            f"--- Base Resume JSON ---\n{resume_json_str}\n\n"
            f"--- Job Description ---\n{jd_text}"
        )
        response = generate_with_fallback(
            model_name='gemini-2.5-flash',
            contents=prompt_content,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=RESOLVED_RESUME_SCHEMA,
                temperature=0.7,
            ),
        )
        return json.loads(response.text)
    except Exception as e:
        print(f"Error optimizing resume: {e}")
        print("Falling back to original resume data due to API error...")
        return resume_data

def optimize_resume_map(text_map: dict, resume_data: dict, jd_text: str) -> dict:
    """
    Tailors the original resume text based on the provided Job Description.
    Returns a dictionary mapping text IDs to their new tailored text.
    """
    try:
        from prompts.prompts import OPTIMIZER_MAP_PROMPT
        resume_json_str = json.dumps(resume_data)
        text_map_str = json.dumps(text_map)
        
        prompt_content = (
            f"{OPTIMIZER_MAP_PROMPT}\n\n"
            f"--- Job Description ---\n{jd_text}\n\n"
            f"--- Updated Candidate Structured Data ---\n{resume_json_str}\n\n"
            f"--- Original Text Map (ID -> Text) ---\n{text_map_str}"
        )
        response = generate_with_fallback(
            model_name='gemini-2.5-flash',
            contents=prompt_content,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema={"type": "object", "additionalProperties": {"type": "string"}},
                temperature=0.7,
            ),
        )
        return json.loads(response.text)
    except Exception as e:
        print(f"Error optimizing resume text map: {e}")
        return {}
