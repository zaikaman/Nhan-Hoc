# 🚀 HƯỚNG DẪN HOÀN CHỈNH GOOGLE SIGN-IN CHO EXPO

## ✅ ĐÃ HOÀN THÀNH

### 1. Cài đặt thư viện
```bash
✅ npx expo install expo-auth-session expo-web-browser expo-crypto
```

### 2. Tạo các file
```
✅ src/hooks/useGoogleAuth.ts - Custom hook xử lý Google Auth
✅ src/services/googleAuth.ts - Service layer (backup)
✅ src/screens/Login.tsx - Đã tích hợp Google Sign-In
```

## 📋 CÁC BƯỚC CẤU HÌNH GOOGLE OAUTH

### BƯỚC 1: Kiểm tra Expo Username

Chạy lệnh sau để xem username Expo của bạn:

```bash
npx expo whoami
```

**Nếu chưa đăng nhập:**
```bash
npx expo login
```

**Nếu chưa có tài khoản:**
```bash
npx expo register
```

Lưu lại username này (ví dụ: `johnsmith`)

---

### BƯỚC 2: Tạo Google Cloud Project

1. **Truy cập Google Cloud Console:**
   - URL: https://console.cloud.google.com/
   - Đăng nhập bằng tài khoản Google

2. **Tạo Project mới:**
   - Click dropdown project (góc trên trái)
   - Click "New Project"
   - Tên project: `NhanHoc` (hoặc tùy ý)
   - Click "Create"

3. **Enable Google+ API:**
   - Menu → APIs & Services → Library
   - Tìm "Google+ API"
   - Click và "Enable"

---

### BƯỚC 3: Cấu hình OAuth Consent Screen

1. **Vào OAuth consent screen:**
   - Menu → APIs & Services → OAuth consent screen

2. **Chọn User Type:**
   - Chọn **"External"**
   - Click "Create"

3. **Điền thông tin App:**
   - App name: `Nhàn Học`
   - User support email: [email của bạn]
   - Developer contact: [email của bạn]
   - Click "Save and Continue"

4. **Scopes (bỏ qua):**
   - Click "Save and Continue"

5. **Test users (bỏ qua):**
   - Click "Save and Continue"

6. **Review:**
   - Click "Back to Dashboard"

---

### BƯỚC 4: Tạo OAuth Client ID (Web)

**QUAN TRỌNG:** Web Client ID là BẮT BUỘC để Expo Auth hoạt động!

1. **Tạo Credentials:**
   - Menu → APIs & Services → Credentials
   - Click "Create Credentials"
   - Chọn "OAuth client ID"

2. **Cấu hình Web Application:**
   - Application type: **Web application**
   - Name: `NhanHoc Web Client`

3. **Authorized redirect URIs:**
   - Click "Add URI"
   - Nhập: `https://auth.expo.io/@YOUR_EXPO_USERNAME/MyNewApp`
   - **Thay `YOUR_EXPO_USERNAME` bằng username từ BƯỚC 1**
   - Ví dụ: `https://auth.expo.io/@johnsmith/MyNewApp`

4. **Create và lưu Client ID:**
   - Click "Create"
   - **COPY Client ID** (dạng: `123456789-abcdefg.apps.googleusercontent.com`)
   - Lưu vào Notepad/Notes

---

### BƯỚC 5: Cấu hình app.json

Mở file `app.json` và cập nhật:

```json
{
  "expo": {
    "name": "MyNewApp",
    "slug": "MyNewApp",
    "scheme": "mynewapp",
    // ... các config khác ...
    "extra": {
      "googleWebClientId": "PASTE_YOUR_CLIENT_ID_HERE.apps.googleusercontent.com"
    }
  }
}
```

**Thay `PASTE_YOUR_CLIENT_ID_HERE` bằng Client ID từ BƯỚC 4**

---

### BƯỚC 6: Test trên Development

#### Option 1: Test trên Web Browser (Dễ nhất)

```bash
# Khởi động Expo
npx expo start

# Nhấn 'w' để mở web browser
# Hoặc truy cập: http://localhost:8081
```

✅ Google Sign-In hoạt động 100% trên web

#### Option 2: Test trên Expo Go App

1. Cài Expo Go:
   - iOS: App Store
   - Android: Play Store

2. Scan QR code từ terminal

**⚠️ LƯU Ý:** Expo Go có thể có hạn chế với Google Auth trên mobile. Nên dùng Development Build.

#### Option 3: Development Build (Recommended cho production)

```bash
# Build cho Android
npx expo run:android

# Build cho iOS
npx expo run:ios
```

---

## 🎯 CÁCH HOẠT ĐỘNG

### Flow đăng nhập:

1. User nhấn "Đăng nhập với Google"
2. App mở browser với Google OAuth page
3. User chọn tài khoản Google
4. Google chuyển hướng về app với authorization code
5. App lấy access token
6. App lấy thông tin user (email, name, picture)
7. Navigate sang Dashboard với user info

### Debug logs:

Mở console để xem logs:
```
🔐 Bắt đầu Google Sign-In...
📍 Redirect URI: https://auth.expo.io/@username/MyNewApp
🔑 Client ID: 123456789-abcdefg...
✅ Đăng nhập thành công: user@gmail.com
```

---

## 🐛 TROUBLESHOOTING

### Lỗi: "Google Client ID chưa được cấu hình"
- ✅ Kiểm tra `app.json` → `extra.googleWebClientId`
- ✅ Restart Metro bundler: `r` trong terminal

### Lỗi: "Invalid redirect URI"
- ✅ Kiểm tra redirect URI trong Google Console
- ✅ Phải đúng format: `https://auth.expo.io/@username/slug`
- ✅ Username và slug phải chính xác

### Lỗi: "Access blocked: Request invalid"
- ✅ Kiểm tra OAuth Consent Screen đã setup đúng
- ✅ Thêm email test user nếu app chưa publish

### Google Sign-In không hoạt động trên mobile
- ✅ Expo Go có hạn chế → Dùng Development Build
- ✅ Chạy: `npx expo run:android` hoặc `npx expo run:ios`

---

## 📱 PRODUCTION BUILD (Tương lai)

Khi build app production, cần thêm:

### Android:
1. Tạo Android OAuth Client ID
2. Package name: `com.anonymous.MyNewApp` (từ app.json)
3. SHA-1 certificate fingerprint:
   ```bash
   cd android
   ./gradlew signingReport
   ```

### iOS:
1. Tạo iOS OAuth Client ID
2. Bundle ID: `com.anonymous.MyNewApp` (từ app.json)

---

## ✨ TEST NGAY

1. Đảm bảo đã cấu hình `app.json` với Client ID
2. Chạy: `npx expo start`
3. Nhấn 'w' để mở web
4. Click "Đăng nhập với Google"
5. Chọn tài khoản Google
6. Xem thông báo "Đăng nhập thành công!"

---

## 📚 TÀI LIỆU THAM KHẢO

- Expo Auth Session: https://docs.expo.dev/versions/latest/sdk/auth-session/
- Google OAuth: https://developers.google.com/identity/protocols/oauth2
- Expo Web Browser: https://docs.expo.dev/versions/latest/sdk/webbrowser/

---

## 💡 GHI CHÚ

- Web Client ID là BẮT BUỘC cho Expo Auth
- Redirect URI phải chính xác 100%
- Test trên web browser trước để debug dễ hơn
- Production cần thêm platform-specific OAuth clients
