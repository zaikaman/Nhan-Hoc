from flask import Flask, request
import roadmap
import quiz
import generativeResources
import chatbot
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
    """Tạo job quiz và trả về job_id ngay lập tức"""
    req = request.get_json()

    course = req.get("course")
    topic = req.get("topic")
    subtopic = req.get("subtopic")
    description = req.get("description")
    num_questions = req.get("num_questions", 5)  # Mặc định 5 câu hỏi

    if not (course and topic and subtopic and description):
        return {"error": "Thiếu thông tin bắt buộc"}, 400

    print(f"Đang tạo quiz job với {num_questions} câu hỏi...")
    job_id = quiz.get_quiz(course, topic, subtopic, description, num_questions)
    
    return {
        "job_id": job_id,
        "status": "pending",
        "message": "Đang tạo bài kiểm tra. Vui lòng đợi..."
    }, 202


@api.route("/api/quiz/status/<job_id>", methods=["GET"])
def get_quiz_status(job_id):
    """Kiểm tra trạng thái của quiz job"""
    job = quiz.get_job_status(job_id)
    
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
    """Tạo job resource và trả về job_id ngay lập tức"""
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
            return {"error": "Thiếu thông tin bắt buộc"}, 400
    
    print(f"Đang tạo resource job cho {req_data['course']}")
    job_id = generativeResources.generate_resources(**req_data)
    
    return {
        "job_id": job_id,
        "status": "pending",
        "message": "Đang tạo tài nguyên. Vui lòng đợi..."
    }, 202


@api.route("/api/generate-resource/status/<job_id>", methods=["GET"])
def get_resource_status(job_id):
    """Kiểm tra trạng thái của resource job"""
    job = generativeResources.get_job_status(job_id)
    
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


@api.route("/api/chat", methods=["POST", "OPTIONS"])
def chat():
    """Tạo chat job và trả về job_id ngay lập tức"""
    # Xử lý OPTIONS request cho CORS preflight
    if request.method == "OPTIONS":
        return "", 200
    
    try:
        req = request.get_json()
        
        messages = req.get("messages", [])
        user_data = req.get("userData", {})
        
        if not messages:
            return {"error": "Thiếu messages"}, 400
        
        # Tạo chat job
        job_id = chatbot.chat_with_ai(messages, user_data)
        
        return {
            "job_id": job_id,
            "status": "pending",
            "message": "Đang xử lý tin nhắn của bạn. Vui lòng đợi..."
        }, 202
        
    except Exception as e:
        print(f"Lỗi trong chat endpoint: {str(e)}")
        return {"error": str(e)}, 500


@api.route("/api/chat/status/<job_id>", methods=["GET"])
def get_chat_status(job_id):
    """Kiểm tra trạng thái của chat job"""
    job = chatbot.get_chat_job_status(job_id)
    
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


# ===== ANALYTICS ENDPOINTS =====
import analytics

@api.route("/api/analytics/overview", methods=["POST", "OPTIONS"])
def get_analytics_overview():
    """Tính toán metrics tổng quan từ dữ liệu học tập"""
    if request.method == "OPTIONS":
        return {}, 200
    
    try:
        req = request.get_json()
        learning_data = req.get("learning_data", {})
        
        metrics = analytics.calculate_progress_metrics(learning_data)
        
        return {
            "status": "success",
            "data": metrics
        }, 200
        
    except Exception as e:
        print(f"Lỗi trong analytics overview: {str(e)}")
        return {"error": str(e)}, 500


@api.route("/api/analytics/insights", methods=["POST", "OPTIONS"])
def get_analytics_insights():
    """Phân tích patterns và tạo AI insights"""
    if request.method == "OPTIONS":
        return {}, 200
    
    try:
        req = request.get_json()
        learning_data = req.get("learning_data", {})
        
        insights = analytics.analyze_learning_patterns(learning_data)
        
        return {
            "status": "success",
            "data": insights
        }, 200
        
    except Exception as e:
        print(f"Lỗi trong analytics insights: {str(e)}")
        return {"error": str(e)}, 500


@api.route("/api/analytics/topic/<topic_name>", methods=["POST", "OPTIONS"])
def get_topic_insights(topic_name):
    """Lấy insights chi tiết cho một topic cụ thể"""
    if request.method == "OPTIONS":
        return {}, 200
    
    try:
        req = request.get_json()
        learning_data = req.get("learning_data", {})
        
        topic_data = analytics.get_topic_insights(learning_data, topic_name)
        
        return {
            "status": "success",
            "data": topic_data
        }, 200
        
    except Exception as e:
        print(f"Lỗi trong topic insights: {str(e)}")
        return {"error": str(e)}, 500


@api.route("/api/analytics/study-plan", methods=["POST", "OPTIONS"])
def generate_study_plan():
    """Tạo study plan dựa trên analytics"""
    if request.method == "OPTIONS":
        return {}, 200
    
    try:
        req = request.get_json()
        learning_data = req.get("learning_data", {})
        
        study_plan = analytics.generate_study_plan(learning_data)
        
        return {
            "status": "success",
            "data": study_plan
        }, 200
        
    except Exception as e:
        print(f"Lỗi trong study plan: {str(e)}")
        return {"error": str(e)}, 500
