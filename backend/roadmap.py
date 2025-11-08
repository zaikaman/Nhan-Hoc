import os
from openai import OpenAI
import json
from dotenv import load_dotenv


load_dotenv()

client = OpenAI(
    api_key=os.environ.get("OPENAI_API_KEY"),
    base_url=os.environ.get("OPENAI_BASE_URL")
)


def create_roadmap(topic, time, knowledge_level):
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
