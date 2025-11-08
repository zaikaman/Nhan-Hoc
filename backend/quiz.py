"""
Install the OpenAI Python SDK

$ pip install openai
"""

import os
from openai import OpenAI
from dotenv import load_dotenv
import json
import uuid
import threading
from datetime import datetime

load_dotenv()

client = OpenAI(
    api_key=os.environ.get("OPENAI_API_KEY"),
    base_url=os.environ.get("OPENAI_BASE_URL")
)

# Lưu trữ trạng thái các job trong bộ nhớ
job_storage = {}


def get_quiz_sync(course, topic, subtopic, description):
    """Hàm tạo quiz đồng bộ (blocking)"""
    system_instruction = """Bạn là một trợ lý AI cung cấp bài kiểm tra để đánh giá sự hiểu biết của người dùng về một chủ đề. Bài kiểm tra sẽ dựa trên chủ đề, chủ đề con và mô tả của chủ đề con để xác định chính xác nội dung cần học. Xuất câu hỏi ở định dạng JSON. Các câu hỏi phải là câu hỏi trắc nghiệm, có thể bao gồm tính toán nếu cần thiết. Quyết định số lượng câu hỏi dựa trên mô tả của chủ đề con. Cố gắng tạo càng nhiều câu hỏi càng tốt. Bao gồm các câu hỏi yêu cầu suy nghĩ sâu sắc. xuất ở định dạng {questions:[ {question: "...", options:[...], answerIndex:"...", reason:"..."}]"""

    response = client.chat.completions.create(
        model=os.environ.get("OPENAI_MODEL", "gpt-5-nano-2025-08-07"),
        messages=[
            {
                "role": "system",
                "content": system_instruction
            },
            {
                "role": "user",
                "content": f'Người dùng đang học khóa học {course}. Trong khóa học, người dùng đang học chủ đề "{topic}". Tạo bài kiểm tra về chủ đề con "{subtopic}". Mô tả của chủ đề con là "{description}".'
            }
        ]
    )
    
    result = response.choices[0].message.content
    print(result)
    return json.loads(result)


def process_quiz_job(job_id, course, topic, subtopic, description):
    """Xử lý job tạo quiz trong background thread"""
    try:
        print(f"[Quiz Job {job_id}] Bắt đầu xử lý...")
        job_storage[job_id]['status'] = 'processing'
        job_storage[job_id]['updated_at'] = datetime.now().isoformat()
        
        # Tạo quiz
        result = get_quiz_sync(course, topic, subtopic, description)
        
        # Cập nhật kết quả
        job_storage[job_id]['status'] = 'completed'
        job_storage[job_id]['result'] = result
        job_storage[job_id]['updated_at'] = datetime.now().isoformat()
        job_storage[job_id]['completed_at'] = datetime.now().isoformat()
        
        print(f"[Quiz Job {job_id}] Hoàn thành!")
        
    except Exception as e:
        print(f"[Quiz Job {job_id}] Lỗi: {str(e)}")
        job_storage[job_id]['status'] = 'failed'
        job_storage[job_id]['error'] = str(e)
        job_storage[job_id]['updated_at'] = datetime.now().isoformat()


def get_quiz(course, topic, subtopic, description):
    """Tạo job và trả về job_id ngay lập tức"""
    job_id = str(uuid.uuid4())
    
    # Khởi tạo job
    job_storage[job_id] = {
        'job_id': job_id,
        'status': 'pending',
        'course': course,
        'topic': topic,
        'subtopic': subtopic,
        'description': description,
        'created_at': datetime.now().isoformat(),
        'updated_at': datetime.now().isoformat(),
        'result': None,
        'error': None
    }
    
    # Chạy xử lý trong background thread
    thread = threading.Thread(
        target=process_quiz_job,
        args=(job_id, course, topic, subtopic, description)
    )
    thread.daemon = True
    thread.start()
    
    print(f"[Quiz Job {job_id}] Đã tạo và bắt đầu background processing")
    
    return job_id


def get_job_status(job_id):
    """Lấy trạng thái của job"""
    if job_id not in job_storage:
        return None
    return job_storage[job_id]
