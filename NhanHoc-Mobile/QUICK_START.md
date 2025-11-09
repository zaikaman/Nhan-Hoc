# 🚀 Hướng Dẫn Sử Dụng API - Nhàn Học

## ✅ Đã Hoàn Thành

### 1. Cấu hình API
- ✅ Tạo file `src/config/api.ts` - Cấu hình kết nối Heroku
- ✅ URL: `https://nhanhoc-ca30a6361738.herokuapp.com`
- ✅ Định nghĩa các endpoints
- ✅ Helper function `apiRequest()`

### 2. Service Layer
- ✅ Tạo file `src/services/learningPath.ts`
- ✅ `generateLearningPath()` - Tạo lộ trình học tập
- ✅ `generateQuiz()` - Tạo bài kiểm tra
- ✅ `pollJobStatus()` - Kiểm tra trạng thái job
- ✅ `checkJobStatus()` - Check một lần
- ✅ `getCourses()` - Lấy danh sách khóa học
- ✅ `getCourseDetail()` - Chi tiết khóa học

### 3. UI Components
- ✅ Cập nhật `UploadDocument.tsx` - Tích hợp API thực
- ✅ Tạo `ApiStatusCard.tsx` - Hiển thị trạng thái kết nối
- ✅ Cập nhật `Settings.tsx` - Thêm API status card

### 4. Testing & Documentation
- ✅ Tạo `apiTest.ts` - Helper để test API
- ✅ Tạo `API_INTEGRATION.md` - Hướng dẫn chi tiết
- ✅ Tạo `.env.example` - Template environment variables

## 📝 Cách Sử Dụng

### Tạo Lộ Trình Học Tập

1. Mở app và vào màn hình "Upload Tài liệu"
2. Nhập chủ đề học tập (VD: "Lập trình Python cơ bản")
3. Thêm mô tả (tùy chọn)
4. Chọn các tùy chọn:
   - Trình độ: Cơ bản / Trung bình / Nâng cao
   - Số bài học: 3 / 5 / 7 / 10
   - Bật/tắt Quiz
   - Số câu hỏi mỗi bài: 5 / 10 / 15 / 20
5. Nhấn "Tạo lộ trình với AI"
6. Đợi AI xử lý (có progress bar)
7. Nhận thông báo khi hoàn thành

### Kiểm Tra Kết Nối API

1. Vào màn hình "Settings"
2. Xem phần "Trạng thái API"
3. Kiểm tra status:
   - 🟢 **Đã kết nối** - Server hoạt động tốt
   - 🔴 **Mất kết nối** - Có vấn đề với server
4. Nhấn "Kiểm tra" để test lại kết nối

## 🔧 API Endpoints

### Backend Heroku
```
Base URL: https://nhanhoc-ca30a6361738.herokuapp.com
```

### Các Endpoints Có Sẵn

| Endpoint | Method | Mô tả |
|----------|--------|-------|
| `/health` | GET | Kiểm tra server health |
| `/api/generate-course` | POST | Tạo lộ trình học tập |
| `/api/quiz` | POST | Tạo quiz |
| `/api/quiz/status/:jobId` | GET | Kiểm tra trạng thái job |
| `/api/courses` | GET | Lấy danh sách khóa học |
| `/api/courses/:id` | GET | Chi tiết khóa học |

## 🧪 Test API

### Trong Code
```typescript
import { runAllTests } from './src/config/apiTest';

// Chạy tất cả tests
runAllTests();
```

### Sử dụng curl
```bash
# Test health
curl https://nhanhoc-ca30a6361738.herokuapp.com/health

# Tạo lộ trình
curl -X POST https://nhanhoc-ca30a6361738.herokuapp.com/api/generate-course \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Python Basics",
    "audienceLevel": "beginner",
    "lessonCount": 5,
    "includeQuiz": true,
    "quizPerLesson": 10
  }'

# Check status (thay {job_id} bằng ID thực)
curl https://nhanhoc-ca30a6361738.herokuapp.com/api/quiz/status/{job_id}
```

## 📱 Flow Hoạt Động

```
User Input (Topic)
       ↓
[generateLearningPath()]
       ↓
Backend tạo job → Trả về job_id
       ↓
[pollJobStatus(job_id)]
       ↓
Check mỗi 2 giây (tối đa 60 lần)
       ↓
Status: pending → processing → completed
       ↓
Hiển thị kết quả cho user
```

## 🎯 Features

### Đã Implement
- ✅ Kết nối với Heroku backend
- ✅ Tạo lộ trình học tập với AI
- ✅ Tạo quiz/bài kiểm tra
- ✅ Polling job status với progress
- ✅ Error handling
- ✅ UI feedback (progress bar, status messages)
- ✅ API status monitoring

### Sắp Tới
- 🔲 Authentication (JWT tokens)
- 🔲 Lưu khóa học vào local storage
- 🔲 Xem lịch sử khóa học đã tạo
- 🔲 Offline mode
- 🔲 Push notifications khi job hoàn thành
- 🔲 Rate limiting & retry logic
- 🔲 Analytics & tracking

## 🐛 Troubleshooting

### Lỗi "Cannot connect to server"
1. Kiểm tra internet connection
2. Verify Heroku app đang chạy:
   ```bash
   heroku ps -a nhanhoc
   ```
3. Check logs:
   ```bash
   heroku logs --tail -a nhanhoc
   ```

### Lỗi "Timeout"
- Tăng `maxAttempts` trong `pollJobStatus()`
- Tăng `interval` giữa các lần check
- Backend có thể đang xử lý request khác

### Lỗi "Job failed"
- Check backend logs để xem lỗi cụ thể
- Verify API key OpenAI còn quota
- Kiểm tra format request body

## 📞 Support

Nếu gặp vấn đề:
1. Check màn hình Settings → API Status
2. Xem file `API_INTEGRATION.md` để biết chi tiết
3. Run tests: `apiTest.ts`
4. Check Heroku logs

## 🎉 Ready to Go!

App của bạn đã sẵn sàng kết nối với Heroku backend! 

Chỉ cần:
1. ✅ Backend đang chạy trên Heroku
2. ✅ App có internet connection
3. ✅ Nhập topic và nhấn "Tạo lộ trình"
4. ✅ Enjoy! 🚀
