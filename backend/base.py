from flask import Flask, request
import roadmap
import quiz
import generativeResources
from flask_cors import CORS
import os
from dotenv import load_dotenv

load_dotenv()

api = Flask(__name__)

# Cấu hình CORS cho production
CORS(api, 
     origins=[
         "http://localhost:3000",
         "https://nhan-hoc.vercel.app",
         "https://nhanhoc-ca30a6361738.herokuapp.com"
     ],
     methods=["GET", "POST", "OPTIONS"],
     allow_headers=["Content-Type", "Authorization"],
     supports_credentials=False
)


@api.route("/", methods=["GET"])
def health_check():
    return {"status": "ok", "message": "AI Learning Platform API is running"}, 200


@api.route("/api/roadmap", methods=["POST"])
def get_roadmap():
    """Tạo job roadmap và trả về job_id ngay lập tức"""
    req = request.get_json()

    job_id = roadmap.create_roadmap(
        topic=req.get("topic", "Machine Learning"),
        time=req.get("time", "4 weeks"),
        knowledge_level=req.get("knowledge_level", "Absolute Beginner"),
    )

    return {
        "job_id": job_id,
        "status": "pending",
        "message": "Đang xử lý roadmap của bạn. Vui lòng đợi..."
    }, 202


@api.route("/api/roadmap/status/<job_id>", methods=["GET"])
def get_roadmap_status(job_id):
    """Kiểm tra trạng thái của job"""
    job = roadmap.get_job_status(job_id)
    
    if job is None:
        return {"error": "Không tìm thấy job"}, 404
    
    response = {
        "job_id": job['job_id'],
        "status": job['status'],
        "created_at": job['created_at'],
        "updated_at": job['updated_at']
    }
    
    if job['status'] == 'completed':
        response['result'] = job['result']
        response['completed_at'] = job.get('completed_at')
    elif job['status'] == 'failed':
        response['error'] = job.get('error', 'Unknown error')
    
    return response, 200


@api.route("/api/quiz", methods=["POST"])
def get_quiz():
    req = request.get_json()

    course = req.get("course")
    topic = req.get("topic")
    subtopic = req.get("subtopic")
    description = req.get("description")

    if not (course and topic and subtopic and description):
        return "Required Fields not provided", 400

    print("getting quiz...")
    response_body = quiz.get_quiz(course, topic, subtopic, description)
    return response_body


# @api.route("/api/translate", methods=["POST"])
# def get_translations():
#     req = request.get_json()

#     text = req.get("textArr")
#     toLang = req.get("toLang")

#     print(f"Translating to {toLang}: { text}")
#     translated_text = translate.translate_text_arr(text_arr=text, target=toLang)
#     return translated_text


@api.route("/api/generate-resource", methods=["POST"])
def generative_resource():
    req = request.get_json()
    req_data = {
        "course": False,
        "knowledge_level": False,
        "description": False,
        "time": False,
    }
    for key in req_data.keys():
        req_data[key] = req.get(key)
        if not req_data[key]:
            return "Required Fields not provided", 400
    print(f"generative resources for {req_data['course']}")
    resources = generativeResources.generate_resources(**req_data)
    return resources
