import os
from docx import Document
from docxtpl import DocxTemplate
from docx2pdf import convert
import fitz  # PyMuPDF
from jinja2 import Template
from playwright.sync_api import sync_playwright
from core.config import settings
import subprocess

def extract_text_from_docx(file_path: str) -> str:
    """
    Extracts all text from a DOCX file.
    """
    doc = Document(file_path)
    full_text = []
    for para in doc.paragraphs:
        full_text.append(para.text)
    
    # Also extract text from tables if any
    for table in doc.tables:
        for row in table.rows:
            for cell in row.cells:
                full_text.append(cell.text)
                
    return '\n'.join(full_text)

def extract_text_from_pdf(file_path: str) -> str:
    """
    Extracts all text from a PDF file using PyMuPDF.
    """
    doc = fitz.open(file_path)
    full_text = []
    for page in doc:
        full_text.append(page.get_text("text"))
        # Also extract links so LLM can parse LinkedIn/GitHub URLs
        for link in page.get_links():
            if 'uri' in link:
                full_text.append(link['uri'])
    return '\n'.join(full_text)

def start_pdf_render_process(output_filename: str) -> subprocess.Popen:
    """
    Asynchronously starts the Playwright rendering subprocess in the background.
    Imports Playwright and launches Chromium early, then blocks waiting for HTML on stdin.
    """
    import subprocess
    import sys
    output_path = os.path.join(settings.TEMP_DIR, output_filename)
    
    script = """
import sys
from playwright.sync_api import sync_playwright
sys.stdin.reconfigure(encoding='utf-8')
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.set_content(sys.stdin.read())
    page.pdf(path=sys.argv[1], format="A4", margin={"top": "20px", "right": "20px", "bottom": "20px", "left": "20px"}, print_background=True)
    browser.close()
"""
    
    process = subprocess.Popen(
        [sys.executable, "-c", script, output_path],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        encoding="utf-8"
    )
    return process

def generate_stunning_pdf(
    data: dict, 
    output_filename: str = "tailored_resume.pdf", 
    mode: str = "standard", 
    page_count: str = "auto",
    prewarmed_process: subprocess.Popen = None
) -> str:
    """
    Renders the HTML template and writes it to Playwright (either direct launch or pre-warmed).
    """
    template_name = "resume_redesign_theme.html" if mode == "redesign" else "resume_theme.html"
    template_path = os.path.join(settings.BASE_DIR, "templates", template_name)
    if not os.path.exists(template_path):
        template_path = os.path.join(os.path.dirname(__file__), "..", "templates", template_name)
        
    with open(template_path, "r", encoding="utf-8") as f:
        template_str = f.read()
        
    template = Template(template_str)
    
    if page_count == "1":
        if "experience" in data and isinstance(data["experience"], list):
            data["experience"] = data["experience"][:4]
            for exp in data["experience"]:
                if "points" in exp and isinstance(exp["points"], list):
                    exp["points"] = exp["points"][:4]
        if "projects" in data and isinstance(data["projects"], list):
            data["projects"] = data["projects"][:4]
            for proj in data["projects"]:
                if "points" in proj and isinstance(proj["points"], list):
                    proj["points"] = proj["points"][:3]
        if "certifications" in data and isinstance(data["certifications"], list):
            data["certifications"] = data["certifications"][:4]
                    
    html_content = template.render(data=data, page_count=page_count)
    
    # Minify HTML to save memory and optimize processing speed
    import re
    def minify_html(html: str) -> str:
        html = re.sub(r'<!--.*?-->', '', html, flags=re.DOTALL)
        html = re.sub(r'[\r\n\t]+', ' ', html)
        html = re.sub(r'\s{2,}', ' ', html)
        return html.strip()
    
    html_content = minify_html(html_content)
    
    import subprocess
    import sys
    
    # If a pre-warmed process is provided, write to its stdin
    if prewarmed_process is not None:
        stdout, stderr = prewarmed_process.communicate(input=html_content)
        if prewarmed_process.returncode != 0:
            raise Exception(f"Playwright pre-warmed PDF generation failed: {stderr}")
        return os.path.join(settings.TEMP_DIR, output_filename)
    
    # Direct execution fallback
    output_path = os.path.join(settings.TEMP_DIR, output_filename)
    script = """
import sys
from playwright.sync_api import sync_playwright
sys.stdin.reconfigure(encoding='utf-8')
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.set_content(sys.stdin.read())
    page.pdf(path=sys.argv[1], format="A4", margin={"top": "20px", "right": "20px", "bottom": "20px", "left": "20px"}, print_background=True)
    browser.close()
"""
    
    process = subprocess.run(
        [sys.executable, "-c", script, output_path],
        input=html_content,
        text=True,
        encoding="utf-8",
        capture_output=True
    )
    
    if process.returncode != 0:
        raise Exception(f"Playwright PDF generation failed: {process.stderr}")
        
    return output_path

def generate_tailored_docx(data: dict, output_filename: str = "tailored_resume.docx") -> str:
    """
    Fills the resume_template.docx with tailored data and saves it.
    Returns the path to the saved DOCX file.
    """
    template_path = os.path.join(settings.TEMPLATES_DIR, "resume_template.docx")
    
    if not os.path.exists(template_path):
        raise FileNotFoundError(f"Template not found at {template_path}")
        
    doc = DocxTemplate(template_path)
    
    # Format data for the template
    # The template expects specific placeholders like {{name}}, {{summary}}, {{experience}}
    
    experience_list = []
    for e in data.get("experience", []):
        if not isinstance(e, dict):
            continue
        title = e.get("title", "")
        company = e.get("company", "")
        duration = e.get("duration", "")
        points = e.get("points", [])
        points_str = "\n".join(["• " + str(p) for p in points]) if isinstance(points, list) else ""
        exp_str = f'{title} | {company} | {duration}\n' + points_str
        experience_list.append(exp_str)
    experience_text = "\n\n".join(experience_list)
    
    projects_list = []
    for p in data.get("projects", []):
        if not isinstance(p, dict):
            continue
        title = p.get("title", "")
        desc = p.get("description", p.get("summary", ""))
        if isinstance(desc, list):
            desc = "\n".join(["• " + str(x) for x in desc])
        projects_list.append(f'{title}\n{desc}')
    projects_text = "\n\n".join(projects_list)
    
    education_list = []
    for e in data.get("education", []):
        if not isinstance(e, dict):
            continue
        degree = e.get("degree", "")
        college = e.get("college", e.get("school", ""))
        year = e.get("year", "")
        education_list.append(f'{degree} | {college} | {year}')
    education_text = "\n\n".join(education_list)

    # Safely handle skills and certifications which might be string or list
    skills = data.get("skills", [])
    if isinstance(skills, list):
        skills_text = "\n".join([str(s) for s in skills])
    else:
        skills_text = str(skills)

    certs = data.get("certifications", [])
    if isinstance(certs, list):
        certs_text = "\n".join([str(c) for c in certs])
    else:
        certs_text = str(certs)

    context = {
        "name": data.get("personal", {}).get("name", "") if isinstance(data.get("personal"), dict) else "",
        "email": data.get("personal", {}).get("email", "") if isinstance(data.get("personal"), dict) else "",
        "phone": data.get("personal", {}).get("phone", "") if isinstance(data.get("personal"), dict) else "",
        "location": data.get("personal", {}).get("location", "") if isinstance(data.get("personal"), dict) else "",
        "linkedin": data.get("personal", {}).get("linkedin", "") if isinstance(data.get("personal"), dict) else "",
        "portfolio": data.get("personal", {}).get("portfolio", "") if isinstance(data.get("personal"), dict) else "",
        "summary": data.get("summary", ""),
        "skills": skills_text,
        "experience": experience_text,
        "projects": projects_text,
        "education": education_text,
        "certifications": certs_text
    }
    
    doc.render(context)
    
    output_path = os.path.join(settings.TEMP_DIR, output_filename)
    doc.save(output_path)
    
    return output_path

def convert_docx_to_pdf(docx_path: str, output_filename: str = "tailored_resume.pdf") -> str:
    """
    Converts a DOCX file to PDF using docx2pdf.
    Note: Requires Microsoft Word to be installed on Windows.
    """
    pdf_path = os.path.join(settings.TEMP_DIR, output_filename)
    convert(docx_path, pdf_path)
    return pdf_path

def get_docx_text_map(file_path: str):
    """
    Iterates through a DOCX and creates a map of paragraph indexes to their text.
    Returns (elements list, dict mapping str(idx) -> text).
    """
    doc = Document(file_path)
    elements = []
    
    for para in doc.paragraphs:
        if para.text.strip():
            elements.append(para)
            
    for table in doc.tables:
        for row in table.rows:
            for cell in row.cells:
                for para in cell.paragraphs:
                    if para.text.strip():
                        elements.append(para)
                        
    text_map = {str(i): el.text for i, el in enumerate(elements)}
    return elements, text_map, doc

def apply_text_map_to_docx(file_path: str, modifications: dict, output_filename: str) -> str:
    """
    Applies text modifications to a DOCX file while retaining paragraph/first-run formatting.
    """
    elements, _, doc = get_docx_text_map(file_path)
    
    for idx_str, new_text in modifications.items():
        try:
            idx = int(idx_str)
            if idx < len(elements):
                para = elements[idx]
                # Split new text by newlines just in case the LLM outputs them, to avoid breaking Word layout
                parts = new_text.split('\n')
                
                if not para.runs:
                    for i, part in enumerate(parts):
                        para.add_run(part)
                        if i < len(parts) - 1:
                            para.add_run().add_break()
                else:
                    # Keep the formatting of the first run
                    first_run = para.runs[0]
                    first_run.text = parts[0]
                    
                    # If there are more parts due to newlines, append them to the first run's paragraph
                    for i in range(1, len(parts)):
                        first_run.add_break()
                        first_run.add_text(parts[i])
                        
                    # Clear out the rest of the runs
                    for i in range(1, len(para.runs)):
                        para.runs[i].text = ""
        except (ValueError, KeyError):
            pass
            
    # Apply "keep with next" for short headers to prevent page break issues
    for para in doc.paragraphs:
        # Keep lines together for all paragraphs so they don't break across pages
        para.paragraph_format.keep_lines_together = True
        
        # If it's a short heading or title, keep it with the next paragraph
        text = para.text.strip()
        if text and len(text.split()) <= 10:
            if para.style.name.startswith("Heading") or "Title" in para.style.name:
                para.paragraph_format.keep_with_next = True
            elif "Tech Stack" in text:
                para.paragraph_format.keep_with_next = True
            
    output_path = os.path.join(settings.TEMP_DIR, output_filename)
    doc.save(output_path)
    return output_path
