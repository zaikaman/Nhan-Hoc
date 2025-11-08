# -*- coding: utf-8 -*-
"""
Test script để kiểm tra UTF-8 encoding trong pdfAnalysis
"""

import sys
import os

# Thêm thư mục backend vào path
sys.path.insert(0, os.path.dirname(__file__))

from pdfAnalysis import ensure_utf8, create_paragraph
from reportlab.lib.styles import getSampleStyleSheet

def test_utf8_functions():
    """Test các hàm UTF-8"""
    print("Testing UTF-8 functions...")
    
    # Test ensure_utf8
    test_strings = [
        "Tiếng Việt có dấu",
        "Học tập thông minh",
        "Phân tích tài liệu",
        b"Bytes string",
    ]
    
    print("\n1. Testing ensure_utf8():")
    for test_str in test_strings:
        result = ensure_utf8(test_str)
        print(f"   Input: {test_str}")
        print(f"   Output: {result}")
        print(f"   Type: {type(result)}")
        print()
    
    # Test create_paragraph
    print("2. Testing create_paragraph():")
    styles = getSampleStyleSheet()
    test_text = "Đây là text tiếng Việt có dấu: áàảãạ, éèẻẽẹ, íìỉĩị"
    
    try:
        para = create_paragraph(test_text, styles['Normal'])
        print(f"   ✓ Paragraph created successfully with text: {test_text}")
        print(f"   ✓ Paragraph type: {type(para)}")
    except Exception as e:
        print(f"   ✗ Error creating paragraph: {e}")
    
    print("\n✓ All UTF-8 tests completed!")

if __name__ == "__main__":
    test_utf8_functions()
