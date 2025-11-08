# Hướng dẫn Setup VAPI Agent

## ✅ Đã hoàn thành tự động!

**Chúng tôi đã sử dụng Transient (Inline) Assistant** - nghĩa là assistant được tạo động trực tiếp từ code, không cần setup trên dashboard!

### Ưu điểm của cách này:

1. ✅ **Không cần setup trên VAPI Dashboard** - Mọi thứ đã được code tự động
2. ✅ **Context được inject trực tiếp** - User data được đưa thẳng vào system message
3. ✅ **Linh hoạt 100%** - Có thể thay đổi model, voice, prompt bất cứ lúc nào
4. ✅ **Cá nhân hóa hoàn toàn** - Mỗi user có context riêng khi gọi

## 1. Chỉ cần Public Key

Bạn chỉ cần có **Public API Key** từ VAPI Dashboard.

### Lấy Public Key:

1. Truy cập: https://dashboard.vapi.ai
2. Vào Settings → Keys
3. Copy **Public Key**
4. Dán vào file `.env`:

```env
REACT_APP_VAPI_PUBLIC_KEY=your_public_key_here
```

**LỰU Ý**: Bạn KHÔNG cần Assistant ID nữa!

## 2. Cấu hình đã có sẵn trong code

File: `src/components/vapiWidget/vapiWidget.js`

Assistant được tạo với:

```javascript
{
  name: "Trợ lý AI Học tập",
  model: {
    provider: "openai",
    model: "gpt-4o-mini",
    messages: [{ 
      role: "system", 
      content: "System message với context đầy đủ về user..." 
    }],
    temperature: 0.7
  },
  voice: {
    provider: "playht",
    voiceId: "jennifer"
  },
  transcriber: {
    provider: "deepgram",
    model: "nova-2",
    language: "vi"
  },
  firstMessage: "Xin chào {userName}! ..."
}
```

## 3. Context được truyền tự động

Mỗi khi user click vào button "Trò chuyện", code tự động:

1. Load tất cả dữ liệu từ IndexedDB
2. Tạo context summary
3. Inject vào system message
4. Tạo assistant với context cá nhân hóa
5. Bắt đầu cuộc gọi

**Context bao gồm:**
- ✅ Tên người dùng
- ✅ Số chủ đề đang học
- ✅ Danh sách chủ đề
- ✅ Số quiz đã làm
- ✅ Điểm trung bình
- ✅ Số tài liệu đã lưu
- ✅ Hoạt động gần nhất

## 4. Tùy chỉnh (Optional)

### Thay đổi Voice Provider:

```javascript
voice: {
  provider: "11labs",  // hoặc "playht", "azure"
  voiceId: "your_voice_id"
}
```

**Voice tiếng Việt tốt:**
- PlayHT: `jennifer`, `matthew`
- ElevenLabs: Cần tìm voice ID tiếng Việt
- Azure: `vi-VN-NamMinhNeural`, `vi-VN-HoaiMyNeural`

### Thay đổi Model:

```javascript
model: {
  provider: "openai",
  model: "gpt-4o",  // hoặc "gpt-4o-mini", "gpt-3.5-turbo"
  temperature: 0.7
}
```

### Thay đổi Transcriber:

```javascript
transcriber: {
  provider: "deepgram",  // hoặc "google", "azure"
  model: "nova-2",
  language: "vi"
}
```

**End Call Phrases**:
- "Tạm biệt"
- "Kết thúc"
- "Bye"
- "Hẹn gặp lại"

**Interruptions Enabled**: Yes (cho phép người dùng ngắt lời)

## 5. Test

1. Chạy app: `npm start`
2. Click vào button "Trò chuyện" ở góc dưới bên phải
3. Cho phép microphone khi browser yêu cầu
4. Nói thử: 
   - "Xin chào"
   - "Tôi đang học gì?"
   - "Điểm của tôi thế nào?"
   - "Tôi nên học gì tiếp theo?"

## 6. Troubleshooting

**Lỗi 400**: 
- Kiểm tra lại Public Key trong file `.env`
- Đảm bảo account có đủ credits
- Kiểm tra console log để xem assistant config

**Không nhận diện tiếng Việt**:
- Deepgram nova-2 đã support tiếng Việt
- Nói rõ ràng và không quá nhanh
- Kiểm tra microphone permission

**Assistant không biết context**:
- Xem console log: "📊 User context:", "📝 Context summary:"
- Đảm bảo IndexedDB đã có dữ liệu
- Kiểm tra `isContextReady` state

**Voice không tự nhiên**:
- Thử đổi provider khác (11labs, azure)
- Thử voice ID khác
- Điều chỉnh temperature (0.5-0.9)

## 7. Chi phí & Credits

**Transient Assistant** sử dụng credits tương tự permanent assistant:

- **Model (GPT-4o-mini)**: ~$0.0001 per token
- **Voice (PlayHT)**: ~$0.01 per minute  
- **Transcriber (Deepgram)**: ~$0.0043 per minute

**Ước tính**: ~$0.05-0.10 per cuộc gọi 3-5 phút

## 8. Resources

- VAPI Documentation: https://docs.vapi.ai
- Transient vs Permanent: https://docs.vapi.ai/assistants/concepts/transient-vs-permanent-configurations
- Discord Support: https://discord.gg/pUFNcf2WmH

---

## 🎉 Xong rồi!

Giờ bạn có thể test VAPI Voice Agent với context đầy đủ về dữ liệu học tập!

Không cần setup gì thêm trên dashboard, mọi thứ đã được tự động hóa trong code! 🚀
