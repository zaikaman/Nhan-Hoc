import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import "./roadmap.css";
import Header from "../../components/header/header";
import Loader from "../../components/loader/loader";
import Modal from "../../components/modal/modal";
import {
  CirclePlus,
  ChevronDown,
  ChevronRight,
  LoaderPinwheel,
  FolderSearch,
  Bot,
  Database,
  Trash2,
} from "lucide-react";
import { translateLocalStorage, translateObj } from "../../translate/translate";
import Markdown from "react-markdown";
import ConfettiExplosion from "react-confetti-explosion";
import { 
  saveResource, 
  getResource, 
  resourceExists,
  deleteResource 
} from "../../utils/indexedDB";

const RoadmapPage = (props) => {
  const [resources, setResources] = useState(null);
  const [resourceParam, setResourceParam] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const [roadmap, setRoadmap] = useState({});
  const [topicDetails, setTopicDetails] = useState({
    time: "-",
    knowledge_level: "-",
  });
  const [quizStats, setQuizStats] = useState({});
  const [confettiExplode, setConfettiExplode] = useState(false);
  const [hasCache, setHasCache] = useState(false);
  const navigate = useNavigate();
  const topic = searchParams.get("topic");
  if (!topic) {
    navigate("/");
  }
  useEffect(() => {
    const topics = JSON.parse(localStorage.getItem("topics")) || {};

    setTopicDetails(topics[topic] || { time: "-", knowledge_level: "-" });

    const roadmaps = JSON.parse(localStorage.getItem("roadmaps")) || {};
    setRoadmap(roadmaps[topic] || {});
    // setLoading(true);
    // translateObj(roadmaps[topic], "hi").then((translatedObj) => {
    // setRoadmap(translatedObj);
    // setLoading(false);
    //   console.log(translatedObj);
    // });

    const stats = JSON.parse(localStorage.getItem("quizStats")) || {};
    setQuizStats(stats[topic] || {});

    if (
      !Object.keys(roadmaps).includes(topic) ||
      !Object.keys(topics).includes(topic)
    ) {
      //   alert(`Roadmap for ${topic} not found. Please generate it first.`);
      navigate("/");
    }
    console.log(roadmap);
    console.log(topicDetails);
  }, [topic]);

  const colors = [
    "#D14EC4",
    "#4ED1B1",
    "#D14E4E",
    "#4EAAD1",
    "#D1854E",
    "#904ED1",
    "#AFD14E",
  ];

  const Subtopic = ({ subtopic, number, style, weekNum, quizStats }) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const topic = searchParams.get("topic");
    return (
      <div
        className="flexbox subtopic"
        style={{ ...style, justifyContent: "space-between" }}
      >
        <h1 className="number">{number}</h1>
        <div className="detail">
          <h3
            style={{
              fontWeight: "600",
              textTransform: "capitalize",
            }}
          >
            {subtopic["chủ đề con"] || subtopic.subtopic}
          </h3>
          <p className="time">
            {(
              parseFloat((subtopic["thời gian"] || subtopic.time).replace(/^\D+/g, "")) *
              (parseFloat(localStorage.getItem("hardnessIndex")) || 1)
            ).toFixed(1)}{" "}
            {(subtopic["thời gian"] || subtopic.time).replace(/[0-9]/g, "")}
          </p>
          <p style={{ fontWeight: "300", opacity: "61%", marginTop: "1em" }}>
            {subtopic["mô tả"] || subtopic.description}
          </p>
        </div>
        <div
          className="hardness"
          onClick={() => {
            let hardness = prompt(
              "Đánh giá độ khó từ 1-10 (5 nghĩa là hoàn hảo)"
            );
            if (hardness) {
              let hardnessIndex =
                parseFloat(localStorage.getItem("hardnessIndex")) || 1;
              hardnessIndex = hardnessIndex + (hardness - 5) / 10;
              localStorage.setItem("hardnessIndex", hardnessIndex);
              window.location.reload();
            }
          }}
        >
          Đánh giá độ khó
        </div>

        <div className="flexbox buttons" style={{ flexDirection: "column" }}>
          <button
            className="resourcesButton"
            onClick={() => {
              setModalOpen(true);
              setResourceParam({
                subtopic: subtopic["chủ đề con"] || subtopic.subtopic,
                description: subtopic["mô tả"] || subtopic.description,
                time: subtopic["thời gian"] || subtopic.time,
                course: topic,
                knowledge_level: topicDetails?.knowledge_level || "-",
              });
            }}
          >
            Resources
          </button>
          {quizStats && quizStats.timeTaken ? (
            <div className="quiz_completed">
              {((quizStats.numCorrect * 100) / quizStats.numQues).toFixed(1) +
                "% Đúng trong " +
                (quizStats.timeTaken / 1000).toFixed(0) +
                "s"}
            </div>
          ) : (
            <button
              className="quizButton"
              onClick={() => {
                navigate(
                  `/quiz?topic=${topic}&week=${weekNum}&subtopic=${number}`
                );
              }}
            >
              Bắt đầu kiểm tra
            </button>
          )}
        </div>
      </div>
    );
  };

  const TopicBar = ({
    week,
    topic,
    color,
    subtopics,
    style,
    children,
    weekNum,
    quizStats,
  }) => {
    const [open, setOpen] = useState(false);
    return (
      <div style={style}>
        <div className="topic-bar" style={{ "--clr": color }}>
          <div className="topic-bar-title">
            <h3
              className="week"
              style={{ fontWeight: "400", textTransform: "capitalize" }}
            >
              {week}
            </h3>
            <h2
              style={{
                fontWeight: "400",
                textTransform: "capitalize",
                color: "white",
              }}
            >
              {topic}
            </h2>
          </div>
          <button
            className="plus"
            style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)" }}
            onClick={() => {
              setOpen(!open);
            }}
          >
            <ChevronRight
              size={50}
              strokeWidth={2}
              color={color}
            ></ChevronRight>
          </button>
          <div
            className="subtopics"
            style={{ display: open ? "block" : "none" }}
          >
            {subtopics?.map((subtopic, i) => (
              <Subtopic
                subtopic={subtopic}
                number={i + 1}
                weekNum={weekNum}
                quizStats={quizStats[i + 1] || {}}
                key={i}
              ></Subtopic>
            ))}
          </div>
        </div>

        {children}
      </div>
    );
  };
  const ResourcesSection = ({ children }) => {
    // Kiểm tra cache khi component mount hoặc resourceParam thay đổi
    useEffect(() => {
      if (resourceParam.topic && resourceParam.subtopic) {
        checkCache();
      }
    }, [resourceParam]);

    const checkCache = async () => {
      try {
        const exists = await resourceExists(resourceParam.course, resourceParam.subtopic);
        setHasCache(exists);
      } catch (error) {
        console.error('Lỗi khi kiểm tra cache:', error);
        setHasCache(false);
      }
    };

    const loadFromCache = async () => {
      try {
        setLoading(true);
        const cachedResource = await getResource(resourceParam.course, resourceParam.subtopic);
        
        if (cachedResource) {
          setLoading(false);
          setResources(
            <div className="res">
              <div className="res-header">
                <h2 className="res-heading">{cachedResource.subtopic}</h2>
                <button 
                  className="delete-cache-btn"
                  onClick={async () => {
                    if (window.confirm('Bạn có chắc muốn xóa tài nguyên này khỏi bộ nhớ?')) {
                      await deleteResource(resourceParam.course, resourceParam.subtopic);
                      setResources(null);
                      setHasCache(false);
                      alert('Đã xóa tài nguyên khỏi bộ nhớ');
                    }
                  }}
                  title="Xóa khỏi bộ nhớ"
                >
                  <Trash2 size={20} />
                </button>
              </div>
              <p className="cached-info">
                📦 Đã lưu từ cache • {new Date(cachedResource.timestamp).toLocaleString('vi-VN')}
              </p>
              <Markdown>{cachedResource.content}</Markdown>
            </div>
          );
          setTimeout(() => {
            setConfettiExplode(true);
          }, 300);
        } else {
          setLoading(false);
          alert('Không tìm thấy tài nguyên trong bộ nhớ');
        }
      } catch (error) {
        setLoading(false);
        console.error('Lỗi khi load từ cache:', error);
        alert('Lỗi khi tải tài nguyên từ bộ nhớ');
      }
    };

    const generateNewResource = async () => {
      setLoading(true);
      axios.defaults.baseURL = "http://localhost:5000";

      try {
        const res = await axios({
          method: "POST",
          url: "/api/generate-resource",
          data: resourceParam,
          withCredentials: false,
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
        });

        // Lưu vào IndexedDB
        const resourceData = {
          topic: resourceParam.course,
          subtopic: resourceParam.subtopic,
          description: resourceParam.description,
          time: resourceParam.time,
          knowledge_level: resourceParam.knowledge_level,
          content: res.data,
        };

        await saveResource(resourceData);
        console.log('✅ Đã lưu resource vào IndexedDB');

        setLoading(false);
        setResources(
          <div className="res">
            <div className="res-header">
              <h2 className="res-heading">{resourceParam.subtopic}</h2>
              <span className="saved-badge">💾 Đã lưu vào bộ nhớ</span>
            </div>
            <Markdown>{res.data}</Markdown>
          </div>
        );
        setHasCache(true);
        
        setTimeout(() => {
          setConfettiExplode(true);
          console.log("exploding confetti...");
        }, 500);
      } catch (err) {
        setLoading(false);
        console.error('Lỗi:', err);
        alert("Lỗi khi tạo tài nguyên");
        navigate("/roadmap?topic=" + encodeURI(topic));
      }
    };

    return (
      <div className="flexbox resources">
        <div className="generativeFill">
          {hasCache && (
            <button
              className="primary cache-button"
              onClick={loadFromCache}
              style={{ marginBottom: '1rem' }}
            >
              <Database size={70} strokeWidth={1} className="icon"></Database>
              Tải từ bộ nhớ đã lưu
            </button>
          )}
          <button
            className="primary"
            onClick={generateNewResource}
          >
            <Bot size={70} strokeWidth={1} className="icon"></Bot> 
            {hasCache ? 'Tạo lại bằng AI' : 'Tài nguyên được tạo bởi AI'}
          </button>
        </div>
        {/* OR */}
        <div className="databaseFill">
          <button className="primary" id="searchWidgetTrigger">
            <FolderSearch
              size={70}
              strokeWidth={1}
              className="icon"
            ></FolderSearch>
            Duyệt khóa học trực tuyến
          </button>
        </div>
      </div>
    );
  };
  return (
    <div className="roadmap_wrapper">
      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setResources(null);
        }}
      >
        {!resources ? (
          <ResourcesSection></ResourcesSection>
        ) : (
          <>
            {confettiExplode && (
              <ConfettiExplosion zIndex={10000} style={{ margin: "auto" }} />
            )}

            {resources}
          </>
        )}
      </Modal>
      <Header></Header>

      <Loader style={{ display: loading ? "block" : "none" }}>
        Đang tạo tài nguyên...
      </Loader>
      <div className="content">
        <div className="flexbox topic">
          <h1 style={{ display: "inline-block", marginRight: "2ch" }}>
            {topic}
          </h1>
          <h2 style={{ display: "inline-block", color: "#B6B6B6" }}>
            {topicDetails.time}
          </h2>
        </div>
        <div className="roadmap">
          {Object.keys(roadmap)
            .sort(
              (a, b) => parseInt(a.split(" ")[1]) - parseInt(b.split(" ")[1])
            )
            .map((week, i) => {
              return (
                <TopicBar
                  key={i}
                  weekNum={i + 1}
                  week={week}
                  topic={roadmap[week]["chủ đề"] || roadmap[week].topic}
                  subtopics={roadmap[week]["các chủ đề con"] || roadmap[week].subtopics}
                  color={colors[i % colors.length]}
                  quizStats={quizStats[i + 1] || {}}
                ></TopicBar>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default RoadmapPage;
