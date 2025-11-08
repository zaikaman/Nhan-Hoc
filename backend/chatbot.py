import os
from openai import OpenAI
import json
import uuid
import threading
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(
    api_key=os.environ.get("OPENAI_API_KEY"),
    base_url=os.environ.get("OPENAI_BASE_URL")
)

# Lưu trữ trạng thái các job trong bộ nhớ
chat_job_storage = {}

def create_context_prompt(user_data):
    """Tạo context prompt từ dữ liệu của user"""
    context = """Bạn là một trợ lý AI thông minh cho nền tảng học tập cá nhân hóa. 
Nhiệm vụ của bạn là:
1. Trả lời câu hỏi về các chủ đề học tập
2. Giải thích các khái niệm phức tạp một cách đơn giản
3. Đưa ra lời khuyên học tập dựa trên tiến độ của học viên
4. Động viên và hỗ trợ học viên
5. Gợi ý các tài nguyên và bài tập phù hợp

Hãy trả lời bằng tiếng Việt, thân thiện, nhiệt tình và chi tiết.
"""
    
    # Thêm thông tin về roadmaps
    if user_data.get('roadmaps'):
        context += "\n\n📚 **Các khóa học đang học:**\n"
        for topic, details in user_data['roadmaps'].items():
            context += f"- {topic}\n"
            for week, week_data in details.items():
                if isinstance(week_data, dict):
                    topic_name = week_data.get('chủ đề') or week_data.get('topic', '')
                    if topic_name:
                        context += f"  • {week}: {topic_name}\n"
    
    # Thêm thông tin về quiz stats
    if user_data.get('quizStats'):
        context += "\n\n📊 **Kết quả bài kiểm tra:**\n"
        for topic, weeks in user_data['quizStats'].items():
            context += f"- {topic}:\n"
            for week, subtopics in weeks.items():
                if isinstance(subtopics, dict):
                    for subtopic, stats in subtopics.items():
                        if isinstance(stats, dict):
                            percent = (stats.get('numCorrect', 0) * 100 / stats.get('numQues', 1))
                            context += f"  • Tuần {week}, Chủ đề {subtopic}: {percent:.1f}% đúng\n"
    
    # Thêm thông tin về resources đã lưu
    if user_data.get('resourceCount'):
        context += f"\n\n💾 **Tài nguyên đã lưu:** {user_data['resourceCount']} tài liệu\n"
    
    return context

def chat_with_ai_sync(messages, user_data=None):
    """
    Chat với AI sử dụng OpenAI API (đồng bộ - blocking)
    
    Args:
        messages: List of message objects [{"role": "user/assistant", "content": "..."}]
        user_data: Dict chứa roadmaps, quizStats, resources của user
    
    Returns:
        String response từ AI
    """
    try:
        # Tạo context prompt
        context_prompt = create_context_prompt(user_data or {})
        
        # Thêm system message với context
        system_message = {
            "role": "system",
            "content": context_prompt
        }
        
        # Kết hợp system message với messages
        full_messages = [system_message] + messages
        
        # Gọi OpenAI API
        response = client.chat.completions.create(
            model=os.environ.get("OPENAI_MODEL", "gpt-5-nano-2025-08-07"),
            messages=full_messages,
            temperature=0.7
        )
        
        return response.choices[0].message.content
        
    except Exception as e:
        print(f"Lỗi khi gọi OpenAI API: {str(e)}")
        raise e

def process_chat_job(job_id, messages, user_data):
    """Xử lý chat job trong background thread"""
    try:
        print(f"[Chat Job {job_id}] Bắt đầu xử lý...")
        chat_job_storage[job_id]['status'] = 'processing'
        chat_job_storage[job_id]['updated_at'] = datetime.now().isoformat()
        
        # Gọi AI để chat
        result = chat_with_ai_sync(messages, user_data)
        
        # Cập nhật kết quả
        chat_job_storage[job_id]['status'] = 'completed'
        chat_job_storage[job_id]['result'] = result
        chat_job_storage[job_id]['updated_at'] = datetime.now().isoformat()
        chat_job_storage[job_id]['completed_at'] = datetime.now().isoformat()
        
        print(f"[Chat Job {job_id}] Hoàn thành!")
        
    except Exception as e:
        print(f"[Chat Job {job_id}] Lỗi: {str(e)}")
        chat_job_storage[job_id]['status'] = 'failed'
        chat_job_storage[job_id]['error'] = str(e)
        chat_job_storage[job_id]['updated_at'] = datetime.now().isoformat()

def chat_with_ai(messages, user_data=None):
    """
    Tạo chat job và trả về job_id ngay lập tức
    
    Args:
        messages: List of message objects [{"role": "user/assistant", "content": "..."}]
        user_data: Dict chứa roadmaps, quizStats, resources của user
    
    Returns:
        String job_id
    """
    job_id = str(uuid.uuid4())
    
    # Khởi tạo job
    chat_job_storage[job_id] = {
        'job_id': job_id,
        'status': 'pending',
        'messages': messages,
        'user_data': user_data,
        'created_at': datetime.now().isoformat(),
        'updated_at': datetime.now().isoformat(),
        'result': None,
        'error': None
    }
    
    # Chạy xử lý trong background thread
    thread = threading.Thread(
        target=process_chat_job,
        args=(job_id, messages, user_data)
    )
    thread.daemon = True
    thread.start()
    
    print(f"[Chat Job {job_id}] Đã tạo và bắt đầu background processing")
    
    return job_id

def get_chat_job_status(job_id):
    """Lấy trạng thái của chat job"""
    if job_id not in chat_job_storage:
        return None
    return chat_job_storage[job_id]
