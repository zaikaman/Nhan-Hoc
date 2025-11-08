"""
Module xử lý Personalized Recommendations với AI
Gợi ý chủ đề tiếp theo, learning path, và điều chỉnh độ khó dựa trên performance
Tối ưu với parallel processing để giảm thời gian response
"""
from openai import OpenAI
import os
from dotenv import load_dotenv
import json
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed
import time

load_dotenv()

# Khởi tạo OpenAI client
client = OpenAI(
    api_key=os.getenv('OPENAI_API_KEY'),
    base_url=os.getenv('OPENAI_BASE_URL', 'https://v98store.com/v1')
)

MODEL = os.getenv('OPENAI_MODEL', 'gpt-5-nano-2025-08-07')

# ThreadPoolExecutor để chạy parallel AI requests
executor = ThreadPoolExecutor(max_workers=3)


def analyze_performance(learning_data):
    """
    Phân tích performance của user để đưa ra recommendations
    
    Returns:
        Dict chứa performance summary, strengths, weaknesses
    """
    quiz_results = learning_data.get('quiz_results', [])
    time_spent = learning_data.get('time_spent', {})
    topics = learning_data.get('current_topics', [])
    
    if not quiz_results:
        return {
            'avg_score': 0,
            'total_quizzes': 0,
            'topics_studied': 0,
            'strong_topics': [],
            'weak_topics': [],
            'total_time_hours': 0,
            'topic_performance': {},
            'recent_trend': 'insufficient_data'
        }
    
    # Tính điểm trung bình
    avg_score = sum(q['score'] for q in quiz_results) / len(quiz_results)
    
    # Phân tích theo topic
    topic_performance = {}
    for topic in topics:
        topic_quizzes = [q for q in quiz_results if q['topic'] == topic]
        if topic_quizzes:
            topic_avg = sum(q['score'] for q in topic_quizzes) / len(topic_quizzes)
            topic_performance[topic] = {
                'avg_score': topic_avg,
                'quizzes': len(topic_quizzes),
                'time_spent': time_spent.get(topic, 0)
            }
    
    # Xác định strong và weak topics
    strong_topics = [
        {'topic': topic, 'score': data['avg_score']} 
        for topic, data in topic_performance.items() 
        if data['avg_score'] >= 80
    ]
    
    weak_topics = [
        {'topic': topic, 'score': data['avg_score']} 
        for topic, data in topic_performance.items() 
        if data['avg_score'] < 70
    ]
    
    # Sắp xếp
    strong_topics.sort(key=lambda x: x['score'], reverse=True)
    weak_topics.sort(key=lambda x: x['score'])
    
    # Tính trend từ quiz gần nhất
    recent_quizzes = quiz_results[-5:]
    recent_trend = 'insufficient_data'
    if len(recent_quizzes) >= 3:
        recent_avg = sum(q['score'] for q in recent_quizzes) / len(recent_quizzes)
        recent_trend = "improving" if recent_avg > avg_score else "stable"
    
    return {
        'avg_score': round(avg_score, 1),
        'total_quizzes': len(quiz_results),
        'topics_studied': len(topics),
        'strong_topics': strong_topics,
        'weak_topics': weak_topics,
        'total_time_hours': round(sum(time_spent.values()) / 3600, 1),
        'topic_performance': topic_performance,
        'recent_trend': recent_trend,
        'recent_scores': [q['score'] for q in recent_quizzes[-3:]]
    }


def recommend_next_topics(learning_data, performance):
    """
    Sử dụng AI để gợi ý các chủ đề tiếp theo dựa trên performance
    Tối ưu context để giảm token và tăng tốc độ
    
    Returns:
        List of recommended topics với lý do, độ ưu tiên, estimated time
    """
    try:
        # Chuẩn bị context TỐI ƯU - chỉ những thông tin cần thiết
        # Fix: An toàn hơn khi format topics
        strong_topics_list = performance.get('strong_topics', [])[:3]
        weak_topics_list = performance.get('weak_topics', [])[:3]
        
        strong_topics_str = ", ".join([f"{t.get('topic', 'N/A')} ({t.get('score', 0):.1f}%)" for t in strong_topics_list]) if strong_topics_list else "Chưa có"
        weak_topics_str = ", ".join([f"{t.get('topic', 'N/A')} ({t.get('score', 0):.1f}%)" for t in weak_topics_list]) if weak_topics_list else "Chưa có"
        
        context = f"""Phân tích học tập:
- Điểm TB: {performance.get('avg_score', 0)}%, {performance.get('total_quizzes', 0)} quiz, {performance.get('topics_studied', 0)} topics
- Mạnh: {strong_topics_str}
- Yếu: {weak_topics_str}
- Xu hướng: {performance.get('recent_trend', 'N/A')}"""
        
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {
                    "role": "system",
                    "content": """AI advisor gợi ý lộ trình học tập.

Trả về JSON:
{
  "performance_summary": "Tóm tắt 2 câu",
  "next_topics": [
    {
      "topic": "Tên topic",
      "reason": "Lý do dựa vào performance",
      "priority": "high/medium/low",
      "relevance_score": 8,
      "estimated_time": "2-3 tuần",
      "prerequisites": ["Kiến thức 1"],
      "benefits": ["Lợi ích 1"]
    }
  ]
}

QUY TẮC:
- Weak topics → Gợi ý củng cố
- Strong topics → Gợi ý nâng cao
- 3-5 topics, ưu tiên phù hợp nhất
- TIẾNG VIỆT"""
                },
                {
                    "role": "user",
                    "content": context
                }
            ],
            temperature=0.7,
            response_format={"type": "json_object"}
        )
        
        result = json.loads(response.choices[0].message.content)
        return result
        
    except Exception as e:
        print(f"Lỗi khi gợi ý topics: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            "performance_summary": "Đang phân tích dữ liệu của bạn để đưa ra gợi ý phù hợp.",
            "next_topics": [
                {
                    "topic": "Chủ đề mới",
                    "reason": "Tiếp tục khám phá các lĩnh vực mới để mở rộng kiến thức",
                    "priority": "medium",
                    "relevance_score": 7,
                    "estimated_time": "2-3 tuần",
                    "prerequisites": [],
                    "benefits": ["Mở rộng kiến thức", "Phát triển kỹ năng mới"]
                }
            ]
        }


def generate_learning_path(learning_data, performance):
    """
    Tạo lộ trình học tập chi tiết (learning path) dựa trên phân tích
    Tối ưu context để giảm token
    
    Returns:
        Dict chứa learning path với các milestones
    """
    try:
        # Context TỐI ƯU
        context = f"""Tạo lộ trình cho:
- Level: {performance['avg_score']}%, {performance['topics_studied']} topics
- Mạnh: {len(performance['strong_topics'])} topics
- Cần cải thiện: {len(performance['weak_topics'])} topics"""
        
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {
                    "role": "system",
                    "content": """Learning Path Designer.

Trả về JSON:
{
  "title": "Tiêu đề lộ trình",
  "description": "Mô tả 2 câu",
  "total_duration": "3-4 tháng",
  "milestones": [
    {
      "title": "Milestone 1: Tên giai đoạn",
      "duration": "2-3 tuần",
      "description": "Mô tả",
      "topics": ["Topic 1", "Topic 2"],
      "goals": ["Mục tiêu 1"]
    }
  ]
}

QUY TẮC:
- 4-6 milestones
- Bắt đầu với nền tảng
- Kết thúc với nâng cao
- TIẾNG VIỆT"""
                },
                {
                    "role": "user",
                    "content": context
                }
            ],
            temperature=0.7,
            response_format={"type": "json_object"}
        )
        
        result = json.loads(response.choices[0].message.content)
        return result
        
    except Exception as e:
        print(f"Lỗi khi tạo learning path: {str(e)}")
        return {
            "title": "Lộ trình học tập cá nhân hóa",
            "description": "Lộ trình được thiết kế dựa trên mức độ và mục tiêu của bạn",
            "total_duration": "3-6 tháng",
            "milestones": [
                {
                    "title": "Giai đoạn 1: Củng cố nền tảng",
                    "duration": "1-2 tháng",
                    "description": "Hoàn thiện các kiến thức cơ bản",
                    "topics": ["Các chủ đề nền tảng"],
                    "goals": ["Nắm vững kiến thức cơ bản"]
                }
            ]
        }


def adjust_difficulty(learning_data, performance):
    """
    Đề xuất điều chỉnh độ khó dựa trên performance
    Tối ưu context
    
    Returns:
        Dict chứa current level, recommended level, reason
    """
    try:
        avg_score = performance['avg_score']
        trend = performance['recent_trend']
        recent_scores = performance.get('recent_scores', [])
        
        # Xác định level hiện tại
        if avg_score >= 90:
            current_level = 'advanced'
        elif avg_score >= 75:
            current_level = 'intermediate'
        elif avg_score >= 60:
            current_level = 'beginner'
        else:
            current_level = 'beginner'
        
        # Context TỐI ƯU
        context = f"""Điều chỉnh độ khó:
- Điểm TB: {avg_score}%, Level: {current_level}
- Xu hướng: {trend}
- Điểm gần nhất: {recent_scores}"""
        
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {
                    "role": "system",
                    "content": """AI Difficulty Specialist.

Trả về JSON:
{
  "current_level": "beginner/intermediate/advanced/expert",
  "recommended_difficulty": "beginner/intermediate/advanced/expert",
  "reason": "Lý do 2 câu",
  "adjustment_tips": ["Tip 1", "Tip 2"]
}

QUY TẮC:
- beginner: <70%, intermediate: 70-84%, advanced: 85-94%, expert: ≥95%
- Điểm cao & ổn định → tăng độ khó
- Điểm thấp → giữ nguyên/giảm
- TIẾNG VIỆT"""
                },
                {
                    "role": "user",
                    "content": context
                }
            ],
            temperature=0.7,
            response_format={"type": "json_object"}
        )
        
        result = json.loads(response.choices[0].message.content)
        return result
        
    except Exception as e:
        print(f"Lỗi khi điều chỉnh difficulty: {str(e)}")
        return {
            "current_level": "intermediate",
            "recommended_difficulty": "intermediate",
            "reason": "Tiếp tục với độ khó hiện tại để củng cố kiến thức",
            "adjustment_tips": ["Làm thêm quiz để đánh giá chính xác hơn"]
        }


def get_personalized_recommendations(learning_data):
    """
    Main function: Tổng hợp tất cả recommendations với PARALLEL PROCESSING
    Chạy 3 AI requests đồng thời thay vì tuần tự để giảm thời gian response
    
    Returns:
        Dict chứa:
        - next_topics: Các chủ đề nên học tiếp
        - learning_path: Lộ trình học tập chi tiết
        - difficulty_adjustment: Điều chỉnh độ khó
        - general_tips: Các tips chung
    """
    start_time = time.time()
    print("🚀 Bắt đầu phân tích recommendations (parallel mode)...")
    
    # Phân tích performance (local, rất nhanh)
    performance = analyze_performance(learning_data)
    print(f"✅ Performance analyzed: {performance['avg_score']}% avg, {performance['total_quizzes']} quizzes")
    
    # Chạy 3 AI requests PARALLEL thay vì tuần tự
    # Điều này giảm thời gian từ ~6-9s xuống còn ~2-3s
    futures = {}
    
    with ThreadPoolExecutor(max_workers=3) as executor:
        print("⚡ Submitting 3 parallel AI requests...")
        
        # Submit tất cả requests cùng lúc
        futures['topics'] = executor.submit(recommend_next_topics, learning_data, performance)
        futures['path'] = executor.submit(generate_learning_path, learning_data, performance)
        futures['difficulty'] = executor.submit(adjust_difficulty, learning_data, performance)
        
        # Đợi tất cả hoàn thành và lấy kết quả
        results = {}
        for key, future in futures.items():
            try:
                results[key] = future.result(timeout=15)  # Timeout 15s cho mỗi request
                print(f"✅ {key} completed")
            except Exception as e:
                print(f"❌ Error in {key}: {str(e)}")
                import traceback
                traceback.print_exc()  # In full traceback để debug
                
                # Fallback nếu có lỗi
                if key == 'topics':
                    results[key] = {
                        "performance_summary": "Đang phân tích dữ liệu của bạn",
                        "next_topics": []
                    }
                elif key == 'path':
                    results[key] = {
                        "title": "Lộ trình học tập",
                        "description": "Đang tạo lộ trình phù hợp",
                        "total_duration": "3-6 tháng",
                        "milestones": []
                    }
                else:  # difficulty
                    results[key] = {
                        "current_level": "intermediate",
                        "recommended_difficulty": "intermediate",
                        "reason": "Đang phân tích",
                        "adjustment_tips": []
                    }
    
    # General tips dựa trên performance
    general_tips = []
    
    if performance['avg_score'] < 70:
        general_tips.append("Hãy dành nhiều thời gian hơn để ôn lại các concepts cơ bản trước khi học topics mới")
        general_tips.append("Thử làm lại các quiz cũ để củng cố kiến thức")
    
    if performance['topics_studied'] < 3:
        general_tips.append("Hãy khám phá thêm nhiều topics khác nhau để tìm ra lĩnh vực bạn yêu thích")
    
    if performance['total_time_hours'] < 2:
        general_tips.append("Dành ít nhất 30 phút mỗi ngày để học tập sẽ giúp bạn tiến bộ nhanh hơn")
    
    if performance['weak_topics']:
        general_tips.append("Tập trung vào các topics bạn còn yếu sẽ giúp tăng điểm số tổng thể")
    
    if not general_tips:
        general_tips.append("Bạn đang học tập rất tốt! Hãy tiếp tục duy trì nhịp độ này")
        general_tips.append("Thử thách bản thân với các topics nâng cao hơn")
    
    elapsed_time = time.time() - start_time
    print(f"🎉 Recommendations completed in {elapsed_time:.2f}s (parallel mode)")
    
    return {
        'recommendations': {
            'performance_summary': results['topics'].get('performance_summary', ''),
            'general_tips': general_tips
        },
        'next_topics': results['topics'].get('next_topics', []),
        'learning_path': results['path'],
        'difficulty_adjustment': results['difficulty'],
        'performance': performance,
        'processing_time': round(elapsed_time, 2)
    }
