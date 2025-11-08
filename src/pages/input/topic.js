import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import "./topic.css";
import Header from "../../components/header/header";
import API_CONFIG from "../../config/api";
import { ArrowRight, LibraryBig, Search } from "lucide-react";
import Loader from "../../components/loader/loader";

const TopicPage = (props) => {
  const suggestionList = [
    "Lập trình Thi đấu",
    "Học Máy",
    "Tài chính Định lượng",
    "Phát triển Web",
    "Công nghệ Lượng tử",
  ];
  const colors = [
    "#D14EC4",
    "#AFD14E",
    "#4ED1B1",
    "#D14E4E",
    "#D1854E",
    "#904ED1",
    "#4EAAD1",
  ];
  const [topic, setTopic] = useState("");
  const [timeInput, setTimeInput] = useState(4);
  const [timeUnit, setTimeUnit] = useState("Weeks");
  const [time, setTime] = useState("4 Weeks");
  const [knowledgeLevel, setKnowledgeLevel] = useState("Absolute Beginner");
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Đang tạo lộ trình...");

  useEffect(() => {
    if (topic) {
      console.log("Topic: ", topic);
    }
  }, [topic]);

  useEffect(() => {
    setTime(timeInput + " " + timeUnit);
  }, [timeInput, timeUnit]);

  const Suggestions = ({ list }) => {
    return (
      <div className="flexbox suggestions">
        {list.map((item, i) => (
          <button key={i}>
            <div
              className="suggestionPill"
              onClick={() => {
                setTopic(item);
              }}
              style={{ "--clr": colors[i % colors.length] }}
            >
              {item} <ArrowRight className="arrow" size={30} strokeWidth={1} />
            </div>
          </button>
        ))}
      </div>
    );
  };

  const TopicInput = () => {
    const [inputVal, setInputVal] = useState("");
    const searchIcon = <Search size={65} color={"white"} strokeWidth={2} />;
    const arrowIcon = <ArrowRight size={65} color={"white"} strokeWidth={2} />;
    const [icon, setIcon] = useState(searchIcon);

    return (
      <div className="inputContainer TopicInput">
        <LibraryBig
          className="icon"
          size={78}
          color={"#73737D"}
          strokeWidth={1}
        />
        <input
          type="text"
          placeholder="Nhập chủ đề"
          value={inputVal}
          onChange={(e) => {
            setInputVal(e.target.value);
            if (e.target.value) {
              setIcon(arrowIcon);
            } else {
              setIcon(searchIcon);
            }
          }}
        />
        <button
          onClick={(e) => {
            e.preventDefault();
            if (inputVal) {
              setTopic(inputVal);
            }
          }}
        >
          {icon}
        </button>
      </div>
    );
  };
  const SetTopic = () => {
    return (
      <div className="flexbox main setTopic">
        <h2>Bạn muốn học gì?</h2>
        <TopicInput />
        <h3>Gợi ý:</h3>
        <Suggestions list={suggestionList}></Suggestions>
      </div>
    );
  };

  const TimeInput = () => {
    return (
      <div className="flexbox TimeInput">
        <div className="inputContainer">
          <input
            id="timeInput"
            type="number"
            value={timeInput}
            onChange={(e) => {
              if (e.target.value > 100 || e.target.value < 0) {
                return;
              }
              setTimeInput(e.target.value);
            }}
          />
        </div>
        <div className="inputContainer">
          <select
            name="timeUnit"
            id="timeUnit"
            value={timeUnit}
            onChange={(e) => {
              setTimeUnit(e.target.value);
            }}
          >
            {/* <option value="Days" id="Days">
              Ngày
            </option>
            <option value="Hours" id="Hours">
              Giờ
            </option> */}
            <option value="Weeks" id="Weeks">
              Tuần
            </option>
            <option value="Months" id="Months">
              Tháng
            </option>
          </select>
        </div>
      </div>
    );
  };
  const KnowledgeLevelInput = () => {
    return (
      <div className="inputContainer">
        <select
          name="knowledgeLevel"
          id="knowledgeLevel"
          style={{ width: "min-content", textAlign: "center" }}
          value={knowledgeLevel}
          onChange={(e) => {
            setKnowledgeLevel(e.target.value);
          }}
        >
          <option value="Absolute Beginner">Người mới bắt đầu hoàn toàn</option>
          <option value="Beginner">Người mới bắt đầu</option>
          <option value="Moderate">Trung bình</option>
          <option value="Expert">Chuyên gia</option>
        </select>
      </div>
    );
  };
  const SubmitButton = ({ children }) => {
    const navigate = useNavigate();
    
    // Hàm polling để kiểm tra trạng thái job
    const pollJobStatus = async (jobId, maxAttempts = 180, interval = 3000) => {
      let attempts = 0;
      
      const checkStatus = async () => {
        try {
          attempts++;
          const elapsedSeconds = (attempts * interval) / 1000;
          console.log(`[Polling] Lần thử ${attempts}/${maxAttempts} - Job ID: ${jobId}`);
          
          // Cập nhật loading message
          setLoadingMessage(`Đang xử lý... (${elapsedSeconds.toFixed(0)}s)`);
          
          // Gọi API với timeout 30 giây
          const response = await axios.get(`/api/roadmap/status/${jobId}`, {
            timeout: 30000, // 30 giây timeout cho mỗi request
            headers: {
              'Content-Type': 'application/json'
            }
          });
          const jobData = response.data;
          
          console.log(`[Polling] Trạng thái: ${jobData.status}`);
          
          if (jobData.status === 'completed') {
            console.log('[Polling] ✅ Hoàn thành!');
            setLoading(false);
            
            // Lưu vào localStorage
            let topics = JSON.parse(localStorage.getItem("topics")) || {};
            topics[topic] = { time, knowledge_level: knowledgeLevel };
            localStorage.setItem("topics", JSON.stringify(topics));
            
            let roadmaps = JSON.parse(localStorage.getItem("roadmaps")) || {};
            roadmaps[topic] = jobData.result;
            localStorage.setItem("roadmaps", JSON.stringify(roadmaps));
            
            navigate("/roadmap?topic=" + encodeURI(topic));
            return true;
          } 
          else if (jobData.status === 'failed') {
            console.error('[Polling] ❌ Lỗi:', jobData.error);
            setLoading(false);
            alert(`Lỗi khi tạo lộ trình: ${jobData.error || 'Lỗi không xác định'}`);
            navigate("/");
            return true;
          }
          else if (attempts >= maxAttempts) {
            console.error('[Polling] ⏱️ Timeout - Đã hết thời gian chờ');
            setLoading(false);
            alert("Quá trình tạo lộ trình mất quá nhiều thời gian. Vui lòng thử lại sau hoặc kiểm tra kết nối mạng.");
            navigate("/");
            return true;
          }
          
          // Tiếp tục polling nếu vẫn đang xử lý
          setTimeout(checkStatus, interval);
          return false;
          
        } catch (error) {
          console.error('[Polling] Lỗi khi kiểm tra trạng thái:', error);
          
          // Kiểm tra loại lỗi
          if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
            console.error('[Polling] ⏱️ Request timeout');
          } else if (error.response) {
            console.error('[Polling] Server response error:', error.response.status);
          } else if (error.request) {
            console.error('[Polling] Network error - no response received');
          }
          
          if (attempts >= maxAttempts) {
            setLoading(false);
            alert("Không thể kết nối đến server. Vui lòng kiểm tra:\n1. Backend server đã chạy chưa?\n2. Kết nối mạng có ổn định không?\n3. CORS đã được cấu hình đúng chưa?");
            navigate("/");
            return true;
          }
          
          // Thử lại sau một khoảng thời gian
          setTimeout(checkStatus, interval);
          return false;
        }
      };
      
      // Bắt đầu polling
      await checkStatus();
    };
    
    return (
      <button
        className="SubmitButton"
        onClick={async () => {
          if (time === "0 Weeks" || time === "0 Months") {
            alert("Vui lòng nhập khoảng thời gian hợp lệ");
            return;
          }
          
          setLoading(true);
          
          // Kiểm tra xem topic đã tồn tại chưa
          let topics = JSON.parse(localStorage.getItem("topics")) || {};
          if (Object.keys(topics).includes(topic)) {
            // Nếu đã có, chuyển thẳng đến roadmap
            navigate("/roadmap?topic=" + encodeURI(topic));
            return;
          }
          
          try {
            let data = { topic, time, knowledge_level: knowledgeLevel };
            console.log('[Submit] Gửi request tạo roadmap:', data);
            
            axios.defaults.baseURL = API_CONFIG.baseURL;
            
            // Gọi API để tạo job với timeout 30 giây
            const response = await axios({
              method: "POST",
              url: "/api/roadmap",
              data: data,
              headers: {
                "Content-Type": "application/json",
              },
              timeout: 30000, // 30 giây timeout cho request tạo job
            });
            
            const { job_id, status, message } = response.data;
            console.log(`[Submit] Job đã tạo - ID: ${job_id}, Status: ${status}`);
            console.log(`[Submit] ${message}`);
            
            // Bắt đầu polling để kiểm tra trạng thái
            await pollJobStatus(job_id);
            
          } catch (error) {
            console.error('[Submit] Lỗi:', error);
            setLoading(false);
            
            // Xử lý lỗi chi tiết hơn
            if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
              alert("Kết nối đến server bị timeout. Vui lòng kiểm tra:\n1. Backend server có đang chạy không?\n2. URL API có đúng không? (" + API_CONFIG.baseURL + ")");
            } else if (error.response) {
              alert(`Lỗi từ server: ${error.response.data?.error || error.response.statusText}`);
            } else if (error.request) {
              alert("Không thể kết nối đến server. Vui lòng kiểm tra:\n1. Backend đã chạy chưa?\n2. CORS configuration\n3. Network connection");
            } else {
              alert("Đã xảy ra lỗi: " + error.message);
            }
            
            navigate("/");
          }
        }}
      >
        {children}
      </button>
    );
  };
  const SetDetails = () => {
    return (
      <div className="flexbox main setDetails">
        <h2>Bạn có bao nhiêu thời gian để học?</h2>
        <TimeInput />
        <h2 style={{ marginTop: "1.5em" }}>
          Trình độ kiến thức của bạn về chủ đề
        </h2>
        <KnowledgeLevelInput />
        <SubmitButton>Bắt đầu học</SubmitButton>
      </div>
    );
  };

  return (
    <div className="wrapper">
      <Loader style={{ display: loading ? "block" : "none" }}>
        {loadingMessage}
      </Loader>
      <Header></Header>
      {!topic ? <SetTopic /> : <SetDetails />}
    </div>
  );
};

export default TopicPage;
