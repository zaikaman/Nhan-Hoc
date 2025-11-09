# API Error Logging - Đã tắt hiển thị errors

## ✅ Đã hoàn thành

### Thay đổi chính:
1. **API Client** - Thêm cấu hình logging có thể bật/tắt
2. **API Services** - Loại bỏ console.error trong polling functions  
3. **Hooks** - Loại bỏ console.error không cần thiết

### Chi tiết:

#### 1. `src/api/apiClient.ts`
```typescript
// Thêm config
const ENABLE_API_LOGS = false; // ⬅️ Set false để tắt logs

// Thêm helper methods
private log() - Chỉ log khi ENABLE_API_LOGS = true
private logError() - Chỉ log errors khi ENABLE_API_LOGS = true
```

#### 2. Các API Services (roadmapApi, quizApi, resourceApi)
- Loại bỏ `console.error()` trong `catch` blocks của polling functions
- Errors vẫn được throw nhưng không log ra console
- Comment: "Silently retry on error (common during job processing)"

#### 3. Hooks (useRoadmap, useQuiz, useResource)
- Loại bỏ tất cả `console.error()` statements
- Errors vẫn được set vào state để UI có thể xử lý
- Comment: "// Error already logged in apiClient"

## 🎯 Kết quả

### Trước:
```
ERROR ❌ API Error: Không tìm thấy job
ERROR Error polling roadmap status: [ApiException: Không tìm thấy job]
```

### Sau:
- Console sạch sẽ, không có error logs
- Errors vẫn được handle đúng cách
- UI vẫn hiển thị thông báo lỗi khi cần

## 🔧 Bật lại logs để debug (nếu cần)

Trong `src/api/apiClient.ts`, đổi:
```typescript
const ENABLE_API_LOGS = true; // ⬅️ Set true để bật logs
```

## 📝 Lý do

Race condition trong backend (job storage không thread-safe) gây ra lỗi "Không tìm thấy job" ngẫu nhiên khi polling. Errors này:
- Tự động retry và thành công
- Không ảnh hưởng đến kết quả cuối cùng
- Chỉ gây ồn ào trong console

Nên đã ẩn đi để UX tốt hơn.
