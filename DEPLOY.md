# 🚀 Hướng dẫn Deploy Nhanh

## ✅ Checklist trước khi deploy

1. **Đã cài đặt:**
   - [ ] Node.js & npm
   - [ ] Git
   - [ ] Heroku CLI

2. **Đã có tài khoản:**
   - [ ] GitHub
   - [ ] Heroku
   - [ ] Vercel
   - [ ] OpenAI API Key

## 📝 Các bước thực hiện

### 1️⃣ Deploy Backend (Heroku)

```bash
# Bước 1: Đăng nhập Heroku
heroku login

# Bước 2: Tạo app Heroku
heroku create your-app-name

# Bước 3: Set biến môi trường
heroku config:set OPENAI_API_KEY=your_openai_key_here

# Bước 4: Commit tất cả thay đổi
git add .
git commit -m "Setup for Heroku deployment"
git push origin main

# Bước 5: Tạo git subtree cho backend
git subtree push --prefix backend heroku main

# Kiểm tra logs
heroku logs --tail

# Mở app để test
heroku open
```

**Lưu URL Backend:** `https://your-app-name.herokuapp.com`

---

### 2️⃣ Deploy Frontend (Vercel)

```bash
# Bước 1: Cập nhật file .env.production
# Sửa URL backend trong file .env.production
REACT_APP_API_URL=https://your-app-name.herokuapp.com

# Bước 2: Commit thay đổi
git add .
git commit -m "Update backend URL for production"
git push origin main

# Bước 3: Deploy lên Vercel
# Cách 1: Qua Web UI (Khuyến nghị)
# - Vào https://vercel.com/new
# - Import GitHub repository
# - Add Environment Variable: REACT_APP_API_URL
# - Click Deploy

# Cách 2: Qua CLI
npm install -g vercel
vercel login
vercel --prod
```

---

## 🔍 Kiểm tra

### Backend
```bash
# Test API
curl https://your-app-name.herokuapp.com/

# Xem logs
heroku logs --tail
```

### Frontend
- Mở URL Vercel được cung cấp
- Kiểm tra console browser xem có lỗi CORS không
- Test các chức năng chính

---

## 🔧 Update sau này

### Update Backend
```bash
git add .
git commit -m "Update backend"
git push origin main
git subtree push --prefix backend heroku main
```

### Update Frontend
```bash
git add .
git commit -m "Update frontend"
git push origin main
# Vercel tự động deploy
```

---

## ⚠️ Lưu ý quan trọng

1. **File đã tạo sẵn cho bạn:**
   - ✅ `backend/Procfile` - Cấu hình Heroku
   - ✅ `backend/runtime.txt` - Python version
   - ✅ `backend/requirements.txt` - Đã thêm gunicorn
   - ✅ `vercel.json` - Cấu hình Vercel
   - ✅ `src/config/api.js` - API configuration
   - ✅ `.env.production` - Production environment

2. **Đã cập nhật:**
   - ✅ Tất cả các file frontend sử dụng API_CONFIG
   - ✅ Backend có CORS configuration
   - ✅ Backend có health check endpoint

3. **Cần làm thủ công:**
   - ⚠️ Tạo app trên Heroku
   - ⚠️ Set OPENAI_API_KEY trên Heroku
   - ⚠️ Cập nhật URL backend trong `.env.production`
   - ⚠️ Import project vào Vercel

---

## 🆘 Khắc phục lỗi

### "Application Error" trên Heroku
```bash
heroku logs --tail
heroku restart
```

### CORS Error
- Kiểm tra URL backend trong `.env.production`
- Đảm bảo không có trailing slash
- Check CORS settings trong `backend/base.py`

### Build Failed trên Vercel
```bash
# Test build local
npm run build

# Nếu có lỗi, sửa trước
npm start
```

---

Xem file **SETUP.md** để có hướng dẫn chi tiết hơn!
