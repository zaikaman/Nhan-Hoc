import { useEffect, useState, useMemo } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import "./profile.css";
import Header from "../../components/header/header";
import { ArrowRight, Plus, User, Edit2, Check, X } from "lucide-react";
import { getUserProfile, updateUsername } from "../../utils/indexedDB";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

const getStats = (roadmaps, quizStats) => {
  const stats = {};
  stats.progress = {};
  for (let topic in quizStats) {
    // Kiểm tra nếu roadmap cho topic này tồn tại
    if (!roadmaps[topic]) {
      continue;
    }
    
    let numWeightage = 0;
    let completedWeightage = 0;
    Object.keys(roadmaps[topic]).forEach((week, i) => {
      // Hỗ trợ cả tiếng Việt và tiếng Anh
      const subtopics = roadmaps[topic][week]["các chủ đề con"] || roadmaps[topic][week].subtopics;
      
      // Kiểm tra nếu subtopics tồn tại và là mảng
      if (!subtopics || !Array.isArray(subtopics)) {
        return;
      }
      
      subtopics.forEach((subtopic, j) => {
        // Hỗ trợ cả tiếng Việt và tiếng Anh cho trường time
        const timeStr = subtopic["thời gian"] || subtopic.time || "0";
        const timeValue = parseInt(timeStr.replace(/^\D+/g, "")) || 0;
        
        numWeightage += timeValue;
        if (
          quizStats[topic] &&
          quizStats[topic][i + 1] &&
          quizStats[topic][i + 1][j + 1]
        ) {
          completedWeightage += timeValue;
        }
      });
    });
    stats.progress[topic] = {
      total: numWeightage,
      completed: completedWeightage,
    };
  }
  console.log(stats);
  return stats;
};
const TopicButton = ({ children }) => {
  const navigate = useNavigate();
  return (
    <button
      className="SubmitButton"
      onClick={() => {
        navigate("/topic");
      }}
    >
      {children}
    </button>
  );
};
const ProfilePage = (props) => {
  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
  );
  const topics = JSON.parse(localStorage.getItem("topics")) || {};
  const colors = useMemo(() => [
    "#D14EC4",
    "#AFD14E",
    "#4ED1B1",
    "#D14E4E",
    "#D1854E",
    "#904ED1",
    "#4EAAD1",
  ], []);
  const [stats, setStats] = useState({});
  const [percentCompletedData, setPercentCompletedData] = useState({});
  const [userProfile, setUserProfile] = useState(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempUsername, setTempUsername] = useState("");

  // Load user profile
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const profile = await getUserProfile();
        if (profile) {
          setUserProfile(profile);
          setTempUsername(profile.username);
        }
      } catch (error) {
        console.error('Lỗi khi tải user profile:', error);
      }
    };
    loadUserProfile();
  }, []);

  useEffect(() => {
    const roadmaps = JSON.parse(localStorage.getItem("roadmaps")) || {};
    const quizStats = JSON.parse(localStorage.getItem("quizStats")) || {};
    setStats(getStats(roadmaps, quizStats));
  }, []);
  useEffect(() => {
    let progress = stats.progress || {};
    let labels = Object.keys(progress);
    let data = Object.values(progress).map(
      (topicProgress) => (topicProgress.completed * 100) / topicProgress.total
    );
    let backgroundColors = Object.values(progress).map(
      (topicProgress, index) => colors[index % colors.length]
    );
    setPercentCompletedData({
      labels: labels,
      datasets: [
        {
          label: "% Hoàn thành",
          data: data,
          backgroundColor: backgroundColors,
          borderColor: backgroundColors,
          borderWidth: 1,
        },
      ],
    });
  }, [stats, colors]);

  const handleEditName = () => {
    setIsEditingName(true);
  };

  const handleSaveName = async () => {
    if (tempUsername.trim().length < 2) {
      alert('Tên người dùng phải có ít nhất 2 ký tự');
      return;
    }

    if (tempUsername.trim().length > 30) {
      alert('Tên người dùng không được quá 30 ký tự');
      return;
    }

    try {
      await updateUsername(tempUsername.trim());
      const updatedProfile = await getUserProfile();
      setUserProfile(updatedProfile);
      setIsEditingName(false);
    } catch (error) {
      console.error('Lỗi khi cập nhật tên:', error);
      alert('Có lỗi xảy ra khi cập nhật tên');
    }
  };

  const handleCancelEdit = () => {
    setTempUsername(userProfile?.username || '');
    setIsEditingName(false);
  };

  return (
    <div className="profile_wrapper">
      <Header></Header>
      <div className="flexbox content">
        <div className="flexbox info">
          <div className="avatar-container">
            <User size={80} strokeWidth={1.5} className="avatar-icon" />
          </div>
          <div className="flexbox text">
            <div className="username-container">
              {!isEditingName ? (
                <>
                  <h1>{userProfile?.username || 'Người dùng'}</h1>
                  <button 
                    className="edit-name-btn" 
                    onClick={handleEditName}
                    title="Chỉnh sửa tên"
                  >
                    <Edit2 size={20} />
                  </button>
                </>
              ) : (
                <div className="edit-name-group">
                  <input
                    type="text"
                    value={tempUsername}
                    onChange={(e) => setTempUsername(e.target.value)}
                    className="edit-name-input"
                    maxLength={30}
                    autoFocus
                  />
                  <button 
                    className="save-name-btn" 
                    onClick={handleSaveName}
                    title="Lưu"
                  >
                    <Check size={20} />
                  </button>
                  <button 
                    className="cancel-name-btn" 
                    onClick={handleCancelEdit}
                    title="Hủy"
                  >
                    <X size={20} />
                  </button>
                </div>
              )}
            </div>
            <h3>
              Khóa học đang học: <b>{Object.keys(topics).length}</b>
            </h3>
            <h3>
              Chỉ số độ khó:{" "}
              <b>
                {(
                  parseFloat(localStorage.getItem("hardnessIndex")) || 1
                ).toFixed(3)}
              </b>
            </h3>
          </div>
        </div>
        <div className="newTopic">
          <TopicButton>
            <h2>
              <Plus
                size={25}
                strokeWidth={2}
                style={{ marginRight: "1ch", scale: "1.2" }}
              ></Plus>
              Học điều gì đó mới
            </h2>
          </TopicButton>
        </div>

        <div className="courses">
          <h2 className="heading">Tiếp tục học</h2>
          <div className="flexbox">
            {Object.keys(topics).map((course, i) => {
              return (
                <NavLink
                  key={course}
                  className="link"
                  to={"/roadmap?topic=" + encodeURI(course)}
                >
                  <div
                    className="card"
                    style={{ "--clr": colors[i % colors.length] }}
                  >
                    <div className="title">{course}</div>

                    <div className="time">{topics[course].time}</div>

                    <div className="knowledge_level">
                      {topics[course].knowledge_level}
                    </div>
                    {/* <div className="progressContainer flexbox">
                      <label htmlFor="progresspercent">32% Completed</label>
                      <progress
                        id="progresspercent"
                        value="32"
                        max="100"
                      ></progress>
                    </div> */}
                    <ArrowRight
                      size={50}
                      strokeWidth={2}
                      className="arrow"
                    ></ArrowRight>
                  </div>
                </NavLink>
              );
            })}
          </div>
        </div>
        <div className="progress">
          <h2 className="heading">Tiến độ</h2>
          <div className="charts">
            {Object.keys(percentCompletedData).length ? (
              <div
                className="bar"
                style={{
                  maxWidth: "700px",
                  minHeight: "500px",
                  filter: "brightness(1.5)",
                  background: "black",
                  borderRadius: "30px",
                  padding: "20px",
                  margin: "auto",
                }}
              >
                <Bar
                  data={percentCompletedData}
                  options={{ maintainAspectRatio: false, indexAxis: "y" }}
                />
              </div>
            ) : (
              ""
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
