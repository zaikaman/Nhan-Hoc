"""
Install the OpenAI Python SDK

$ pip install openai
"""

import os
from openai import OpenAI
from dotenv import load_dotenv
import json

load_dotenv()

client = OpenAI(
    api_key=os.environ.get("OPENAI_API_KEY"),
    base_url=os.environ.get("OPENAI_BASE_URL")
)


def get_quiz(course, topic, subtopic, description):
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
