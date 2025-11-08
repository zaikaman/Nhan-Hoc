import os
from openai import OpenAI
import json
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

def create_roadmap_sync(topic, time, knowledge_level):
    """Hàm tạo roadmap đồng bộ (blocking)"""
    system_instruction = 'Bạn là một trợ lý AI cung cấp lộ trình học tập được cá nhân hóa tốt dựa trên đầu vào của người dùng. Bạn phải cung cấp các chủ đề con để học với mô tả ngắn gọn về chủ đề con cho biết chính xác nội dung cần học và mỗi chủ đề con sẽ mất bao nhiêu thời gian. Dành nhiều thời gian hơn cho các chủ đề con đòi hỏi nhiều sự hiểu biết hơn. Một điều quan trọng nữa, đảm bảo giữ tất cả các khóa ở dạng chữ thường \nVí dụ đầu ra:\n{\n  "tuần 1": {\n    "chủ đề":"Giới thiệu về Python",\n    "các chủ đề con":[\n      {\n        "chủ đề con":"Bắt đầu với Python",\n        "thời gian":"10 phút",\n        "mô tả":"Học Hello world trong python"\n      },\n      {\n        "chủ đề con":"Kiểu dữ liệu trong Python",\n        "thời gian":"1 giờ",\n        "mô tả":"Tìm hiểu về int, string, boolean, array, dict và ép kiểu dữ liệu"\n      },\n     {\n        "chủ đề con":"Câu lệnh điều kiện trong Python",\n        "thời gian":"30 phút",\n        "mô tả":"Tìm hiểu về toán tử so sánh, câu lệnh if elif else"\n      },\n      {\n        "chủ đề con":"Vòng lặp",\n        "thời gian":"30 phút",\n        "mô tả":"Tìm hiểu về vòng lặp for, vòng lặp while, continue và break"\n      },\n      {\n        "chủ đề con":"Lập trình hướng đối tượng trong Python",\n        "thời gian":"4 giờ",\n        "mô tả":"Tìm hiểu về lớp, đối tượng, kế thừa, đa hình và các khái niệm OOP"\n      },\n    ]\n  }\n}\n Đảm bảo giữ tất cả các khóa ở dạng chữ thường như subtopics, topic, time, etc.'

    response = client.chat.completions.create(
        model=os.environ.get("OPENAI_MODEL", "gpt-5-nano-2025-08-07"),
        messages=[
            {
                "role": "system",
                "content": system_instruction
            },
            {
                "role": "user",
                "content": f"Đề xuất lộ trình học {topic} trong {time}. Trình độ kiến thức của tôi là {knowledge_level}. Tôi có thể dành tổng cộng 16 giờ mỗi tuần."
            }
        ]
    )
    
    result = response.choices[0].message.content
    print(result)
    return json.loads(result)

def process_roadmap_job(job_id, topic, time, knowledge_level):
    """Xử lý job tạo roadmap trong background thread"""
    try:
        print(f"[Job {job_id}] Bắt đầu xử lý...")
        job_storage[job_id]['status'] = 'processing'
        job_storage[job_id]['updated_at'] = datetime.now().isoformat()
        
        # Tạo roadmap
        result = create_roadmap_sync(topic, time, knowledge_level)
        
        # Cập nhật kết quả
        job_storage[job_id]['status'] = 'completed'
        job_storage[job_id]['result'] = result
        job_storage[job_id]['updated_at'] = datetime.now().isoformat()
        job_storage[job_id]['completed_at'] = datetime.now().isoformat()
        
        print(f"[Job {job_id}] Hoàn thành!")
        
    except Exception as e:
        print(f"[Job {job_id}] Lỗi: {str(e)}")
        job_storage[job_id]['status'] = 'failed'
        job_storage[job_id]['error'] = str(e)
        job_storage[job_id]['updated_at'] = datetime.now().isoformat()

def create_roadmap(topic, time, knowledge_level):
    """Tạo job và trả về job_id ngay lập tức"""
    job_id = str(uuid.uuid4())
    
    # Khởi tạo job
    job_storage[job_id] = {
        'job_id': job_id,
        'status': 'pending',
        'topic': topic,
        'time': time,
        'knowledge_level': knowledge_level,
        'created_at': datetime.now().isoformat(),
        'updated_at': datetime.now().isoformat(),
        'result': None,
        'error': None
    }
    
    # Chạy xử lý trong background thread
    thread = threading.Thread(
        target=process_roadmap_job,
        args=(job_id, topic, time, knowledge_level)
    )
    thread.daemon = True
    thread.start()
    
    print(f"[Job {job_id}] Đã tạo và bắt đầu background processing")
    
    return job_id

def get_job_status(job_id):
    """Lấy trạng thái của job"""
    if job_id not in job_storage:
        return None
    return job_storage[job_id]
