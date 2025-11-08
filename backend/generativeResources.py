"""
Install the OpenAI Python SDK

$ pip install openai
"""

import os
from openai import OpenAI
from dotenv import load_dotenv
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


def generate_resources_sync(course, knowledge_level, description, time):
    """Hàm tạo resources đồng bộ (blocking)"""
    response = client.chat.completions.create(
        model=os.environ.get("OPENAI_MODEL", "gpt-5-nano-2025-08-07"),
        messages=[
            {
                "role": "system",
                "content": "Bạn là một gia sư AI. Duy trì ngôn ngữ khiêm tốn và bình tĩnh phù hợp cho việc học. Bạn cần cung cấp nội dung cho người dùng học trong thời gian nhất định."
            },
            {
                "role": "user",
                "content": f"Tôi đang học {course}. Trình độ kiến thức của tôi về chủ đề này là {knowledge_level}. Tôi muốn {description}. Tôi muốn học nó trong {time}. Hãy dạy tôi."
            }
        ]
    )

    result = response.choices[0].message.content
    print(result)
    return result


def process_resource_job(job_id, course, knowledge_level, description, time):
    """Xử lý job tạo resource trong background thread"""
    try:
        print(f"[Resource Job {job_id}] Bắt đầu xử lý...")
        job_storage[job_id]['status'] = 'processing'
        job_storage[job_id]['updated_at'] = datetime.now().isoformat()
        
        # Tạo resource
        result = generate_resources_sync(course, knowledge_level, description, time)
        
        # Cập nhật kết quả
        job_storage[job_id]['status'] = 'completed'
        job_storage[job_id]['result'] = result
        job_storage[job_id]['updated_at'] = datetime.now().isoformat()
        job_storage[job_id]['completed_at'] = datetime.now().isoformat()
        
        print(f"[Resource Job {job_id}] Hoàn thành!")
        
    except Exception as e:
        print(f"[Resource Job {job_id}] Lỗi: {str(e)}")
        job_storage[job_id]['status'] = 'failed'
        job_storage[job_id]['error'] = str(e)
        job_storage[job_id]['updated_at'] = datetime.now().isoformat()


def generate_resources(course, knowledge_level, description, time):
    """Tạo job và trả về job_id ngay lập tức"""
    job_id = str(uuid.uuid4())
    
    # Khởi tạo job
    job_storage[job_id] = {
        'job_id': job_id,
        'status': 'pending',
        'course': course,
        'knowledge_level': knowledge_level,
        'description': description,
        'time': time,
        'created_at': datetime.now().isoformat(),
        'updated_at': datetime.now().isoformat(),
        'result': None,
        'error': None
    }
    
    # Chạy xử lý trong background thread
    thread = threading.Thread(
        target=process_resource_job,
        args=(job_id, course, knowledge_level, description, time)
    )
    thread.daemon = True
    thread.start()
    
    print(f"[Resource Job {job_id}] Đã tạo và bắt đầu background processing")
    
    return job_id


def get_job_status(job_id):
    """Lấy trạng thái của job"""
    if job_id not in job_storage:
        return None
    return job_storage[job_id]
