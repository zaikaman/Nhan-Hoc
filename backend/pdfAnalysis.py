from flask import request, send_file
import os
import json
import tempfile
import io
import PyPDF2
import uuid
import threading
import base64
from datetime import datetime
from openai import OpenAI
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle
from reportlab.lib.enums import TA_JUSTIFY, TA_LEFT, TA_CENTER
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from dotenv import load_dotenv

load_dotenv()

# Cấu hình API
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
client = OpenAI(api_key=OPENAI_API_KEY)

# Lưu trữ trạng thái các job trong bộ nhớ
pdf_job_storage = {}

def trích_xuất_text_từ_pdf(pdf_path):
    """Trích xuất nội dung text từ file PDF"""
    text = ""
    try:
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            num_pages = len(pdf_reader.pages)
            
            # Trích xuất text từ tất cả các trang
            for page_num in range(num_pages):
                page = pdf_reader.pages[page_num]
                text += page.extract_text() + "\n\n"
            
            print(f"✓ Đã trích xuất text từ {num_pages} trang")
    except Exception as e:
        print(f"Lỗi khi trích xuất PDF: {str(e)}")
        raise
    
    return text

def phân_tích_với_ai(text):
    """Sử dụng OpenAI để phân tích tài liệu học thuật và tạo insights có cấu trúc"""
    try:
        # Ví dụ JSON mẫu
        example_json = """{
    "tieu_de": "Ứng dụng Machine Learning trong Chẩn đoán Y tế",
    "tom_tat": "Bài báo này khám phá việc ứng dụng các mô hình deep learning trong phân tích hình ảnh y tế. Nghiên cứu chứng minh rằng mạng neural tích chập có thể đạt độ chính xác 95% trong việc phát hiện ung thư giai đoạn đầu. Nghiên cứu cung cấp một framework để tích hợp AI vào quy trình làm việc lâm sàng trong khi vẫn đảm bảo an toàn bệnh nhân và quyền riêng tư dữ liệu.",
    "muc_tieu_hoc_tap": [
        "Hiểu cách các kiến trúc deep learning xử lý dữ liệu hình ảnh y tế",
        "Đánh giá hiệu quả của transfer learning trong ứng dụng y tế",
        "Phân tích các vấn đề đạo đức của chẩn đoán y tế hỗ trợ bởi AI"
    ],
    "do_kho": "Nâng cao / Sau đại học",
    "thoi_gian_hoc_uoc_tinh": "45-60 phút",
    "thuat_ngu_chinh": {
        "Mạng Neural Tích chập (CNN)": "Một kiến trúc deep learning được thiết kế đặc biệt để xử lý dữ liệu dạng lưới như hình ảnh, sử dụng các lớp tích chập để phát hiện các mẫu.",
        "Transfer Learning": "Một kỹ thuật machine learning trong đó một mô hình được huấn luyện trên một tác vụ được tái sử dụng cho một tác vụ liên quan thứ hai, giảm thời gian huấn luyện và yêu cầu dữ liệu.",
        "Cross-validation": "Một phương pháp thống kê để đánh giá hiệu suất mô hình bằng cách chia dữ liệu thành các tập huấn luyện và kiểm tra nhiều lần."
    },
    "phat_hien_chinh": [
        "Mô hình deep learning đạt độ chính xác 95% trong phát hiện ung thư từ hình ảnh CT",
        "Framework được đề xuất giảm thời gian chẩn đoán 40% so với phân tích thủ công",
        "Transfer learning từ các mô hình đã được huấn luyện trước cải thiện đáng kể hiệu suất trên tập dữ liệu nhỏ",
        "Hệ thống duy trì hiệu suất cao trên các nhóm nhân khẩu học khác nhau",
        "Việc tích hợp với hệ thống bệnh viện hiện có là khả thi với sự gián đoạn quy trình làm việc tối thiểu"
    ],
    "phuong_phap_nghien_cuu": "Các nhà nghiên cứu sử dụng tập dữ liệu 50,000 hình ảnh y tế đã được gán nhãn để huấn luyện một mạng neural tích chập dựa trên ResNet. Họ sử dụng transfer learning, data augmentation và cross-validation để đảm bảo tính mạnh mẽ của mô hình. Xác thực lâm sàng được thực hiện thông qua một nghiên cứu tiến cứu với 500 bệnh nhân.",
    "y_nghia": "Nghiên cứu này chứng minh rằng chẩn đoán hỗ trợ bởi AI có thể cải thiện đáng kể kết quả y tế bằng cách cung cấp chẩn đoán nhanh hơn và chính xác hơn. Framework có thể được điều chỉnh cho các tác vụ hình ảnh y tế khác và có tiềm năng giảm chi phí y tế trong khi cải thiện chăm sóc bệnh nhân, đặc biệt trong các môi trường y tế hạn chế tài nguyên.",
    "ung_dung_thuc_te": [
        "Phát hiện ung thư sớm trong các khoa X quang",
        "Sàng lọc tự động trong các cơ sở y tế hạn chế tài nguyên",
        "Hệ thống tư vấn thứ hai để giảm lỗi chẩn đoán",
        "Công cụ đào tạo cho sinh viên y khoa và bác sĩ nội trú"
    ],
    "cau_hoi_tu_duy_phe_phan": [
        "Rủi ro tiềm ẩn của việc quá phụ thuộc vào hệ thống chẩn đoán AI trong thực hành lâm sàng là gì?",
        "Làm thế nào các bias về nhân khẩu học trong dữ liệu huấn luyện có thể ảnh hưởng đến hiệu suất mô hình trên các quần thể bệnh nhân khác nhau?",
        "Cần có các framework quy định nào để đảm bảo an toàn bệnh nhân khi triển khai các công cụ chẩn đoán AI?"
    ],
    "cau_hoi_on_tap": [
        {
            "cau_hoi": "Kiến trúc deep learning nào được sử dụng trong nghiên cứu này?",
            "tra_loi": "Mạng Neural Tích chập (CNN) dựa trên ResNet",
            "do_kho": "Dễ"
        },
        {
            "cau_hoi": "Transfer learning đã cải thiện hiệu suất của mô hình như thế nào?",
            "tra_loi": "Transfer learning cải thiện đáng kể hiệu suất trên tập dữ liệu nhỏ bằng cách tận dụng kiến thức từ các mô hình đã được huấn luyện trước, giảm nhu cầu về dữ liệu huấn luyện rộng rãi.",
            "do_kho": "Trung bình"
        },
        {
            "cau_hoi": "Phân tích sự đánh đổi giữa tốc độ chẩn đoán và độ chính xác trong hình ảnh y tế hỗ trợ bởi AI.",
            "tra_loi": "Trong khi hệ thống đạt được chẩn đoán nhanh hơn 40% và duy trì độ chính xác 95%, có sự cân bằng giữa lợi ích về tốc độ và đảm bảo thời gian xem xét đủ cho các trường hợp phức tạp. Hệ thống nên bổ sung chứ không phải thay thế chuyên môn của con người, đặc biệt cho các trường hợp biên.",
            "do_kho": "Khó"
        }
    ],
    "ban_do_tu_duy": {
        "khai_niem_trung_tam": "Chẩn đoán Y tế Hỗ trợ AI",
        "nhanh": [
            {
                "chu_de": "Phương pháp Kỹ thuật",
                "diem": ["Kiến trúc deep learning", "Chiến lược transfer learning", "Kỹ thuật data augmentation"],
                "mau": "blue"
            },
            {
                "chu_de": "Hiệu suất Lâm sàng",
                "diem": ["Độ chính xác phát hiện 95%", "Chẩn đoán nhanh hơn 40%", "Độ tin cậy xuyên nhân khẩu học"],
                "mau": "green"
            },
            {
                "chu_de": "Triển khai",
                "diem": ["Tích hợp hệ thống bệnh viện", "Tối ưu hóa quy trình", "Bảo vệ quyền riêng tư"],
                "mau": "orange"
            },
            {
                "chu_de": "Cân nhắc Đạo đức",
                "diem": ["Bias thuật toán", "Sự đồng ý của bệnh nhân", "Tuân thủ quy định"],
                "mau": "red"
            }
        ]
    },
    "tom_tat_truc_quan": {
        "quy_trinh": [
            "Thu thập Hình ảnh → Tiền xử lý Dữ liệu → Huấn luyện CNN → Xác thực → Triển khai Lâm sàng"
        ],
        "chi_so_chinh": {
            "Độ chính xác": "95%",
            "Cải thiện Tốc độ": "40%",
            "Kích thước Dữ liệu": "50,000 hình ảnh"
        }
    }
}"""
        
        prompt = f"""Bạn là một chuyên gia phân tích nghiên cứu học thuật. Hãy phân tích tài liệu học thuật sau đây và cung cấp một bản tổng hợp kiến thức toàn diện BẰNG TIẾNG VIỆT.

Nội dung Tài liệu Học thuật:
{text[:15000]}

HƯỚNG DẪN QUAN TRỌNG:
1. Bạn PHẢI trả lời chỉ với JSON hợp lệ - không có văn bản giải thích trước hoặc sau
2. Tuân theo CẤU TRÚC CHÍNH XÁC này (đây là ví dụ hoàn chỉnh):

{example_json}

3. Phản hồi của bạn phải bắt đầu bằng {{ và kết thúc bằng }}
4. Đảm bảo tất cả các chuỗi được escape và quote đúng cách
5. Không bao gồm bất kỳ định dạng markdown, code blocks hoặc giải thích nào
6. TẤT CẢ nội dung phải bằng TIẾNG VIỆT

Bây giờ hãy phân tích tài liệu học thuật ở trên và cung cấp phản hồi của bạn theo CHÍNH XÁC định dạng JSON như ví dụ."""

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "Bạn là một chuyên gia phân tích nghiên cứu học thuật. Bạn PHẢI trả lời chỉ với JSON hợp lệ BẰNG TIẾNG VIỆT. Không bao gồm bất kỳ văn bản nào trước hoặc sau JSON. Không sử dụng markdown code blocks. Bắt đầu phản hồi của bạn bằng { và kết thúc bằng }."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )
        
        content = response.choices[0].message.content.strip()
        
        # Log response for debugging
        print(f"Raw AI response (first 200 chars): {content[:200]}")
        
        # Remove markdown code blocks if present
        if content.startswith("```json"):
            content = content[7:]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
        
        content = content.strip()
        
        # Check if response is empty
        if not content:
            raise Exception("AI trả về phản hồi rỗng")
        
        # Check if response starts with valid JSON
        if not content.startswith("{"):
            print(f"Cảnh báo: Phản hồi không bắt đầu bằng '{{'. First 100 chars: {content[:100]}")
            json_start = content.find("{")
            if json_start != -1:
                content = content[json_start:]
                print(f"Đã trích xuất JSON bắt đầu từ vị trí {json_start}")
            else:
                raise Exception(f"Không tìm thấy JSON object trong phản hồi. Response: {content[:200]}")
        
        analysis = json.loads(content)
        print("✓ Phân tích AI hoàn tất thành công")
        return analysis
        
    except json.JSONDecodeError as e:
        print(f"Lỗi JSON decode: {str(e)}")
        print(f"Failed content (first 500 chars): {content[:500] if 'content' in locals() else 'Không có nội dung'}")
        raise Exception(f"Không thể parse phản hồi AI thành JSON: {str(e)}")
    except Exception as e:
        print(f"Lỗi trong phân tích AI: {str(e)}")
        raise Exception(f"Không thể tạo phân tích AI: {str(e)}")

def tạo_pdf_flashcard(analysis, output_path):
    """Tạo PDF flashcard kiến thức giáo dục đẹp và toàn diện"""
    try:
        # Đăng ký font Unicode hỗ trợ tiếng Việt
        # Sử dụng font Arial có sẵn trên Windows
        try:
            # Đường dẫn font trên Windows
            pdfmetrics.registerFont(TTFont('Arial', 'C:/Windows/Fonts/arial.ttf'))
            pdfmetrics.registerFont(TTFont('Arial-Bold', 'C:/Windows/Fonts/arialbd.ttf'))
            pdfmetrics.registerFont(TTFont('Arial-Italic', 'C:/Windows/Fonts/ariali.ttf'))
            font_name = 'Arial'
            font_bold = 'Arial-Bold'
            font_italic = 'Arial-Italic'
        except:
            # Fallback to default if Arial not found
            font_name = 'Helvetica'
            font_bold = 'Helvetica-Bold'
            font_italic = 'Helvetica-Oblique'
        
        doc = SimpleDocTemplate(output_path, pagesize=letter,
                                rightMargin=60, leftMargin=60,
                                topMargin=60, bottomMargin=40)
        
        elements = []
        styles = getSampleStyleSheet()
        
        # ============= CÁC STYLE TÙY CHỈNH =============
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=26,
            textColor=colors.HexColor('#1a237e'),
            spaceAfter=10,
            spaceBefore=20,
            alignment=TA_CENTER,
            fontName=font_bold
        )
        
        subtitle_style = ParagraphStyle(
            'Subtitle',
            parent=styles['Normal'],
            fontSize=11,
            textColor=colors.HexColor('#5e35b1'),
            spaceAfter=20,
            alignment=TA_CENTER,
            fontName=font_italic
        )
        
        section_header_style = ParagraphStyle(
            'SectionHeader',
            parent=styles['Heading2'],
            fontSize=18,
            textColor=colors.white,
            spaceAfter=15,
            spaceBefore=20,
            fontName=font_bold,
            backColor=colors.HexColor('#1976d2'),
            borderPadding=(8, 8, 8, 8),
            leftIndent=10
        )
        
        body_style = ParagraphStyle(
            'CustomBody',
            parent=styles['BodyText'],
            fontSize=11,
            textColor=colors.HexColor('#212121'),
            spaceAfter=12,
            alignment=TA_JUSTIFY,
            leading=16,
            fontName=font_name
        )
        
        highlight_style = ParagraphStyle(
            'Highlight',
            parent=styles['BodyText'],
            fontSize=11,
            textColor=colors.HexColor('#1565c0'),
            spaceAfter=10,
            leftIndent=15,
            rightIndent=15,
            backColor=colors.HexColor('#e3f2fd'),
            borderColor=colors.HexColor('#1976d2'),
            borderWidth=1,
            borderPadding=10,
            leading=15,
            fontName=font_name
        )
        
        term_style = ParagraphStyle(
            'Term',
            parent=styles['BodyText'],
            fontSize=10,
            textColor=colors.HexColor('#2e7d32'),
            spaceAfter=8,
            leftIndent=20,
            leading=13,
            fontName=font_bold
        )
        
        definition_style = ParagraphStyle(
            'Definition',
            parent=styles['BodyText'],
            fontSize=10,
            textColor=colors.HexColor('#424242'),
            spaceAfter=10,
            leftIndent=35,
            leading=13,
            fontName=font_name
        )
        
        subsection_style = ParagraphStyle(
            'Subsection',
            parent=styles['Heading3'],
            fontSize=14,
            textColor=colors.HexColor('#0277bd'),
            spaceAfter=10,
            spaceBefore=12,
            fontName=font_bold
        )
        
        question_style = ParagraphStyle(
            'Question',
            parent=styles['BodyText'],
            fontSize=10,
            textColor=colors.HexColor('#d32f2f'),
            spaceAfter=6,
            fontName=font_bold,
            leftIndent=15
        )
        
        answer_style = ParagraphStyle(
            'Answer',
            parent=styles['BodyText'],
            fontSize=10,
            textColor=colors.HexColor('#424242'),
            spaceAfter=12,
            leftIndent=25,
            leading=13,
            fontName=font_name
        )
        
        # ============= TRANG BÌA =============
        elements.append(Spacer(1, 40))
        
        # Thanh trang trí trên cùng
        top_bar = Table([['']], colWidths=[doc.width])
        top_bar.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#1976d2')),
            ('LINEBELOW', (0, 0), (-1, -1), 4, colors.HexColor('#0d47a1'))
        ]))
        elements.append(top_bar)
        elements.append(Spacer(1, 30))
        
        # Tiêu đề
        title = Paragraph(f"<b>{analysis['tieu_de']}</b>", title_style)
        elements.append(title)
        
        # Hộp metadata
        metadata_text = f"""<b>Độ khó:</b> {analysis.get('do_kho', 'Trung bình')} | 
        <b>Thời gian học:</b> {analysis.get('thoi_gian_hoc_uoc_tinh', '30-45 phút')}"""
        elements.append(Paragraph(metadata_text, subtitle_style))
        elements.append(Spacer(1, 20))
        
        # Hộp mục tiêu học tập
        if analysis.get('muc_tieu_hoc_tap'):
            obj_data = [[Paragraph("<b>🎯 Mục tiêu Học tập</b>", body_style)]]
            for obj in analysis['muc_tieu_hoc_tap']:
                obj_data.append([Paragraph(f"• {obj}", body_style)])
            
            obj_table = Table(obj_data, colWidths=[doc.width])
            obj_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#e8f5e9')),
                ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#f1f8e9')),
                ('BOX', (0, 0), (-1, -1), 2, colors.HexColor('#388e3c')),
                ('LEFTPADDING', (0, 0), (-1, -1), 12),
                ('RIGHTPADDING', (0, 0), (-1, -1), 12),
                ('TOPPADDING', (0, 0), (-1, -1), 8),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ]))
            elements.append(obj_table)
            elements.append(Spacer(1, 20))
        
        # ============= TÓM TẮT TỔNG QUAN =============
        elements.append(Paragraph("📋 Tóm tắt Tổng quan", section_header_style))
        elements.append(Spacer(1, 5))
        
        summary_text = analysis['tom_tat']
        if isinstance(summary_text, list):
            summary_text = ' '.join(summary_text)
        
        elements.append(Paragraph(summary_text, highlight_style))
        elements.append(Spacer(1, 15))
        
        # ============= CHỈ SỐ CHÍNH =============
        if analysis.get('tom_tat_truc_quan', {}).get('chi_so_chinh'):
            metrics = analysis['tom_tat_truc_quan']['chi_so_chinh']
            elements.append(Paragraph("📊 Chỉ số Chính Nhanh", body_style))
            
            metric_data = []
            for key, value in metrics.items():
                metric_data.append([
                    Paragraph(f"<b>{key}</b>", body_style),
                    Paragraph(f"<font size=14 color='#1976d2'><b>{value}</b></font>", body_style)
                ])
            
            metric_table = Table(metric_data, colWidths=[doc.width * 0.6, doc.width * 0.4])
            metric_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#e3f2fd')),
                ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#1976d2')),
                ('ALIGN', (1, 0), (1, -1), 'CENTER'),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('LEFTPADDING', (0, 0), (-1, -1), 10),
                ('RIGHTPADDING', (0, 0), (-1, -1), 10),
                ('TOPPADDING', (0, 0), (-1, -1), 8),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ]))
            elements.append(metric_table)
            elements.append(Spacer(1, 20))
        
        # ============= PHÁT HIỆN CHÍNH =============
        elements.append(Paragraph("💡 Phát hiện Chính", section_header_style))
        elements.append(Spacer(1, 5))
        
        findings_data = []
        for i, finding in enumerate(analysis['phat_hien_chinh'], 1):
            if i <= 2:
                bg_color = colors.HexColor('#fff3e0')
            else:
                bg_color = colors.white
            
            findings_data.append([
                Paragraph(f"<b>{i}</b>", body_style),
                Paragraph(finding, body_style)
            ])
        
        findings_table = Table(findings_data, colWidths=[30, doc.width - 30])
        findings_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, 1), colors.HexColor('#ff9800')),
            ('BACKGROUND', (1, 0), (1, 1), colors.HexColor('#fff3e0')),
            ('BACKGROUND', (0, 2), (-1, -1), colors.white),
            ('TEXTCOLOR', (0, 0), (0, -1), colors.white),
            ('ALIGN', (0, 0), (0, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('FONTNAME', (0, 0), (0, -1), font_bold),
            ('FONTSIZE', (0, 0), (0, -1), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#e0e0e0')),
            ('LEFTPADDING', (0, 0), (-1, -1), 10),
            ('RIGHTPADDING', (0, 0), (-1, -1), 10),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ]))
        elements.append(findings_table)
        elements.append(Spacer(1, 20))
        
        # ============= THUẬT NGỮ & ĐỊNH NGHĨA =============
        if analysis.get('thuat_ngu_chinh'):
            elements.append(PageBreak())
            elements.append(Paragraph("📚 Thuật ngữ & Định nghĩa Chính", section_header_style))
            elements.append(Spacer(1, 10))
            
            for term, definition in analysis['thuat_ngu_chinh'].items():
                elements.append(Paragraph(f"<b>▸ {term}</b>", term_style))
                elements.append(Paragraph(definition, definition_style))
            
            elements.append(Spacer(1, 20))
        
        # ============= PHƯƠNG PHÁP =============
        elements.append(Paragraph("🔬 Phương pháp Nghiên cứu", section_header_style))
        elements.append(Spacer(1, 5))
        
        methodology_text = analysis['phuong_phap_nghien_cuu']
        if isinstance(methodology_text, list):
            methodology_text = ' '.join(methodology_text)
        
        elements.append(Paragraph(methodology_text, body_style))
        elements.append(Spacer(1, 20))
        
        # ============= ỨNG DỤNG THỰC TẾ =============
        if analysis.get('ung_dung_thuc_te'):
            elements.append(Paragraph("🌍 Ứng dụng Thực tế", section_header_style))
            elements.append(Spacer(1, 5))
            
            app_data = []
            for app in analysis['ung_dung_thuc_te']:
                app_data.append([
                    Paragraph("✓", body_style),
                    Paragraph(app, body_style)
                ])
            
            app_table = Table(app_data, colWidths=[30, doc.width - 30])
            app_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#e8f5e9')),
                ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#2e7d32')),
                ('FONTSIZE', (0, 0), (0, -1), 14),
                ('FONTNAME', (0, 0), (0, -1), font_bold),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('LEFTPADDING', (0, 0), (-1, -1), 10),
                ('RIGHTPADDING', (0, 0), (-1, -1), 10),
                ('TOPPADDING', (0, 0), (-1, -1), 8),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ]))
            elements.append(app_table)
            elements.append(Spacer(1, 20))
        
        # ============= Ý NGHĨA =============
        elements.append(Paragraph("🎓 Ý nghĩa Chính", section_header_style))
        elements.append(Spacer(1, 5))
        
        implications_text = analysis['y_nghia']
        if isinstance(implications_text, list):
            implications_text = ' '.join(implications_text)
        
        elements.append(Paragraph(implications_text, highlight_style))
        elements.append(Spacer(1, 20))
        
        # ============= CÂU HỎI TƯ DUY PHÊ PHÁN =============
        if analysis.get('cau_hoi_tu_duy_phe_phan'):
            elements.append(PageBreak())
            elements.append(Paragraph("🤔 Câu hỏi Tư duy Phê phán", section_header_style))
            elements.append(Spacer(1, 10))
            
            crit_data = [[Paragraph("<i>Suy ngẫm về những câu hỏi này để hiểu sâu hơn:</i>", body_style)]]
            for i, q in enumerate(analysis['cau_hoi_tu_duy_phe_phan'], 1):
                crit_data.append([Paragraph(f"<b>{i}.</b> {q}", body_style)])
            
            crit_table = Table(crit_data, colWidths=[doc.width])
            crit_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#fff3e0')),
                ('BACKGROUND', (0, 1), (-1, -1), colors.white),
                ('BOX', (0, 0), (-1, -1), 2, colors.HexColor('#f57c00')),
                ('LINEBELOW', (0, 0), (-1, 0), 1, colors.HexColor('#f57c00')),
                ('LEFTPADDING', (0, 0), (-1, -1), 15),
                ('RIGHTPADDING', (0, 0), (-1, -1), 15),
                ('TOPPADDING', (0, 0), (-1, -1), 10),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
            ]))
            elements.append(crit_table)
            elements.append(Spacer(1, 25))
        
        # ============= CÂU HỎI ÔN TẬP =============
        if analysis.get('cau_hoi_on_tap'):
            elements.append(Paragraph("✏️ Câu hỏi Tự đánh giá", section_header_style))
            elements.append(Spacer(1, 10))
            
            for i, qa in enumerate(analysis['cau_hoi_on_tap'], 1):
                difficulty = qa.get('do_kho', 'Trung bình')
                
                if difficulty == 'Dễ':
                    diff_color = '#4caf50'
                    bg_color = '#e8f5e9'
                elif difficulty == 'Khó':
                    diff_color = '#f44336'
                    bg_color = '#ffebee'
                else:
                    diff_color = '#ff9800'
                    bg_color = '#fff3e0'
                
                # Hộp câu hỏi
                q_data = [
                    [Paragraph(f"<b>Câu hỏi {i}</b> <font color='{diff_color}'>[{difficulty}]</font>", body_style)],
                    [Paragraph(qa['cau_hoi'], body_style)]
                ]
                
                q_table = Table(q_data, colWidths=[doc.width])
                q_table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor(bg_color)),
                    ('BOX', (0, 0), (-1, -1), 1.5, colors.HexColor(diff_color)),
                    ('LEFTPADDING', (0, 0), (-1, -1), 12),
                    ('RIGHTPADDING', (0, 0), (-1, -1), 12),
                    ('TOPPADDING', (0, 0), (-1, -1), 8),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
                ]))
                elements.append(q_table)
                elements.append(Spacer(1, 8))
                
                # Hộp trả lời
                answer_style = ParagraphStyle(
                    'Answer',
                    parent=styles['BodyText'],
                    fontName=font_name,
                    fontSize=10,
                    textColor=colors.HexColor('#424242'),
                    spaceAfter=12,
                    leftIndent=25,
                    leading=13
                )
                a_data = [[Paragraph(f"<b>Trả lời:</b> {qa['tra_loi']}", answer_style)]]
                a_table = Table(a_data, colWidths=[doc.width])
                a_table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f5f5f5')),
                    ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#bdbdbd')),
                    ('LEFTPADDING', (0, 0), (-1, -1), 12),
                    ('RIGHTPADDING', (0, 0), (-1, -1), 12),
                    ('TOPPADDING', (0, 0), (-1, -1), 8),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
                ]))
                elements.append(a_table)
                elements.append(Spacer(1, 15))
        
        # ============= BẢN ĐỒ TƯ DUY =============
        elements.append(PageBreak())
        elements.append(Paragraph("🗺️ Bản đồ Tư duy Khái niệm", section_header_style))
        elements.append(Spacer(1, 15))
        
        # Khái niệm trung tâm
        central = analysis['ban_do_tu_duy']['khai_niem_trung_tam']
        central_data = [[Paragraph(f"<b>{central}</b>", 
            ParagraphStyle('Central', parent=body_style, fontSize=14, 
                          alignment=TA_CENTER, textColor=colors.white))]]
        
        central_table = Table(central_data, colWidths=[doc.width * 0.6])
        central_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#1976d2')),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('LEFTPADDING', (0, 0), (-1, -1), 15),
            ('RIGHTPADDING', (0, 0), (-1, -1), 15),
            ('TOPPADDING', (0, 0), (-1, -1), 12),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ('BOX', (0, 0), (-1, -1), 3, colors.HexColor('#0d47a1')),
        ]))
        
        central_wrapper = Table([[central_table]], colWidths=[doc.width])
        central_wrapper.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        elements.append(central_wrapper)
        elements.append(Spacer(1, 20))
        
        # Các nhánh
        branch_colors = {
            'blue': '#1976d2',
            'green': '#388e3c',
            'orange': '#f57c00',
            'red': '#d32f2f',
            'purple': '#7b1fa2',
            'teal': '#00796b'
        }
        
        for i, branch in enumerate(analysis['ban_do_tu_duy']['nhanh']):
            color_name = branch.get('mau', list(branch_colors.keys())[i % len(branch_colors)])
            branch_color = branch_colors.get(color_name, '#1976d2')
            
            branch_header = Table([[Paragraph(f"<b>{branch['chu_de']}</b>", 
                ParagraphStyle('BranchHeader', parent=body_style, 
                              textColor=colors.white, fontSize=12))]], 
                colWidths=[doc.width * 0.7])
            branch_header.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor(branch_color)),
                ('LEFTPADDING', (0, 0), (-1, -1), 10),
                ('RIGHTPADDING', (0, 0), (-1, -1), 10),
                ('TOPPADDING', (0, 0), (-1, -1), 6),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ]))
            elements.append(branch_header)
            elements.append(Spacer(1, 5))
            
            for point in branch['diem']:
                point_text = Paragraph(f"  • {point}", body_style)
                elements.append(point_text)
            
            elements.append(Spacer(1, 15))
        
        # ============= MẸO HỌC TẬP =============
        elements.append(PageBreak())
        elements.append(Paragraph("📅 Mẹo Học tập & Chiến lược Ghi nhớ", section_header_style))
        elements.append(Spacer(1, 10))
        
        tips_data = [
            ["📖", "<b>Ôn tập Lần 1:</b> Trong vòng 24 giờ sau khi đọc flashcard này"],
            ["🔄", "<b>Ôn tập Lần 2:</b> 3 ngày sau lần ôn đầu tiên"],
            ["✅", "<b>Ôn tập Lần 3:</b> 1 tuần sau lần ôn thứ hai"],
            ["🎯", "<b>Ôn tập Cuối:</b> 2 tuần sau lần ôn thứ ba"],
            ["💡", "<b>Gợi nhớ Chủ động:</b> Cố trả lời các câu hỏi mà không nhìn đáp án trước"],
            ["🤝", "<b>Dạy người khác:</b> Giải thích khái niệm cho đồng học để củng cố hiểu biết"],
        ]
        
        tips_table_data = []
        for emoji, tip in tips_data:
            tips_table_data.append([
                Paragraph(emoji, body_style),
                Paragraph(tip, body_style)
            ])
        
        tips_table = Table(tips_table_data, colWidths=[40, doc.width - 40])
        tips_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f3e5f5')),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('LEFTPADDING', (0, 0), (-1, -1), 10),
            ('RIGHTPADDING', (0, 0), (-1, -1), 10),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('LINEBELOW', (0, 0), (-1, -2), 1, colors.HexColor('#ce93d8')),
        ]))
        elements.append(tips_table)
        elements.append(Spacer(1, 20))
        
        # ============= FOOTER =============
        elements.append(Spacer(1, 30))
        footer_style = ParagraphStyle(
            'Footer',
            parent=styles['Normal'],
            fontSize=9,
            textColor=colors.HexColor('#757575'),
            alignment=TA_CENTER,
            fontName=font_name
        )
        
        footer_table = Table([
            [Paragraph("─────────────────────────────", footer_style)],
            [Paragraph("<b>Nhàn Học - Phân tích Tài liệu</b> | Được hỗ trợ bởi AI", footer_style)],
            [Paragraph("Học thông minh, học nhanh hơn, ghi nhớ lâu hơn 🚀", footer_style)]
        ], colWidths=[doc.width])
        footer_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ]))
        elements.append(footer_table)
        
        # Xây dựng PDF
        doc.build(elements)
        print(f"✓ PDF flashcard kiến thức nâng cao đã được tạo thành công!")
        print(f"✓ Output: {output_path}")
        
    except Exception as e:
        print(f"Lỗi khi tạo PDF: {str(e)}")
        import traceback
        traceback.print_exc()
        raise

def xử_lý_pdf_đồng_bộ(pdf_path, filename):
    """Xử lý phân tích PDF đồng bộ - trả về PDF content"""
    try:
        # Bước 1: Trích xuất text từ PDF
        print("Đang trích xuất text từ PDF...")
        text = trích_xuất_text_từ_pdf(pdf_path)
        
        if len(text.strip()) < 100:
            raise Exception('PDF có vẻ rỗng hoặc không đọc được')
        
        # Bước 2: Phân tích với AI
        print("Đang phân tích nội dung với AI...")
        analysis = phân_tích_với_ai(text)
        
        # Bước 3: Tạo PDF output
        print("Đang tạo PDF flashcard...")
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_output:
            output_path = temp_output.name
        
        tạo_pdf_flashcard(analysis, output_path)
        
        # Đọc file PDF đã tạo
        with open(output_path, 'rb') as f:
            pdf_content = f.read()
        
        # Cleanup
        os.unlink(output_path)
        
        return pdf_content
        
    except Exception as e:
        print(f"Lỗi trong xử lý PDF: {str(e)}")
        raise e

def process_pdf_job(job_id, pdf_path, filename):
    """Xử lý PDF job trong background thread"""
    try:
        print(f"[PDF Job {job_id}] Bắt đầu xử lý...")
        pdf_job_storage[job_id]['status'] = 'processing'
        pdf_job_storage[job_id]['updated_at'] = datetime.now().isoformat()
        
        # Xử lý PDF
        pdf_content = xử_lý_pdf_đồng_bộ(pdf_path, filename)
        
        # Encode PDF content thành base64 để lưu trữ
        pdf_base64 = base64.b64encode(pdf_content).decode('utf-8')
        
        # Cập nhật kết quả
        pdf_job_storage[job_id]['status'] = 'completed'
        pdf_job_storage[job_id]['result'] = {
            'pdf_content': pdf_base64,
            'filename': f'phan_tich_{filename}'
        }
        pdf_job_storage[job_id]['updated_at'] = datetime.now().isoformat()
        pdf_job_storage[job_id]['completed_at'] = datetime.now().isoformat()
        
        print(f"[PDF Job {job_id}] Hoàn thành!")
        
    except Exception as e:
        print(f"[PDF Job {job_id}] Lỗi: {str(e)}")
        pdf_job_storage[job_id]['status'] = 'failed'
        pdf_job_storage[job_id]['error'] = str(e)
        pdf_job_storage[job_id]['updated_at'] = datetime.now().isoformat()
    
    finally:
        # Cleanup PDF file
        try:
            if os.path.exists(pdf_path):
                os.unlink(pdf_path)
        except:
            pass

def phân_tích_pdf():
    """Tạo PDF job và trả về job_id ngay lập tức"""
    try:
        if 'file' not in request.files:
            return {'error': 'Không có file được upload'}, 400
        
        file = request.files['file']
        
        if file.filename == '':
            return {'error': 'Không có file được chọn'}, 400
        
        if not file.filename.endswith('.pdf'):
            return {'error': 'Chỉ chấp nhận file PDF'}, 400
        
        # Lưu file tạm thời
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_pdf:
            file.save(temp_pdf.name)
            pdf_path = temp_pdf.name
        
        # Tạo job ID
        job_id = str(uuid.uuid4())
        
        # Khởi tạo job
        pdf_job_storage[job_id] = {
            'job_id': job_id,
            'status': 'pending',
            'filename': file.filename,
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat(),
            'result': None,
            'error': None
        }
        
        # Chạy xử lý trong background thread
        thread = threading.Thread(
            target=process_pdf_job,
            args=(job_id, pdf_path, file.filename)
        )
        thread.daemon = True
        thread.start()
        
        print(f"[PDF Job {job_id}] Đã tạo và bắt đầu background processing")
        
        return {
            'job_id': job_id,
            'status': 'pending',
            'message': 'Đang phân tích PDF của bạn. Vui lòng đợi...'
        }, 202
        
    except Exception as e:
        print(f"Lỗi: {str(e)}")
        import traceback
        traceback.print_exc()
        return {'error': str(e)}, 500

def get_pdf_job_status(job_id):
    """Lấy trạng thái của PDF job"""
    if job_id not in pdf_job_storage:
        return None
    return pdf_job_storage[job_id]
