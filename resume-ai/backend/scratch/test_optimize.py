import requests

url = "http://localhost:8000/api/optimize"
payload = {
    "file_id": "test",
    "jd": "Software Engineer",
    "resume_data": '{"personal": {"name": "Test"}}'
}
response = requests.post(url, data=payload)
print(response.json())
