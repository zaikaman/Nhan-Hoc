"""
Install the OpenAI Python SDK

$ pip install openai
"""

import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(
    api_key=os.environ.get("OPENAI_API_KEY"),
    base_url=os.environ.get("OPENAI_BASE_URL")
)


def generate_resources(course, knowledge_level, description, time):
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
