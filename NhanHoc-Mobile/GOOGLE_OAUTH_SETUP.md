# Hướng dẫn cấu hình Google OAuth

## Bước 1: Tạo Google Cloud Project và OAuth Client ID

### 1.1. Truy cập Google Cloud Console
1. Truy cập: https://console.cloud.google.com/
2. Đăng nhập bằng tài khoản Google của bạn

### 1.2. Tạo Project mới
1. Click vào dropdown project ở góc trên bên trái
2. Click "New Project"
3. Nhập tên: "NhanHoc" hoặc tên bạn muốn
4. Click "Create"

### 1.3. Enable Google+ API
1. Vào menu sidebar → "APIs & Services" → "Library"
2. Tìm "Google+ API" 
3. Click và enable API này

### 1.4. Tạo OAuth Consent Screen
1. Vào "APIs & Services" → "OAuth consent screen"
2. Chọn "External" → Click "Create"
3. Điền thông tin:
   - App name: "Nhàn Học"
   - User support email: email của bạn
   - Developer contact: email của bạn
4. Click "Save and Continue"
5. Bỏ qua phần Scopes → Click "Save and Continue"
6. Bỏ qua Test users → Click "Save and Continue"

### 1.5. Tạo OAuth Client ID
1. Vào "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"

#### Tạo Web Client ID (Bắt buộc cho Expo):
1. Application type: **Web application**
2. Name: "NhanHoc Web Client"
3. Authorized redirect URIs: 
   - Click "Add URI"
   - Nhập: `https://auth.expo.io/@YOUR_EXPO_USERNAME/MyNewApp`
   - (Thay YOUR_EXPO_USERNAME bằng username Expo của bạn)
4. Click "Create"
5. **LƯU LẠI CLIENT ID** (dạng: xxxxx.apps.googleusercontent.com)

#### Tạo Android Client ID (Để chạy trên thiết bị Android thật):
1. Click "Create Credentials" → "OAuth client ID"
2. Application type: **Android**
3. Name: "NhanHoc Android"
4. Package name: Kiểm tra trong `app.json` → `android.package` (mặc định: `com.anonymous.MyNewApp`)
5. Signing-certificate fingerprint: 
   - Development: Chạy lệnh sau trong terminal:
   ```bash
   cd android && ./gradlew signingReport
   ```
   - Tìm SHA-1 trong output và paste vào
6. Click "Create"

#### Tạo iOS Client ID (Để chạy trên thiết bị iOS thật):
1. Click "Create Credentials" → "OAuth client ID"
2. Application type: **iOS**
3. Name: "NhanHoc iOS"
4. Bundle ID: Kiểm tra trong `app.json` → `ios.bundleIdentifier` (mặc định: `com.anonymous.MyNewApp`)
5. Click "Create"

## Bước 2: Cấu hình trong app.json

Sau khi có Web Client ID, thêm vào file `app.json`:

```json
{
  "expo": {
    "scheme": "myapp",
    "extra": {
      "googleWebClientId": "YOUR_WEB_CLIENT_ID.apps.googleusercontent.com"
    }
  }
}
```

## Bước 3: Chạy thử nghiệm

1. Với Expo Go:
   - Chỉ hoạt động trên web browser
   - Chạy: `npx expo start` → Press 'w' để mở web

2. Với Development Build:
   - Chạy được trên device thật
   - Cần build: `npx expo run:android` hoặc `npx expo run:ios`

## Lưu ý quan trọng:

- **Web Client ID** là bắt buộc để Google Sign-In hoạt động với Expo
- Redirect URI phải chính xác: `https://auth.expo.io/@username/app-slug`
- Kiểm tra username Expo bằng: `npx expo whoami`
- App slug lấy từ `app.json` → `expo.slug`
