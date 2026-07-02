from typing import List, Dict
from pydantic import BaseModel, Field

class PersonalInfo(BaseModel):
    name: str = Field(description="Full name of the candidate")
    title: str = Field(description="Professional title (e.g. Software Engineer | Backend & AI Systems)", default="")
    email: str = Field(description="Email address")
    phone: str = Field(description="Phone number")
    location: str = Field(description="City and state/country", default="")
    linkedin: str = Field(description="LinkedIn profile URL", default="")
    github: str = Field(description="GitHub profile URL", default="")
    portfolio: str = Field(description="Personal Portfolio URL", default="")

class Experience(BaseModel):
    title: str = Field(description="Job title")
    company: str = Field(description="Company name")
    duration: str = Field(description="Duration of employment EXACTLY as in original (e.g., 'Aug 2024 — June 2025')")
    points: List[str] = Field(description="List of responsibilities and achievements")

class Project(BaseModel):
    title: str = Field(description="Project title")
    tech_stack: str = Field(description="Tech Stack used (e.g., Python, Flask, TensorFlow)", default="")
    link: str = Field(description="GitHub or Live Project URL", default="")
    points: List[str] = Field(description="List of achievements or details about the project (bullet points)")

class Education(BaseModel):
    degree: str = Field(description="Degree obtained")
    college: str = Field(description="University or college name")
    year: str = Field(description="Year of graduation or duration EXACTLY as in original")

class Certificate(BaseModel):
    name: str = Field(description="Name of the certification")
    link: str = Field(description="URL of the certification or credential (if any)", default="")
    issuer: str = Field(description="Issuing organization", default="")
    date: str = Field(description="Date obtained EXACTLY as in original", default="")

class SkillCategory(BaseModel):
    category: str = Field(description="Category name (e.g. Languages, Backend, Frontend)")
    skill_names: str = Field(description="Comma-separated list of skills in this category")

class ResumeSchema(BaseModel):
    target_company: str = Field(description="The name of the company the candidate is applying to, extracted from the JD.", default="")
    personal: PersonalInfo
    summary: str = Field(description="Professional summary paragraph")
    skills: List[SkillCategory] = Field(description="List of skill categories and their items")
    experience: List[Experience]
    projects: List[Project]
    education: List[Education]
    certifications: List[Certificate] = Field(default_factory=list)
