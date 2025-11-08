import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./chat.css";
import axios from "axios";
import API_CONFIG from "../../config/api";
import Header from "../../components/header/header";
import {
  saveChatConversation,
  getChatConversation,
  getAllChatConversations,
  updateChatConversation,
  deleteChatConversation,
} from "../../utils/indexedDB";
import {
  Send,
  Plus,
  MessageCircle,
  Trash2,
  Bot,
  User,
  Loader as LoaderIcon,
  Menu,
  X,
} from "lucide-react";
import Markdown from "react-markdown";

const ChatPage = () => {
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Load conversations khi component mount
  useEffect(() => {
    loadConversations();
    loadCurrentConversation();
  }, []);

  // Auto scroll to bottom khi có message mới
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus vào input khi có conversation mới
  useEffect(() => {
    if (inputRef.current && !isLoading) {
      inputRef.current.focus();
    }
  }, [currentConversationId, isLoading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadConversations = async () => {
    try {
      const allConversations = await getAllChatConversations();
      setConversations(allConversations);
    } catch (error) {
      console.error("Lỗi khi load conversations:", error);
    }
  };

  const loadCurrentConversation = () => {
    const savedConvId = localStorage.getItem("currentChatConversationId");
    const savedMessages = localStorage.getItem("currentChatMessages");

    if (savedConvId) {
      setCurrentConversationId(savedConvId);
    }

    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (error) {
        console.error("Lỗi khi parse messages:", error);
        setMessages([]);
      }
    }
  };

  const saveCurrentConversation = async (convId, msgs) => {
    // Lưu vào localStorage để persistent
    localStorage.setItem("currentChatConversationId", convId);
    localStorage.setItem("currentChatMessages", JSON.stringify(msgs));

    // Lưu vào IndexedDB (chỉ khi có message từ user)
    const hasUserMessage = msgs.some((msg) => msg.role === "user");
    if (hasUserMessage) {
      try {
        await updateChatConversation(convId, msgs);
        await loadConversations(); // Refresh danh sách
      } catch (error) {
        console.error("Lỗi khi lưu conversation:", error);
      }
    }
  };

  const getUserData = () => {
    // Lấy dữ liệu user từ localStorage
    const roadmaps = JSON.parse(localStorage.getItem("roadmaps")) || {};
    const quizStats = JSON.parse(localStorage.getItem("quizStats")) || {};

    return {
      roadmaps,
      quizStats,
      resourceCount: 0, // Sẽ cập nhật từ IndexedDB nếu cần
    };
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      role: "user",
      content: inputMessage.trim(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputMessage("");
    setIsLoading(true);

    // Nếu chưa có conversation, tạo ID mới
    let convId = currentConversationId;
    if (!convId) {
      convId = `chat_${Date.now()}`;
      setCurrentConversationId(convId);
    }

    // Lưu conversation hiện tại
    await saveCurrentConversation(convId, newMessages);

    try {
      axios.defaults.baseURL = API_CONFIG.baseURL;
      
      // Gọi API để tạo chat job
      const response = await axios.post("/api/chat", {
        messages: newMessages,
        userData: getUserData(),
      });

      const { job_id, status, message } = response.data;
      console.log(`[Chat] Job đã tạo - ID: ${job_id}, Status: ${status}`);
      console.log(`[Chat] ${message}`);

      // Polling để kiểm tra trạng thái
      await pollChatStatus(job_id, newMessages, convId);

    } catch (error) {
      console.error("Lỗi khi gọi API chat:", error);
      const errorMessage = {
        role: "assistant",
        content:
          "Xin lỗi, đã có lỗi xảy ra khi xử lý tin nhắn của bạn. Vui lòng thử lại sau.",
      };
      const updatedMessages = [...newMessages, errorMessage];
      setMessages(updatedMessages);
      await saveCurrentConversation(convId, updatedMessages);
      setIsLoading(false);
    }
  };

  // Hàm polling để kiểm tra trạng thái chat job
  const pollChatStatus = async (jobId, newMessages, convId, maxAttempts = 120, interval = 2000) => {
    let attempts = 0;

    const checkStatus = async () => {
      try {
        attempts++;
        console.log(`[Chat Polling] Lần thử ${attempts}/${maxAttempts} - Job ID: ${jobId}`);

        const response = await axios.get(`/api/chat/status/${jobId}`);
        const jobData = response.data;

        console.log(`[Chat Polling] Trạng thái: ${jobData.status}`);

        if (jobData.status === 'completed') {
          console.log('[Chat Polling] ✅ Hoàn thành!');

          const assistantMessage = {
            role: "assistant",
            content: jobData.result,
          };

          const updatedMessages = [...newMessages, assistantMessage];
          setMessages(updatedMessages);
          await saveCurrentConversation(convId, updatedMessages);
          setIsLoading(false);
          return true;
        }
        else if (jobData.status === 'failed') {
          console.error('[Chat Polling] ❌ Lỗi:', jobData.error);
          
          const errorMessage = {
            role: "assistant",
            content: `Xin lỗi, đã có lỗi xảy ra: ${jobData.error || 'Unknown error'}`,
          };
          
          const updatedMessages = [...newMessages, errorMessage];
          setMessages(updatedMessages);
          await saveCurrentConversation(convId, updatedMessages);
          setIsLoading(false);
          return true;
        }
        else if (attempts >= maxAttempts) {
          console.error('[Chat Polling] ⏱️ Timeout');
          
          const timeoutMessage = {
            role: "assistant",
            content: "Xin lỗi, quá trình xử lý mất quá nhiều thời gian. Vui lòng thử lại sau.",
          };
          
          const updatedMessages = [...newMessages, timeoutMessage];
          setMessages(updatedMessages);
          await saveCurrentConversation(convId, updatedMessages);
          setIsLoading(false);
          return true;
        }

        // Tiếp tục polling
        setTimeout(checkStatus, interval);
        return false;

      } catch (error) {
        console.error('[Chat Polling] Lỗi khi kiểm tra trạng thái:', error);

        if (attempts >= maxAttempts) {
          const errorMessage = {
            role: "assistant",
            content: "Không thể kết nối đến server. Vui lòng kiểm tra kết nối và thử lại.",
          };
          
          const updatedMessages = [...newMessages, errorMessage];
          setMessages(updatedMessages);
          await saveCurrentConversation(convId, updatedMessages);
          setIsLoading(false);
          return true;
        }

        setTimeout(checkStatus, interval);
        return false;
      }
    };

    await checkStatus();
  };

  const handleNewChat = async () => {
    // Lưu conversation hiện tại trước khi tạo mới
    if (currentConversationId && messages.length > 0) {
      await saveCurrentConversation(currentConversationId, messages);
    }

    // Reset state
    const newConvId = `chat_${Date.now()}`;
    setCurrentConversationId(newConvId);
    setMessages([]);
    localStorage.setItem("currentChatConversationId", newConvId);
    localStorage.setItem("currentChatMessages", JSON.stringify([]));

    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleLoadConversation = async (convId) => {
    // Lưu conversation hiện tại trước
    if (currentConversationId && messages.length > 0) {
      await saveCurrentConversation(currentConversationId, messages);
    }

    // Load conversation được chọn
    try {
      const conversation = await getChatConversation(convId);
      if (conversation) {
        setCurrentConversationId(conversation.id);
        setMessages(conversation.messages || []);
        localStorage.setItem("currentChatConversationId", conversation.id);
        localStorage.setItem(
          "currentChatMessages",
          JSON.stringify(conversation.messages || [])
        );
      }
    } catch (error) {
      console.error("Lỗi khi load conversation:", error);
    }
  };

  const handleDeleteConversation = async (convId, e) => {
    e.stopPropagation();

    if (!window.confirm("Bạn có chắc muốn xóa cuộc trò chuyện này?")) {
      return;
    }

    try {
      await deleteChatConversation(convId);
      await loadConversations();

      // Nếu đang xem conversation này, reset
      if (convId === currentConversationId) {
        handleNewChat();
      }
    } catch (error) {
      console.error("Lỗi khi xóa conversation:", error);
      alert("Có lỗi xảy ra khi xóa cuộc trò chuyện");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="chat-page">
      <Header chatStyle={true} />

      <div className="chat-container">
        {/* Sidebar */}
        <div className={`chat-sidebar ${isSidebarOpen ? "open" : "closed"}`}>
          <div className="chat-sidebar-header">
            <button className="new-chat-btn" onClick={handleNewChat}>
              <Plus size={20} />
              <span>Cuộc trò chuyện mới</span>
            </button>
          </div>

          <div className="chat-history">
            <h3 className="chat-history-title">
              <MessageCircle size={18} />
              Lịch sử trò chuyện
            </h3>

            {conversations.length === 0 ? (
              <div className="empty-history">
                <p>Chưa có cuộc trò chuyện nào</p>
              </div>
            ) : (
              <div className="conversation-list">
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={`conversation-item ${
                      conv.id === currentConversationId ? "active" : ""
                    }`}
                    onClick={() => handleLoadConversation(conv.id)}
                  >
                    <div className="conversation-info">
                      <MessageCircle size={16} />
                      <span className="conversation-title">{conv.title}</span>
                    </div>
                    <button
                      className="delete-conversation-btn"
                      onClick={(e) => handleDeleteConversation(conv.id, e)}
                      title="Xóa cuộc trò chuyện"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="chat-main">
          <div className="chat-header">
            <button
              className="toggle-sidebar-btn"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              title={isSidebarOpen ? "Ẩn sidebar" : "Hiện sidebar"}
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h2>
              <Bot size={28} />
              Trợ lý AI học tập
            </h2>
          </div>

          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="empty-chat">
                <Bot size={80} strokeWidth={1} />
                <h3>Xin chào! Tôi có thể giúp gì cho bạn?</h3>
                <p>
                  Tôi có thể trả lời câu hỏi về các chủ đề học tập, giải thích
                  khái niệm, và đưa ra lời khuyên dựa trên tiến độ của bạn.
                </p>
                <div className="suggested-questions">
                  <p className="suggested-label">Gợi ý câu hỏi:</p>
                  <button
                    className="suggested-btn"
                    onClick={() =>
                      setInputMessage("Hãy tóm tắt tiến độ học tập của tôi")
                    }
                  >
                    📊 Tiến độ học tập của tôi thế nào?
                  </button>
                  <button
                    className="suggested-btn"
                    onClick={() =>
                      setInputMessage(
                        "Tôi nên tập trung vào chủ đề nào tiếp theo?"
                      )
                    }
                  >
                    🎯 Tôi nên học gì tiếp theo?
                  </button>
                  <button
                    className="suggested-btn"
                    onClick={() =>
                      setInputMessage("Giải thích cho tôi về Machine Learning")
                    }
                  >
                    🤔 Giải thích một khái niệm
                  </button>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`chat-message ${message.role}-message`}
                  >
                    <div className="message-avatar">
                      {message.role === "user" ? (
                        <User size={24} />
                      ) : (
                        <Bot size={24} />
                      )}
                    </div>
                    <div className="message-content">
                      <Markdown>{message.content}</Markdown>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="chat-message assistant-message loading">
                    <div className="message-avatar">
                      <Bot size={24} />
                    </div>
                    <div className="message-content">
                      <LoaderIcon size={20} className="spinning" />
                      <span>Đang suy nghĩ...</span>
                    </div>
                  </div>
                )}
              </>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-container">
            <div className="chat-input-wrapper">
              <textarea
                ref={inputRef}
                className="chat-input"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập tin nhắn của bạn..."
                rows={1}
                disabled={isLoading}
              />
              <button
                className="send-btn"
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
