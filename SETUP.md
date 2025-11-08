# Hướng dẫn Deploy Ứng dụng AI Personalized Learning Platform

## Tổng quan
- **Frontend**: React.js → Deploy trên Vercel
- **Backend**: Flask Python → Deploy trên Heroku

---

## 📋 Yêu cầu trước khi bắt đầu

### 1. Tài khoản cần thiết
- [ ] Tài khoản GitHub (đã có repository)
- [ ] Tài khoản Vercel (miễn phí): https://vercel.com/signup
- [ ] Tài khoản Heroku (miễn phí): https://signup.heroku.com/
- [ ] Git đã được cài đặt trên máy

### 2. API Keys cần thiết
- [ ] OpenAI API Key (cho backend)
- [ ] Các API keys khác nếu có

---

## 🚀 PHẦN 1: Deploy Backend lên Heroku

### Bước 1: Cài đặt Heroku CLI
```bash
# Tải và cài đặt từ: https://devcenter.heroku.com/articles/heroku-cli
# Sau khi cài đặt, kiểm tra:
heroku --version
```

### Bước 2: Đăng nhập Heroku
```bash
heroku login
```

### Bước 3: Tạo ứng dụng Heroku
```bash
cd backend
heroku create ten-ung-dung-cua-ban
# Thay "ten-ung-dung-cua-ban" bằng tên bạn muốn (phải unique)
# Ví dụ: heroku create ai-learning-backend
```

### Bước 4: Thiết lập biến môi trường trên Heroku
```bash
# Thiết lập OpenAI API Key
heroku config:set OPENAI_API_KEY=your_openai_api_key_here

# Thiết lập các biến môi trường khác nếu cần
heroku config:set FLASK_ENV=production
```

### Bước 5: Deploy Backend
```bash
# Push code lên Heroku
git subtree push --prefix backend heroku main

# Hoặc nếu bạn đã commit tất cả thay đổi:
git push heroku main
```

### Bước 6: Kiểm tra logs và trạng thái
```bash
# Xem logs
heroku logs --tail

# Mở ứng dụng
heroku open

# Kiểm tra trạng thái
heroku ps
```

### Bước 7: Lấy URL Backend
Sau khi deploy thành công, bạn sẽ nhận được URL:
```
https://ten-ung-dung-cua-ban.herokuapp.com
```
**LƯU Ý**: Lưu lại URL này để cấu hình frontend!

---

## 🎨 PHẦN 2: Deploy Frontend lên Vercel

### Bước 1: Chuẩn bị môi trường
Tạo file `.env.production` trong thư mục gốc với nội dung:
```
REACT_APP_API_URL=https://ten-ung-dung-cua-ban.herokuapp.com
```
(Thay thế bằng URL backend từ Heroku)

### Bước 2: Commit tất cả thay đổi
```bash
git add .
git commit -m "Chuẩn bị deploy lên Vercel và Heroku"
git push origin main
```

### Bước 3: Deploy lên Vercel

#### Cách 1: Qua giao diện web (Khuyến nghị)
1. Truy cập: https://vercel.com/new
2. Import repository từ GitHub
3. Chọn repository: `Nhan-Hoc`
4. Cấu hình:
   - **Framework Preset**: Create React App
   - **Root Directory**: ./
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   
5. Environment Variables:
   - Key: `REACT_APP_API_URL`
   - Value: `https://ten-ung-dung-cua-ban.herokuapp.com`

6. Click "Deploy"

#### Cách 2: Qua Vercel CLI
```bash
# Cài đặt Vercel CLI
npm install -g vercel

# Đăng nhập
vercel login

# Deploy
vercel

# Khi được hỏi các câu hỏi:
# - Set up and deploy? Y
# - Which scope? Chọn account của bạn
# - Link to existing project? N
# - What's your project's name? ai-learning-platform (hoặc tên bạn muốn)
# - In which directory is your code located? ./
# - Want to override the settings? N

# Deploy production
vercel --prod
```

### Bước 4: Cấu hình biến môi trường trên Vercel
Nếu chưa cấu hình ở bước 3:
1. Vào Dashboard Vercel
2. Chọn project của bạn
3. Settings → Environment Variables
4. Thêm:
   - `REACT_APP_API_URL` = URL backend Heroku của bạn

### Bước 5: Kiểm tra ứng dụng
Vercel sẽ cung cấp URL:
```
https://ten-project.vercel.app
```

---

## 🔧 PHẦN 3: Khắc phục sự cố thường gặp

### Lỗi CORS
Nếu frontend không kết nối được backend, kiểm tra:
- Backend đã cấu hình CORS chính xác
- URL backend trong frontend đúng
- Không có trailing slash (/) thừa

### Lỗi Build trên Vercel
```bash
# Thử build local trước:
npm run build

# Nếu có lỗi, sửa trước khi deploy
```

### Lỗi Backend trên Heroku
```bash
# Xem logs chi tiết:
heroku logs --tail

# Restart dyno:
heroku restart

# Kiểm tra biến môi trường:
heroku config
```

### Backend sleep (free tier Heroku)
- Heroku free tier sẽ sleep sau 30 phút không hoạt động
- Lần request đầu tiên sẽ mất 10-30s để wake up
- Giải pháp: Nâng cấp lên paid tier hoặc dùng dịch vụ ping định kỳ

---

## 📝 PHẦN 4: Cập nhật ứng dụng sau này

### Cập nhật Backend
```bash
# Commit thay đổi
git add .
git commit -m "Cập nhật backend"
git push origin main

# Deploy lên Heroku
git push heroku main
```

### Cập nhật Frontend
```bash
# Commit thay đổi
git add .
git commit -m "Cập nhật frontend"
git push origin main

# Vercel sẽ tự động deploy khi có push mới
# Hoặc deploy thủ công:
vercel --prod
```

---

## ✅ Checklist hoàn thành

### Backend (Heroku)
- [ ] Đã tạo ứng dụng Heroku
- [ ] Đã cấu hình biến môi trường (OPENAI_API_KEY, etc.)
- [ ] Đã thêm các file cần thiết (Procfile, runtime.txt)
- [ ] Deploy thành công
- [ ] API endpoints hoạt động bình thường
- [ ] Đã lưu URL backend

### Frontend (Vercel)
- [ ] Đã tạo file .env.production với URL backend
- [ ] Đã cập nhật axios baseURL
- [ ] Đã import project vào Vercel
- [ ] Đã cấu hình biến môi trường trên Vercel
- [ ] Deploy thành công
- [ ] Ứng dụng chạy và kết nối được backend

---

## 🔗 Liên kết hữu ích

- **Vercel Documentation**: https://vercel.com/docs
- **Heroku Documentation**: https://devcenter.heroku.com/
- **Heroku Python Support**: https://devcenter.heroku.com/articles/python-support
- **React Deployment**: https://create-react-app.dev/docs/deployment/

---

## 💡 Lưu ý quan trọng

1. **Bảo mật**: Không commit API keys vào Git. Luôn dùng biến môi trường.
2. **CORS**: Đảm bảo backend cho phép origin từ Vercel domain.
3. **Cost**: Heroku và Vercel free tier có giới hạn. Theo dõi usage.
4. **Monitoring**: Thiết lập monitoring và alerts cho production.
5. **Database**: Nếu cần database, xem xét MongoDB Atlas, PostgreSQL, etc.

---

## 📞 Hỗ trợ

Nếu gặp vấn đề:
1. Kiểm tra logs trên Heroku: `heroku logs --tail`
2. Kiểm tra build logs trên Vercel Dashboard
3. Xem lại các bước trong hướng dẫn này
4. Tham khảo documentation chính thức

---

**Chúc bạn deploy thành công! 🎉**
