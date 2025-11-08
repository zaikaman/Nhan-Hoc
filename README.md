# 🎓 Nền Tảng Học Tập Cá Nhân Hóa Với AI

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)
![Flask](https://img.shields.io/badge/Flask-3.0.3-000000?logo=flask)
![Python](https://img.shields.io/badge/Python-3.11-3776AB?logo=python)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-412991?logo=openai)

**Dự án tham gia SGU Hackathon 2025**

[Demo](#-demo) • [Tính năng](#-tính-năng-nổi-bật) • [Cài đặt](#-cài-đặt) • [Sử dụng](#-hướng-dẫn-sử-dụng) • [Đóng góp](#-đóng-góp)

</div>

---

## 📋 Mục lục

- [Giới thiệu](#-giới-thiệu)
- [Tính năng nổi bật](#-tính-năng-nổi-bật)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Kiến trúc hệ thống](#-kiến-trúc-hệ-thống)
- [Cài đặt](#-cài-đặt)
- [Hướng dẫn sử dụng](#-hướng-dẫn-sử-dụng)
- [API Documentation](#-api-documentation)
- [Demo](#-demo)
- [Roadmap](#-roadmap)
- [Đóng góp](#-đóng-góp)
- [Giấy phép](#-giấy-phép)
- [Liên hệ](#-liên-hệ)

---

## 🌟 Giới thiệu

**Nền Tảng Học Tập Cá Nhân Hóa Với AI** là một giải pháp học tập thông minh, được xây dựng với mục tiêu cách mạng hóa cách thức học tập và tiếp cận kiến thức trong kỷ nguyên số. Dự án kết hợp sức mạnh của **Trí tuệ nhân tạo (AI)**, **Machine Learning**, và **Natural Language Processing** để tạo ra một trải nghiệm học tập hoàn toàn cá nhân hóa cho từng người dùng.

### 🎯 Vấn đề giải quyết

- **Thiếu cá nhân hóa**: Các nền tảng học tập hiện tại thường áp dụng cùng một lộ trình cho tất cả người học
- **Khó khăn trong việc tự học**: Người học không biết bắt đầu từ đâu và học theo trình tự nào
- **Thiếu phản hồi tức thì**: Không có hệ thống hỗ trợ giải đáp thắc mắc 24/7
- **Khó theo dõi tiến độ**: Người học khó đánh giá được mức độ hiểu biết của mình

### 💡 Giải pháp của chúng tôi

Một nền tảng học tập ALL-IN-ONE với AI làm trung tâm, cung cấp:

- ✨ **Lộ trình học tập cá nhân hóa** được tạo bởi AI dựa trên mục tiêu và trình độ
- 🤖 **Trợ lý AI 24/7** hỗ trợ giải đáp thắc mắc, giải thích khái niệm
- 📊 **Theo dõi tiến độ thông minh** với phân tích chi tiết và gợi ý cải thiện
- 📚 **Tài nguyên học tập tự động** được AI tạo ra phù hợp với từng chủ đề
- 🎯 **Quiz thích ứng** điều chỉnh độ khó theo năng lực người học
- 🗣️ **Trợ lý giọng nói AI** cho trải nghiệm học tập hands-free
- 📄 **Phân tích tài liệu PDF** tự động tạo flashcard và tóm tắt kiến thức

---

## ✨ Tính năng nổi bật

### 1️⃣ 🗺️ Tạo Lộ Trình Học Tập Cá Nhân Hóa (AI Roadmap)

<details>
<summary><b>Xem chi tiết</b></summary>

#### Mô tả
Sử dụng GPT-5-Nano để tạo lộ trình học tập chi tiết, được cấu trúc theo tuần, phù hợp với mục tiêu và trình độ của từng người học.

#### Đặc điểm nổi bật
- 🎯 **Cá nhân hóa 100%**: Dựa trên tên chủ đề, mục tiêu, và thời gian học
- 📅 **Lộ trình có cấu trúc**: Chia theo tuần, mỗi tuần có chủ đề cụ thể
- 📝 **Nội dung chi tiết**: Mỗi tuần bao gồm mô tả, mục tiêu, và hoạt động học tập
- 💾 **Lưu trữ offline**: Tất cả dữ liệu được lưu trong IndexedDB
- 🔄 **Theo dõi tiến độ**: Đánh dấu tuần đã hoàn thành, xem tổng quan tiến độ

#### Công nghệ
- OpenAI GPT-4o Mini
- Structured Output với JSON Schema
- IndexedDB cho offline storage

</details>

### 2️⃣ 💬 Chatbot AI Thông Minh (Background Jobs)

<details>
<summary><b>Xem chi tiết</b></summary>

#### Mô tả
Trợ lý AI hiểu context đầy đủ về lộ trình học tập, kết quả quiz, và tài liệu của người dùng để đưa ra câu trả lời và lời khuyên phù hợp.

#### Đặc điểm nổi bật
- 🧠 **Context-Aware**: AI biết toàn bộ dữ liệu học tập của bạn
- ⚡ **Background Processing**: Không bao giờ timeout, xử lý trong background thread
- 🔄 **Real-time Polling**: Frontend tự động cập nhật kết quả
- 📚 **Hiểu biết sâu**: Trả lời dựa trên roadmap, quiz stats, và tài liệu đã lưu
- 💡 **Gợi ý thông minh**: Đề xuất chủ đề học tiếp theo, tài nguyên phù hợp
- 🎨 **Markdown Support**: Câu trả lời được format đẹp với code syntax highlighting

#### Công nghệ
- OpenAI GPT-4o với context injection
- Python Threading cho background jobs
- Frontend polling với interval 2 giây
- React Markdown cho rendering

</details>

### 3️⃣ 📝 Quiz Thích Ứng Thông Minh

<details>
<summary><b>Xem chi tiết</b></summary>

#### Mô tả
Hệ thống quiz được AI tạo tự động với khả năng tùy chỉnh độ khó, số lượng câu hỏi, và định dạng câu trả lời.

#### Đặc điểm nổi bật
- 🎲 **Tùy chỉnh linh hoạt**: Chọn số lượng câu (5-20), độ khó (Dễ/Trung bình/Khó)
- 🎯 **Câu hỏi chất lượng**: AI tạo câu hỏi sát với nội dung học
- ⏱️ **Thống kê chi tiết**: Lưu điểm số, thời gian làm bài, câu trả lời
- 📊 **Phân tích kết quả**: Xem lại câu trả lời đúng/sai, giải thích chi tiết
- 🎊 **Gamification**: Hiệu ứng confetti khi đạt điểm cao
- 📈 **Theo dõi tiến độ**: Xem lịch sử làm quiz, điểm trung bình

#### Công nghệ
- OpenAI GPT-5-Nano với structured output
- React state management
- Chart.js cho visualization
- IndexedDB cho quiz history

</details>

### 4️⃣ 📚 Tạo Tài Nguyên Học Tập (Generative Resources)

<details>
<summary><b>Xem chi tiết</b></summary>

#### Mô tả
AI tự động tạo tài liệu học tập dưới nhiều định dạng khác nhau, phù hợp với từng chủ đề và tuần học.

#### Đặc điểm nổi bật
- 📋 **Nhiều định dạng**: Summary, Flashcards, Mind Map, Practice Problems
- 🎨 **Nội dung phong phú**: Markdown với emoji, code blocks, tables
- 💾 **Lưu offline**: Tất cả tài nguyên lưu trong IndexedDB
- 🔍 **Tìm kiếm dễ dàng**: Lọc theo chủ đề, tuần, loại tài liệu
- 📤 **Xuất file**: Tải về dưới dạng PDF hoặc Markdown
- ✏️ **Chỉnh sửa linh hoạt**: Có thể edit và lưu lại tài liệu

#### Công nghệ
- OpenAI GPT-5-Nano cho content generation
- React Markdown cho rendering
- File download API
- IndexedDB storage

</details>

### 5️⃣ 💡 Gợi Ý Học Tập Thông Minh (AI Recommendations)

<details>
<summary><b>Xem chi tiết</b></summary>

#### Mô tả
Phân tích toàn bộ dữ liệu học tập để đưa ra các gợi ý cá nhân hóa giúp cải thiện hiệu quả học tập.

#### Đặc điểm nổi bật
- 🎯 **Gợi ý chủ đề**: Đề xuất chủ đề nên học tiếp theo dựa trên tiến độ
- 📊 **Phân tích điểm yếu**: Xác định các phần cần cải thiện từ kết quả quiz
- 🔄 **Tối ưu lộ trình**: Đề xuất điều chỉnh roadmap cho hiệu quả hơn
- 📚 **Tài nguyên bổ sung**: Gợi ý tài liệu, bài tập phù hợp
- ⏰ **Lịch học tối ưu**: Đề xuất thời gian và cường độ học phù hợp
- 🎓 **Phương pháp học**: Gợi ý kỹ thuật học tập hiệu quả

#### Công nghệ
- OpenAI GPT-5-Nano với prompt engineering
- Data analysis từ IndexedDB
- Scoring algorithm

</details>

### 6️⃣ 🗣️ Trợ Lý Giọng Nói AI (VAPI Integration)

<details>
<summary><b>Xem chi tiết</b></summary>

#### Mô tả
Trợ lý AI giọng nói cho phép tương tác bằng voice, hỗ trợ học tập hands-free và tiện lợi.

#### Đặc điểm nổi bật
- 🎙️ **Voice-to-Voice**: Nói chuyện trực tiếp với AI bằng giọng nói
- 🇻🇳 **Hỗ trợ tiếng Việt**: Nhận diện và phản hồi bằng tiếng Việt
- 🧠 **Context đầy đủ**: AI biết toàn bộ dữ liệu học tập của bạn
- 🔄 **Transient Assistant**: Tạo assistant động, cá nhân hóa cho từng user
- ⚡ **Real-time**: Phản hồi nhanh, tự nhiên như đối thoại thực
- 🎯 **Multi-modal**: Vừa nghe vừa đọc transcript

#### Công nghệ
- VAPI.ai platform
- GPT-5-Nano cho conversation
- PlayHT cho text-to-speech tiếng Việt
- Deepgram Nova-2 cho speech-to-text
- Transient Assistant pattern

</details>

### 7️⃣ 📄 Phân Tích PDF Thông Minh (Background Jobs)

<details>
<summary><b>Xem chi tiết</b></summary>

#### Mô tả
Upload PDF và AI tự động trích xuất kiến thức, tạo flashcard và tài liệu học tập.

#### Đặc điểm nổi bật
- 📤 **Upload dễ dàng**: Drag & drop hoặc click để chọn file
- 🔍 **Trích xuất thông minh**: AI đọc và hiểu nội dung PDF
- 📝 **Tạo flashcard**: Tự động tạo thẻ ghi nhớ từ nội dung
- 📊 **Tóm tắt kiến thức**: Tạo summary và key points
- ⚡ **Background processing**: Xử lý trong background, không timeout
- 💾 **Xuất PDF**: Download kết quả dưới dạng PDF đẹp mắt

#### Công nghệ
- PyPDF2 cho PDF parsing
- OpenAI GPT-5-Nano cho content analysis
- ReportLab cho PDF generation
- Python Threading
- Frontend polling pattern

</details>

### 8️⃣ 📊 Phân Tích & Thống Kê (Analytics)

<details>
<summary><b>Xem chi tiết</b></summary>

#### Mô tả
Dashboard trực quan hiển thị toàn bộ dữ liệu học tập và tiến độ của bạn.

#### Đặc điểm nổi bật
- 📈 **Biểu đồ trực quan**: Chart.js và Recharts
- 📊 **Nhiều metrics**: Điểm trung bình, tỷ lệ hoàn thành, thời gian học
- 🎯 **Phân tích theo chủ đề**: Xem chi tiết từng roadmap
- 📅 **Timeline**: Theo dõi hoạt động theo thời gian
- 🏆 **Thành tích**: Badges, streaks, milestones
- 📉 **Xu hướng**: Xem sự tiến bộ qua các tuần

#### Công nghệ
- Chart.js cho bar/line charts
- Recharts cho advanced visualizations
- IndexedDB aggregation
- React hooks cho real-time updates

</details>

### 🔟 💾 Offline-First với IndexedDB

<details>
<summary><b>Xem chi tiết</b></summary>

#### Đặc điểm nổi bật
- 🚀 **Hoạt động offline**: Tất cả dữ liệu lưu local
- 💨 **Tốc độ cao**: Không cần gọi server cho dữ liệu cũ
- 🔄 **Đồng bộ thông minh**: Sync khi cần thiết
- 📦 **Dung lượng lớn**: Lưu được hàng GB dữ liệu
- 🔒 **An toàn**: Dữ liệu lưu trên máy người dùng
- 🛠️ **Debug tools**: Trang debug để kiểm tra database

#### Database Schema
```javascript
{
  userProfile: { username, avatar, settings },
  roadmaps: { [topic]: { weeks, progress } },
  quizStats: { [topic]: { [week]: { scores, answers } } },
  resources: { [id]: { type, content, topic, week } },
  chatHistory: { [sessionId]: { messages, timestamp } },
  pdfAnalysis: { [id]: { filename, content, created } }
}
```

</details>

---

## 🛠️ Công nghệ sử dụng

### Frontend

| Công nghệ | Version | Mục đích |
|-----------|---------|----------|
| **React** | 18.3.1 | UI Framework |
| **React Router** | 6.23.1 | Client-side routing |
| **Axios** | 1.7.2 | HTTP client |
| **Chart.js** | 4.4.3 | Data visualization |
| **Recharts** | 2.10.3 | Advanced charts |
| **React Markdown** | 9.0.1 | Markdown rendering |
| **Lucide React** | 0.379.0 | Icon library |
| **VAPI Web** | 2.5.0 | Voice AI integration |

### Backend

| Công nghệ | Version | Mục đích |
|-----------|---------|----------|
| **Python** | 3.11 | Backend language |
| **Flask** | 3.0.3 | Web framework |
| **OpenAI API** | Latest | AI/LLM integration |
| **PyPDF2** | Latest | PDF parsing |
| **ReportLab** | Latest | PDF generation |
| **Gunicorn** | 21.2.0 | Production server |
| **python-dotenv** | 1.0.1 | Environment management |

### AI & ML

| Service | Model | Sử dụng cho |
|---------|-------|-------------|
| **OpenAI** | GPT-5-Nano | Roadmap, Resources, Analysis |
| **OpenAI** | GPT-5-Nano | Chatbot, Quiz, Recommendations |
| **VAPI** | Gemini-2.5-Flash | Voice Assistant conversation |
| **PlayHT** | Jennifer | Text-to-Speech (tiếng Việt) |
| **Deepgram** | Nova-2 | Speech-to-Text (tiếng Việt) |

### Database & Storage

| Công nghệ | Mục đích |
|-----------|----------|
| **IndexedDB** | Client-side offline database |
| **In-Memory Storage** | Backend job queue (temporary) |

### DevOps & Deployment

| Công nghệ | Mục đích |
|-----------|----------|
| **Vercel** | Frontend hosting |
| **Heroku** | Backend hosting (có thể) |
| **Git** | Version control |
| **npm** | Package management (Frontend) |
| **pip** | Package management (Backend) |

---

## 🏗️ Kiến trúc hệ thống

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                         │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   React UI   │  │  IndexedDB   │  │ VAPI Widget  │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                  │                  │                   │
└─────────┼──────────────────┼──────────────────┼───────────────────┘
          │                  │                  │
          │ HTTP/REST        │ Local Storage    │ WebSocket
          │                  │                  │
┌─────────▼──────────────────▼──────────────────▼───────────────────┐
│                      API GATEWAY (Flask)                          │
│                                                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │ Roadmap  │  │ Chatbot  │  │   Quiz   │  │   PDF    │        │
│  │   API    │  │   API    │  │   API    │  │   API    │        │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘        │
│       │             │              │             │               │
│  ┌────▼──────────────▼──────────────▼─────────────▼────┐        │
│  │          Background Job Manager (Threading)          │        │
│  └────┬──────────────┬──────────────┬─────────────┬────┘        │
│       │              │              │             │               │
└───────┼──────────────┼──────────────┼─────────────┼───────────────┘
        │              │              │             │
        │              │              │             │
┌───────▼──────────────▼──────────────▼─────────────▼───────────────┐
│                     EXTERNAL SERVICES                              │
│                                                                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  │ OpenAI   │  │   VAPI   │  │  PlayHT  │  │ Deepgram │         │
│  │   GPT    │  │ Platform │  │   TTS    │  │   STT    │         │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘         │
└────────────────────────────────────────────────────────────────────┘
```

### Luồng dữ liệu chính

1. **User Input** → React UI → IndexedDB (lưu local)
2. **AI Request** → Flask API → Background Job → OpenAI API
3. **Job Polling** → Frontend checks status mỗi 2s → Receive result
4. **Voice Chat** → VAPI → GPT-5-Nano + PlayHT + Deepgram → User
5. **Data Storage** → IndexedDB → Offline-first, sync on demand

### Background Jobs Pattern

```python
# Backend tạo job và chạy trong thread
job_id = str(uuid.uuid4())
thread = threading.Thread(target=process_job, args=(job_id, data))
thread.start()
return {'job_id': job_id, 'status': 'pending'}, 202

# Frontend polling
const pollStatus = async (jobId) => {
  const response = await axios.get(`/api/status/${jobId}`)
  if (response.data.status === 'completed') {
    return response.data.result
  }
  // Poll lại sau 2 giây
  setTimeout(() => pollStatus(jobId), 2000)
}
```

---

## 💻 Cài đặt

### Yêu cầu hệ thống

- **Node.js**: >= 16.0.0
- **Python**: >= 3.11
- **npm**: >= 8.0.0
- **pip**: Latest
- **Git**: Latest

### Bước 1: Clone repository

```bash
git clone https://github.com/zaikaman/Nhan-Hoc.git
cd Nhan-Hoc
```

### Bước 2: Cài đặt Frontend

```bash
# Cài đặt dependencies
npm install

# Tạo file .env
cp .env.example .env
```

Cấu hình file `.env`:

```env
# OpenAI API
REACT_APP_OPENAI_API_KEY=your_openai_api_key_here
REACT_APP_OPENAI_BASE_URL=https://api.openai.com/v1

# VAPI (Optional - cho Voice Assistant)
REACT_APP_VAPI_PUBLIC_KEY=your_vapi_public_key_here
```

### Bước 3: Cài đặt Backend

```bash
# Di chuyển vào thư mục backend
cd backend

# Tạo virtual environment
python -m venv venv

# Activate virtual environment
# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# Windows CMD:
.\venv\Scripts\activate.bat
# Linux/Mac:
source venv/bin/activate

# Cài đặt dependencies
pip install -r requirements.txt

# Tạo file .env
cp .env.example .env
```

Cấu hình file `backend/.env`:

```env
# OpenAI API
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_BASE_URL=https://api.openai.com/v1

# Flask Configuration
FLASK_ENV=development
FLASK_APP=base.py
```

### Bước 4: Chạy ứng dụng

#### Development Mode

**Terminal 1 - Frontend:**
```bash
npm start
```
Frontend sẽ chạy tại: `http://localhost:3000`

**Terminal 2 - Backend:**
```bash
cd backend
.\venv\Scripts\python.exe -m flask run
```
Backend sẽ chạy tại: `http://localhost:5000`

#### Production Mode

**Frontend:**
```bash
npm run build
# Deploy thư mục build/ lên Vercel hoặc hosting khác
```

**Backend:**
```bash
cd backend
gunicorn -c gunicorn_config.py base:app
```

---

## 📖 Hướng dẫn sử dụng

### 1. Đăng ký/Đăng nhập lần đầu

- Mở trình duyệt và truy cập `http://localhost:3000`
- Nhập tên của bạn khi popup Welcome Modal hiện ra
- Hệ thống sẽ tạo profile trong IndexedDB

### 2. Tạo Roadmap học tập

1. Nhấn vào **"Tạo lộ trình mới"** trên trang chủ
2. Nhập thông tin:
   - **Tên chủ đề**: Ví dụ "React.js", "Python Backend", "Machine Learning"
   - **Mục tiêu**: Ví dụ "Trở thành Full-stack Developer"
   - **Thời gian**: Số tuần bạn muốn học (4-24 tuần)
3. Nhấn **"Tạo lộ trình"** và đợi AI xử lý (~5-10 giây)
4. Xem roadmap chi tiết được tạo ra

### 3. Sử dụng Chatbot AI

1. Vào trang **"Chat với AI"**
2. Nhập câu hỏi hoặc yêu cầu, ví dụ:
   - "Giải thích cho tôi về React Hooks"
   - "Tôi đang học gì trong tuần này?"
   - "Cho tôi bài tập về Python"
3. AI sẽ trả lời dựa trên context của roadmap và quiz của bạn
4. Đợi AI xử lý (background job, ~10-30 giây)
5. Xem câu trả lời chi tiết với Markdown formatting

### 4. Làm Quiz

1. Vào trang **"Quiz"**
2. Chọn chủ đề và tuần muốn làm quiz
3. Cấu hình quiz:
   - Số lượng câu hỏi (5-20)
   - Độ khó (Dễ/Trung bình/Khó)
4. Nhấn **"Bắt đầu Quiz"**
5. Trả lời các câu hỏi trắc nghiệm
6. Xem kết quả và giải thích chi tiết

### 5. Tạo tài nguyên học tập

1. Vào trang **"Tài nguyên"**
2. Chọn loại tài nguyên:
   - Summary (Tóm tắt)
   - Flashcards (Thẻ ghi nhớ)
   - Mind Map (Sơ đồ tư duy)
   - Practice Problems (Bài tập thực hành)
3. Chọn chủ đề và tuần
4. Nhấn **"Tạo tài nguyên"**
5. Xem, edit, và lưu tài liệu

### 6. Phân tích PDF

1. Vào trang **"Phân tích PDF"**
2. Upload file PDF (kéo thả hoặc click chọn)
3. Đợi AI phân tích (~30-60 giây tùy độ dài file)
4. Xem tiến trình xử lý trong real-time
5. Download file PDF flashcard kết quả

### 7. Sử dụng Voice Assistant

1. Nhấn vào icon **microphone** ở góc dưới bên phải
2. Cho phép truy cập microphone khi trình duyệt hỏi
3. Nói câu hỏi bằng tiếng Việt
4. Nghe AI trả lời bằng giọng nói tự nhiên
5. Xem transcript của cuộc hội thoại

### 8. Xem Analytics

1. Vào trang **"Thống kê"**
2. Xem các biểu đồ:
   - Điểm trung bình theo chủ đề
   - Tiến độ hoàn thành roadmap
   - Số lượng quiz đã làm
   - Timeline hoạt động
3. Phân tích điểm mạnh/yếu của bạn

### 9. Quản lý Profile

1. Vào trang **"Hồ sơ"**
2. Cập nhật thông tin cá nhân
3. Xem tổng quan học tập
4. Export/Import dữ liệu
5. Reset database nếu cần

---

## 📡 API Documentation

### Base URL

- **Development**: `http://localhost:5000/api`
- **Production**: `https://your-backend-url.com/api`

### Endpoints

#### 1. Roadmap API

**POST /api/roadmap**

Tạo lộ trình học tập mới.

**Request:**
```json
{
  "topic": "React.js",
  "goal": "Trở thành Frontend Developer",
  "weeks": 12
}
```

**Response (200 OK):**
```json
{
  "roadmap": {
    "Tuần 1": {
      "chủ đề": "Giới thiệu React",
      "mô tả": "...",
      "mục tiêu": ["..."],
      "hoạt động": ["..."]
    },
    "Tuần 2": {...},
    ...
  }
}
```

#### 2. Chatbot API

**POST /api/chat**

Gửi tin nhắn cho AI chatbot (Background job).

**Request:**
```json
{
  "message": "Giải thích React Hooks là gì?",
  "userData": {
    "roadmaps": {...},
    "quizStats": {...},
    "resources": {...}
  }
}
```

**Response (202 Accepted):**
```json
{
  "job_id": "uuid-here",
  "status": "pending",
  "message": "Job đã được tạo và đang xử lý"
}
```

**GET /api/chat/status/:job_id**

Kiểm tra trạng thái job.

**Response (200 OK):**
```json
{
  "job_id": "uuid-here",
  "status": "completed",
  "result": {
    "response": "React Hooks là..."
  },
  "completed_at": "2025-01-09T10:30:00Z"
}
```

#### 3. Quiz API

**POST /api/quiz**

Tạo quiz mới.

**Request:**
```json
{
  "topic": "React.js",
  "week": "Tuần 1",
  "numQuestions": 10,
  "difficulty": "medium"
}
```

**Response (200 OK):**
```json
{
  "questions": [
    {
      "question": "React là gì?",
      "options": ["Library", "Framework", "Language", "Tool"],
      "correct_answer": "Library",
      "explanation": "React là một JavaScript library..."
    },
    ...
  ]
}
```

#### 4. Resources API

**POST /api/resources**

Tạo tài nguyên học tập.

**Request:**
```json
{
  "topic": "React.js",
  "week": "Tuần 1",
  "type": "summary"
}
```

**Response (200 OK):**
```json
{
  "content": "# Tóm tắt Tuần 1\n\n## React Basics\n...",
  "type": "summary"
}
```

#### 5. Recommendations API

**POST /api/recommendations**

Nhận gợi ý học tập cá nhân hóa.

**Request:**
```json
{
  "userData": {
    "roadmaps": {...},
    "quizStats": {...},
    "currentWeek": 3
  }
}
```

**Response (200 OK):**
```json
{
  "recommendations": [
    {
      "type": "next_topic",
      "title": "Học tiếp về React Hooks",
      "reason": "Bạn đã hoàn thành 80% nội dung tuần 2",
      "priority": "high"
    },
    ...
  ]
}
```

#### 6. PDF Analysis API

**POST /api/analyze-pdf**

Upload và phân tích PDF (Background job).

**Request:**
```form-data
{
  "file": [PDF file]
}
```

**Response (202 Accepted):**
```json
{
  "job_id": "uuid-here",
  "status": "pending",
  "message": "PDF đang được xử lý"
}
```

**GET /api/analyze-pdf/status/:job_id**

Kiểm tra trạng thái phân tích PDF.

**Response (200 OK):**
```json
{
  "job_id": "uuid-here",
  "status": "completed",
  "result": {
    "pdf_content": "base64-encoded-pdf",
    "filename": "flashcard_result.pdf"
  },
  "completed_at": "2025-01-09T10:35:00Z"
}
```

#### 7. Analytics API

**POST /api/analytics**

Phân tích dữ liệu học tập.

**Request:**
```json
{
  "userData": {
    "roadmaps": {...},
    "quizStats": {...},
    "resources": {...}
  }
}
```

**Response (200 OK):**
```json
{
  "totalTopics": 3,
  "totalQuizzes": 15,
  "averageScore": 85.5,
  "topicsProgress": {
    "React.js": 75,
    "Python": 50
  },
  "weakAreas": ["Hooks", "State Management"],
  "studyStreak": 7
}
```

### Error Responses

**400 Bad Request:**
```json
{
  "error": "Thiếu thông tin bắt buộc",
  "details": "Vui lòng cung cấp topic và weeks"
}
```

**404 Not Found:**
```json
{
  "error": "Không tìm thấy job_id",
  "job_id": "uuid-here"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Lỗi xử lý từ OpenAI API",
  "details": "Rate limit exceeded"
}
```

---

## 🎬 Demo

### Screenshots

> *Thêm screenshots của các trang chính ở đây*

1. **Landing Page**
2. **Roadmap Creation**
3. **AI Chatbot**
4. **Quiz Interface**
5. **Resources Library**
6. **Analytics Dashboard**
7. **Profile Page**
8. **PDF Analysis**

### Video Demo

> *Link video demo trên YouTube hoặc hosting khác*

[![Video Demo](https://img.shields.io/badge/▶️-Xem_Demo-red?style=for-the-badge&logo=youtube)](https://youtube.com/your-demo-link)

### Live Demo

> *Link đến phiên bản deploy (nếu có)*

🌐 **Frontend**: [https://your-app.vercel.app](https://your-app.vercel.app)  
🔧 **Backend**: [https://your-backend.herokuapp.com](https://your-backend.herokuapp.com)

---

## 🗺️ Roadmap

### ✅ Phase 1 - MVP (Đã hoàn thành)

- [x] Tạo roadmap cá nhân hóa với AI
- [x] Chatbot thông minh với context
- [x] Hệ thống quiz thích ứng
- [x] Tạo tài nguyên học tập tự động
- [x] Offline-first với IndexedDB
- [x] Background jobs pattern
- [x] Voice Assistant integration
- [x] PDF analysis
- [x] Analytics dashboard

### 🚧 Phase 2 - Enhancement (Đang phát triển)

- [ ] **Authentication & Multi-user**
  - User registration/login
  - Cloud sync với backend database
  - Multi-device support

- [ ] **Advanced AI Features**
  - Adaptive learning algorithm
  - Personalized difficulty adjustment
  - Learning style detection

- [ ] **Gamification**
  - Points & Rewards system
  - Leaderboards
  - Achievements & Badges
  - Daily challenges

- [ ] **Social Features**
  - Study groups
  - Peer discussion forums
  - Share roadmaps & resources

### 🔮 Phase 3 - Scale (Tương lai)

- [ ] **Mobile Apps**
  - React Native iOS/Android apps
  - Offline sync
  - Push notifications

- [ ] **Advanced Analytics**
  - ML-based performance prediction
  - A/B testing for learning methods
  - Retention & engagement metrics

- [ ] **Content Marketplace**
  - User-generated content
  - Expert-curated courses
  - Paid premium content

- [ ] **Enterprise Features**
  - Team management
  - Corporate training
  - Admin dashboard
  - LMS integration

---

## 🤝 Đóng góp

Chúng tôi rất hoan nghênh mọi đóng góp từ cộng đồng! 

### Cách đóng góp

1. **Fork** repository này
2. **Clone** fork về máy của bạn:
   ```bash
   git clone https://github.com/your-username/Nhan-Hoc.git
   ```
3. Tạo **branch** mới cho feature:
   ```bash
   git checkout -b feature/amazing-feature
   ```
4. **Commit** thay đổi:
   ```bash
   git commit -m "Add: amazing feature"
   ```
5. **Push** lên branch:
   ```bash
   git push origin feature/amazing-feature
   ```
6. Tạo **Pull Request**

### Quy tắc đóng góp

- Code phải tuân theo style guide hiện tại
- Thêm tests cho features mới
- Update documentation khi cần
- Commit messages rõ ràng và có ý nghĩa
- Một PR chỉ nên giải quyết một vấn đề

### Báo lỗi

Nếu bạn tìm thấy bug, vui lòng tạo issue với thông tin:

- Mô tả bug chi tiết
- Các bước để reproduce
- Expected behavior vs Actual behavior
- Screenshots (nếu có)
- Environment (OS, Browser, Node version, etc.)

### Đề xuất tính năng

Có ý tưởng tuyệt vời? Tạo issue với tag `enhancement` và mô tả:

- Tính năng đề xuất
- Lý do cần tính năng này
- Use case cụ thể
- Mockups/wireframes (nếu có)

---

## 📄 Giấy phép

Dự án được phân phối dưới giấy phép **MIT License**. Xem file [LICENSE](LICENSE) để biết thêm chi tiết.

```
MIT License

Copyright (c) 2025 Nền Tảng Học Tập Cá Nhân Hóa Với AI

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 👥 Đội ngũ phát triển

Dự án được phát triển bởi sinh viên **Team Double2T** cho **SGU Hackathon 2025**.

### Core Team

- **[Đinh Phúc Thịnh]** - *Project Lead & Full-stack Developer*
  - 🌐 [GitHub](https://github.com/zaikaman)
  - 📧 Email: zaikaman123@gmail.com

### Acknowledgments

Chúng tôi xin gửi lời cảm ơn đến:

- **OpenAI** - Cung cấp GPT-5-Nano API
- **VAPI.ai** - Voice Assistant platform
- **SGU** - Tổ chức hackathon và hỗ trợ
- **Cộng đồng Open Source** - Libraries và tools tuyệt vời
- **Mentors & Advisors** - Hướng dẫn và góp ý

---

## 📞 Liên hệ

### Support

- 📧 **Email**: support@nhanhoc.com
- 💬 **Discord**: [Join our server](https://discord.gg/your-server)
- 📱 **Facebook**: [Fanpage](https://facebook.com/your-page)

### Business Inquiries

- 📧 **Email**: business@nhanhoc.com
- 🌐 **Website**: [https://nhanhoc.com](https://nhanhoc.com)

### Social Media

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/zaikaman/Nhan-Hoc)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/yourprofile)
[![Facebook](https://img.shields.io/badge/Facebook-1877F2?style=for-the-badge&logo=facebook&logoColor=white)](https://facebook.com/yourpage)
[![YouTube](https://img.shields.io/badge/YouTube-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://youtube.com/yourchannel)

---

## 🌟 Star History

Nếu bạn thấy dự án này hữu ích, hãy cho chúng tôi một ⭐ trên GitHub!

[![Star History Chart](https://api.star-history.com/svg?repos=zaikaman/Nhan-Hoc&type=Date)](https://star-history.com/#zaikaman/Nhan-Hoc&Date)

---

## 📊 Project Stats

![GitHub repo size](https://img.shields.io/github/repo-size/zaikaman/Nhan-Hoc)
![GitHub language count](https://img.shields.io/github/languages/count/zaikaman/Nhan-Hoc)
![GitHub top language](https://img.shields.io/github/languages/top/zaikaman/Nhan-Hoc)
![GitHub last commit](https://img.shields.io/github/last-commit/zaikaman/Nhan-Hoc)
![GitHub issues](https://img.shields.io/github/issues/zaikaman/Nhan-Hoc)
![GitHub pull requests](https://img.shields.io/github/issues-pr/zaikaman/Nhan-Hoc)
![GitHub stars](https://img.shields.io/github/stars/zaikaman/Nhan-Hoc)
![GitHub forks](https://img.shields.io/github/forks/zaikaman/Nhan-Hoc)

---

<div align="center">

### 💖 Made with Love for Education

**Nền Tảng Học Tập Cá Nhân Hóa Với AI** © 2025

*Cách mạng hóa cách thức học tập trong kỷ nguyên AI*

[⬆ Về đầu trang](#-nền-tảng-học-tập-cá-nhân-hóa-với-ai)

</div>
