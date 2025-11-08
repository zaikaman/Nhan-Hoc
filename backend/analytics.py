"""
Module xử lý phân tích học tập (Learning Analytics) với AI
Background jobs support
"""
from openai import OpenAI
import os
from dotenv import load_dotenv
import json
from datetime import datetime, timedelta
import uuid
import threading

load_dotenv()

# Khởi tạo OpenAI client
client = OpenAI(
    api_key=os.getenv('OPENAI_API_KEY'),
    base_url=os.getenv('OPENAI_BASE_URL', 'https://api.openai.com/v1')
)

MODEL = os.getenv('OPENAI_MODEL', 'gpt-3.5-turbo')

# Lưu trữ trạng thái các job trong bộ nhớ
analytics_job_storage = {}


def calculate_progress_metrics(learning_data):
    """
    Tính toán các metrics cơ bản từ dữ liệu học tập
    
    Args:
        learning_data: Dict chứa learning_activities, quiz_results, time_spent
        
    Returns:
        Dict chứa các metrics: total_time, avg_score, topics_studied, etc.
    """
    activities = learning_data.get('learning_activities', [])
    quiz_results = learning_data.get('quiz_results', [])
    time_spent = learning_data.get('time_spent', {})
    
    # Tính tổng thời gian học (seconds)
    total_time = sum(time_spent.values())
    
    # Tính điểm trung bình quiz
    if quiz_results:
        avg_score = sum(q['score'] for q in quiz_results) / len(quiz_results)
        total_quizzes = len(quiz_results)
        passed_quizzes = sum(1 for q in quiz_results if q.get('passed', q['score'] >= 70))
    else:
        avg_score = 0
        total_quizzes = 0
        passed_quizzes = 0
    
    # Số lượng topics đã học
    topics_studied = learning_data.get('current_topics', [])
    
    # Phân tích theo từng topic
    topic_breakdown = {}
    for topic in topics_studied:
        topic_quizzes = [q for q in quiz_results if q['topic'] == topic]
        topic_time = time_spent.get(topic, 0)
        
        topic_breakdown[topic] = {
            'time_spent': topic_time,
            'quizzes_taken': len(topic_quizzes),
            'avg_score': sum(q['score'] for q in topic_quizzes) / len(topic_quizzes) if topic_quizzes else 0,
            'passed': sum(1 for q in topic_quizzes if q.get('passed', q['score'] >= 70))
        }
    
    # Tính streak (số ngày học liên tiếp)
    dates = set()
    for activity in activities:
        if 'date' in activity:
            dates.add(activity['date'])
    for quiz in quiz_results:
        if 'date' in quiz:
            dates.add(quiz['date'])
    
    # Sắp xếp dates và tính streak
    sorted_dates = sorted(dates, reverse=True)
    current_streak = 0
    if sorted_dates:
        today = datetime.now().date().isoformat()
        yesterday = (datetime.now().date() - timedelta(days=1)).isoformat()
        
        if sorted_dates[0] == today or sorted_dates[0] == yesterday:
            current_streak = 1
            for i in range(len(sorted_dates) - 1):
                date1 = datetime.fromisoformat(sorted_dates[i]).date()
                date2 = datetime.fromisoformat(sorted_dates[i + 1]).date()
                if (date1 - date2).days == 1:
                    current_streak += 1
                else:
                    break
    
    return {
        'total_time_seconds': total_time,
        'total_time_hours': round(total_time / 3600, 1),
        'avg_quiz_score': round(avg_score, 1),
        'total_quizzes': total_quizzes,
        'passed_quizzes': passed_quizzes,
        'topics_studied': len(topics_studied),
        'topic_breakdown': topic_breakdown,
        'current_streak': current_streak,
        'total_activities': len(activities),
    }


def analyze_learning_patterns(learning_data):
    """
    Sử dụng AI để phân tích patterns và đưa ra insights
    
    Args:
        learning_data: Dict chứa learning_activities, quiz_results
        
    Returns:
        Dict chứa AI insights về strengths, weaknesses, recommendations
    """
    try:
        # Chuẩn bị dữ liệu cho AI
        metrics = calculate_progress_metrics(learning_data)
        quiz_results = learning_data.get('quiz_results', [])
        
        # Tạo summary cho AI
        summary = f"""
Phân tích dữ liệu học tập của học viên:

TỔNG QUAN:
- Tổng thời gian học: {metrics['total_time_hours']} giờ
- Số chủ đề đã học: {metrics['topics_studied']}
- Số bài quiz đã làm: {metrics['total_quizzes']}
- Điểm trung bình: {metrics['avg_quiz_score']}%
- Số bài đạt (≥70%): {metrics['passed_quizzes']}/{metrics['total_quizzes']}
- Streak hiện tại: {metrics['current_streak']} ngày

CHI TIẾT THEO TOPIC:
"""
        
        for topic, data in metrics['topic_breakdown'].items():
            summary += f"\n{topic}:"
            summary += f"\n  - Thời gian: {round(data['time_spent']/60, 1)} phút"
            summary += f"\n  - Quiz: {data['quizzes_taken']} bài (Điểm TB: {data['avg_score']:.1f}%)"
            summary += f"\n  - Đạt: {data['passed']}/{data['quizzes_taken']}"
        
        if quiz_results:
            summary += "\n\nKẾT QUẢ QUIZ GẦN ĐÂY:"
            for quiz in quiz_results[-5:]:  # 5 quiz gần nhất
                summary += f"\n- {quiz['topic']}: {quiz['score']:.1f}% ({quiz['correct_answers']}/{quiz['total_questions']} câu đúng)"
        
        # Gọi AI để phân tích
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {
                    "role": "system",
                    "content": """Bạn là một AI phân tích học tập chuyên nghiệp. 
Nhiệm vụ: Phân tích dữ liệu học tập và đưa ra insights sâu sắc.

Trả về JSON với format CHÍNH XÁC này:
{
  "summary": "Tóm tắt ngắn gọn về tình hình học tập (2-3 câu)",
  "strengths": [
    {
      "area": "Tên lĩnh vực mạnh",
      "score": 8,
      "description": "Mô tả chi tiết điểm mạnh"
    }
  ],
  "weaknesses": [
    {
      "area": "Tên lĩnh vực yếu",
      "score": 5,
      "description": "Mô tả chi tiết điểm yếu",
      "improvement_tips": "Gợi ý cải thiện cụ thể"
    }
  ],
  "recommendations": [
    {
      "title": "Tiêu đề gợi ý",
      "description": "Mô tả chi tiết",
      "priority": "high",
      "action_items": ["Hành động 1", "Hành động 2"]
    }
  ],
  "next_focus": "Chủ đề nên tập trung tiếp theo"
}

Lưu ý:
- score: 1-10
- priority: "high", "medium", hoặc "low"
- Phân tích CỤ THỂ dựa trên dữ liệu thực tế
- Đưa ra gợi ý THỰC TẾ và HÀNH ĐỘNG được
- Sử dụng ngôn ngữ thân thiện, động viên
- Trả lời bằng TIẾNG VIỆT"""
                },
                {
                    "role": "user",
                    "content": summary
                }
            ],
            temperature=0.7,
            response_format={"type": "json_object"}
        )
        
        insights = json.loads(response.choices[0].message.content)
        return insights
        
    except Exception as e:
        print(f"Lỗi khi phân tích patterns: {str(e)}")
        return {
            "summary": "Chưa đủ dữ liệu để phân tích chi tiết.",
            "strengths": [
                {
                    "area": "Khởi đầu tốt",
                    "score": 7,
                    "description": "Bạn đang bắt đầu hành trình học tập một cách tích cực!"
                }
            ],
            "weaknesses": [
                {
                    "area": "Dữ liệu học tập",
                    "score": 3,
                    "description": "Cần thêm dữ liệu để phân tích chính xác hơn",
                    "improvement_tips": "Hãy làm thêm quiz và xem tài liệu để có insights chi tiết hơn"
                }
            ],
            "recommendations": [
                {
                    "title": "Bắt đầu với quiz",
                    "description": "Làm quiz để AI có thể phân tích khả năng của bạn",
                    "priority": "high",
                    "action_items": ["Chọn một chủ đề", "Hoàn thành ít nhất 3 quiz"]
                }
            ],
            "next_focus": "Bất kỳ chủ đề nào bạn quan tâm"
        }


def get_topic_insights(learning_data, topic_name):
    """
    Lấy insights chi tiết cho một topic cụ thể
    
    Args:
        learning_data: Dict chứa learning data
        topic_name: Tên topic cần phân tích
        
    Returns:
        Dict chứa insights về topic đó
    """
    quiz_results = [q for q in learning_data.get('quiz_results', []) if q['topic'] == topic_name]
    activities = [a for a in learning_data.get('learning_activities', []) if a.get('topic') == topic_name]
    
    if not quiz_results and not activities:
        return {
            "message": f"Chưa có dữ liệu cho topic {topic_name}",
            "suggestions": [f"Hãy bắt đầu học {topic_name} ngay!"]
        }
    
    # Tính metrics cho topic
    total_time = sum(a.get('duration', 0) for a in activities)
    avg_score = sum(q['score'] for q in quiz_results) / len(quiz_results) if quiz_results else 0
    
    try:
        # Gọi AI để phân tích topic cụ thể
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {
                    "role": "system",
                    "content": """Bạn là chuyên gia phân tích học tập.
Trả về JSON:
{
  "mastery_level": "Beginner/Intermediate/Advanced/Expert",
  "progress": 0-100,
  "key_concepts_mastered": ["khái niệm 1", "khái niệm 2"],
  "areas_to_improve": ["lĩnh vực cần cải thiện 1", "lĩnh vực 2"],
  "next_steps": ["bước tiếp theo 1", "bước 2"]
}
Trả lời bằng TIẾNG VIỆT."""
                },
                {
                    "role": "user",
                    "content": f"""Phân tích học tập cho topic: {topic_name}
                    
Thời gian học: {round(total_time/60, 1)} phút
Số quiz: {len(quiz_results)}
Điểm trung bình: {avg_score:.1f}%

Chi tiết quiz:
{json.dumps([{'score': q['score'], 'passed': q.get('passed', q['score'] >= 70)} for q in quiz_results], indent=2)}"""
                }
            ],
            temperature=0.7,
            response_format={"type": "json_object"}
        )
        
        insights = json.loads(response.choices[0].message.content)
        insights['stats'] = {
            'total_time_minutes': round(total_time/60, 1),
            'quizzes_taken': len(quiz_results),
            'avg_score': round(avg_score, 1)
        }
        
        return insights
        
    except Exception as e:
        print(f"Lỗi khi phân tích topic: {str(e)}")
        return {
            "mastery_level": "Đang học",
            "progress": min(int(avg_score), 100),
            "stats": {
                'total_time_minutes': round(total_time/60, 1),
                'quizzes_taken': len(quiz_results),
                'avg_score': round(avg_score, 1)
            }
        }


def generate_study_plan(learning_data):
    """
    Tạo study plan dựa trên phân tích
    
    Args:
        learning_data: Dict chứa learning data
        
    Returns:
        Dict chứa study plan chi tiết
    """
    try:
        metrics = calculate_progress_metrics(learning_data)
        insights = analyze_learning_patterns(learning_data)
        
        # Gọi AI để tạo study plan
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {
                    "role": "system",
                    "content": """Bạn là AI tư vấn học tập.
Tạo study plan chi tiết dưới dạng JSON:
{
  "daily_plan": [
    {"day": "Thứ 2", "focus": "Topic", "activities": ["Hoạt động 1", "Hoạt động 2"], "estimated_time": "30 phút"},
    ...
  ],
  "weekly_goals": ["Mục tiêu 1", "Mục tiêu 2"],
  "priority_topics": ["Topic ưu tiên 1", "Topic 2"],
  "tips": ["Tip 1", "Tip 2"]
}
Trả lời bằng TIẾNG VIỆT."""
                },
                {
                    "role": "user",
                    "content": f"""Tạo study plan dựa trên:
                    
Metrics: {json.dumps(metrics, ensure_ascii=False, indent=2)}

Insights: {json.dumps(insights, ensure_ascii=False, indent=2)}"""
                }
            ],
            temperature=0.7,
            response_format={"type": "json_object"}
        )
        
        study_plan = json.loads(response.choices[0].message.content)
        return study_plan
        
    except Exception as e:
        print(f"Lỗi khi tạo study plan: {str(e)}")
        return {
            "daily_plan": [],
            "weekly_goals": ["Hoàn thành ít nhất 3 quiz", "Học ít nhất 30 phút mỗi ngày"],
            "priority_topics": insights.get('next_focus', 'Tiếp tục học') if 'insights' in locals() else 'Bất kỳ topic nào',
            "tips": ["Học đều đặn mỗi ngày", "Ôn lại những phần còn yếu"]
        }


def process_analytics_insights_job(job_id, learning_data):
    """Xử lý analytics insights job trong background thread"""
    try:
        print(f"[Analytics Job {job_id}] Bắt đầu xử lý...")
        analytics_job_storage[job_id]['status'] = 'processing'
        analytics_job_storage[job_id]['updated_at'] = datetime.now().isoformat()
        
        # Gọi hàm phân tích
        result = analyze_learning_patterns(learning_data)
        
        # Cập nhật kết quả
        analytics_job_storage[job_id]['status'] = 'completed'
        analytics_job_storage[job_id]['result'] = result
        analytics_job_storage[job_id]['updated_at'] = datetime.now().isoformat()
        analytics_job_storage[job_id]['completed_at'] = datetime.now().isoformat()
        
        print(f"[Analytics Job {job_id}] Hoàn thành!")
        
    except Exception as e:
        print(f"[Analytics Job {job_id}] Lỗi: {str(e)}")
        import traceback
        traceback.print_exc()
        analytics_job_storage[job_id]['status'] = 'failed'
        analytics_job_storage[job_id]['error'] = str(e)
        analytics_job_storage[job_id]['updated_at'] = datetime.now().isoformat()


def create_analytics_insights_job(learning_data):
    """
    Tạo analytics insights job và trả về job_id ngay lập tức
    
    Args:
        learning_data: Dict chứa learning data
    
    Returns:
        String job_id
    """
    job_id = str(uuid.uuid4())
    
    # Khởi tạo job
    analytics_job_storage[job_id] = {
        'job_id': job_id,
        'status': 'pending',
        'learning_data': learning_data,
        'created_at': datetime.now().isoformat(),
        'updated_at': datetime.now().isoformat(),
        'result': None,
        'error': None
    }
    
    # Chạy xử lý trong background thread
    thread = threading.Thread(
        target=process_analytics_insights_job,
        args=(job_id, learning_data)
    )
    thread.daemon = True
    thread.start()
    
    print(f"[Analytics Job {job_id}] Đã tạo và bắt đầu background processing")
    
    return job_id


def get_analytics_job_status(job_id):
    """Lấy trạng thái của analytics job"""
    if job_id not in analytics_job_storage:
        return None
    return analytics_job_storage[job_id]
