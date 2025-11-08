import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import "./quiz.css";
import Header from "../../components/header/header";
import Loader from "../../components/loader/loader";
import API_CONFIG from "../../config/api";
import { CircleCheck, CircleX } from "lucide-react";

const Question = ({ questionData, num, style }) => {
  const [attempted, setAttempted] = useState(false);
  return (
    <div className="question" style={style}>
      <h3>
        <span style={{ marginRight: "1ch" }}>{num + "."}</span>
        {questionData.question}
      </h3>
      <div className="flexbox options">
        {questionData.options.map((option, index) => {
          return (
            <div className="option" key={index}>
              <input
                type="radio"
                name={"ques" + (num + 1)}
                id={"ques" + (num + 1) + "index" + index}
                className={
                  (index === questionData.answerIndex ? "correct" : "wrong") +
                  " " +
                  (attempted ? "attempted" : "")
                }
                onClick={(e) => {
                  if (attempted) {
                    e.preventDefault();
                  } else {
                    if (window.numAttmpt === window.numQues - 1) {
                      window.timeTaken =
                        new Date().getTime() - window.startTime;
                      console.log(window.timeTaken);
                    }
                    if (index === questionData.answerIndex) {
                      window.numCorrect++;
                    }
                    window.numAttmpt++;
                    console.log(
                      window.numAttmpt,
                      window.numQues,
                      window.numCorrect
                    );
                    setAttempted(true);
                  }
                }}
              />
              <label htmlFor={"ques" + (num + 1) + "index" + index}>
                {option}
              </label>
              {index === questionData.answerIndex ? (
                <CircleCheck
                  className="optionIcon"
                  size={35}
                  strokeWidth={1}
                  color="#00FFE0"
                />
              ) : (
                <CircleX
                  className="optionIcon"
                  size={35}
                  strokeWidth={1}
                  color="#FF3D00"
                />
              )}
            </div>
          );
        })}
        <div
          className="reason"
          style={{ display: attempted ? "block" : "none" }}
        >
          {questionData.reason}
        </div>
      </div>
    </div>
  );
};

const QuizPage = (props) => {
  const [searchParams] = useSearchParams();
  const [subtopic, setSubtopic] = useState("");
  const [description, setDescription] = useState("");
  const [topic, setTopic] = useState("");
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("Đang tạo câu hỏi cá nhân hóa cho bạn...");

  const navigate = useNavigate();

  const course = searchParams.get("topic");
  const weekNum = searchParams.get("week");
  const subtopicNum = searchParams.get("subtopic");
  if (!course || !weekNum || !subtopicNum) {
    navigate("/");
  }
  useEffect(() => {
    let topics = JSON.parse(localStorage.getItem("topics")) || {};
    const roadmaps = JSON.parse(localStorage.getItem("roadmaps")) || {};

    if (
      !Object.keys(roadmaps).includes(course) ||
      !Object.keys(topics).includes(course)
    ) {
      navigate("/");
      return;
    }
    const week = Object.keys(roadmaps[course])[weekNum - 1];
    if (!week || !roadmaps[course][week]) {
      navigate("/");
      return;
    }
    setTopic(roadmaps[course][week]["chủ đề"] || roadmaps[course][week].topic);
    console.log(weekNum, week, Object.keys(roadmaps[course]));
    const subtopics = roadmaps[course][week]["các chủ đề con"] || roadmaps[course][week].subtopics || [];
    const currentSubtopic = subtopics[subtopicNum - 1];
    if (!currentSubtopic) {
      navigate("/");
      return;
    }
    setSubtopic(currentSubtopic["chủ đề con"] || currentSubtopic.subtopic);
    setDescription(currentSubtopic["mô tả"] || currentSubtopic.description);
  }, [course, navigate, weekNum, subtopicNum]);

  useEffect(() => {
    console.log(course, topic, subtopic, description);
    if (!course || !topic || !subtopic || !description) return;
    
    const quizzes = JSON.parse(localStorage.getItem("quizzes")) || {};
    if (
      quizzes[course] &&
      quizzes[course][weekNum] &&
      quizzes[course][weekNum][subtopicNum]
    ) {
      setQuestions(quizzes[course][weekNum][subtopicNum]);
      window.numQues = quizzes[course][weekNum][subtopicNum].length;
      setLoading(false);
      window.startTime = new Date().getTime();
      window.numAttmpt = 0;
      window.numCorrect = 0;
      return;
    }
    
    // Nếu chưa có quiz trong cache, tạo mới với polling
    fetchQuizWithPolling();
    
  }, [course, topic, subtopic, description, subtopicNum, weekNum]);

  const fetchQuizWithPolling = async () => {
    try {
      console.log("Đang tạo quiz job...");
      axios.defaults.baseURL = API_CONFIG.baseURL;

      // Gọi API để tạo job
      const response = await axios({
        method: "POST",
        url: "/api/quiz",
        headers: {
          "Content-Type": "application/json",
        },
        data: { course, topic, subtopic, description },
      });

      const { job_id, status, message } = response.data;
      console.log(`[Quiz] Job đã tạo - ID: ${job_id}, Status: ${status}`);
      console.log(`[Quiz] ${message}`);

      // Polling để kiểm tra trạng thái
      await pollQuizStatus(job_id);

    } catch (error) {
      console.error('Lỗi:', error);
      setLoading(false);
      alert("Đã xảy ra lỗi khi lấy bài kiểm tra. Vui lòng thử lại sau.");
    }
  };

  const pollQuizStatus = async (jobId, maxAttempts = 120, interval = 2000) => {
    let attempts = 0;

    const checkStatus = async () => {
      try {
        attempts++;
        const elapsedSeconds = (attempts * interval) / 1000;
        console.log(`[Quiz Polling] Lần thử ${attempts}/${maxAttempts} - Job ID: ${jobId}`);
        
        // Cập nhật loading message
        setLoadingMessage(`Đang tạo câu hỏi... (${elapsedSeconds.toFixed(0)}s)`);

        const response = await axios.get(`/api/quiz/status/${jobId}`);
        const jobData = response.data;

        console.log(`[Quiz Polling] Trạng thái: ${jobData.status}`);

        if (jobData.status === 'completed') {
          console.log('[Quiz Polling] ✅ Hoàn thành!');

          setQuestions(jobData.result.questions);
          
          // Lưu vào localStorage
          const quizzes = JSON.parse(localStorage.getItem("quizzes")) || {};
          quizzes[course] = quizzes[course] || {};
          quizzes[course][weekNum] = quizzes[course][weekNum] || {};
          quizzes[course][weekNum][subtopicNum] = jobData.result.questions;
          localStorage.setItem("quizzes", JSON.stringify(quizzes));
          
          window.numQues = jobData.result.questions.length;
          setLoading(false);
          window.startTime = new Date().getTime();
          window.numAttmpt = 0;
          window.numCorrect = 0;
          
          return true;
        }
        else if (jobData.status === 'failed') {
          console.error('[Quiz Polling] ❌ Lỗi:', jobData.error);
          setLoading(false);
          alert(`Lỗi khi tạo bài kiểm tra: ${jobData.error || 'Unknown error'}`);
          return true;
        }
        else if (attempts >= maxAttempts) {
          console.error('[Quiz Polling] ⏱️ Timeout');
          setLoading(false);
          alert("Quá trình tạo bài kiểm tra mất quá nhiều thời gian. Vui lòng thử lại sau.");
          return true;
        }

        // Tiếp tục polling
        setTimeout(checkStatus, interval);
        return false;

      } catch (error) {
        console.error('[Quiz Polling] Lỗi khi kiểm tra trạng thái:', error);

        if (attempts >= maxAttempts) {
          setLoading(false);
          alert("Không thể kiểm tra trạng thái job. Vui lòng thử lại.");
          return true;
        }

        setTimeout(checkStatus, interval);
        return false;
      }
    };

    await checkStatus();
  };

  const SubmitButton = () => {
    return (
      <div className="submit">
        <button
          className="SubmitButton"
          onClick={() => {
            if (!window.timeTaken) {
              let time = new Date().getTime() - window.startTime;
              window.timeTaken = time;
            }
            const quizStats =
              JSON.parse(localStorage.getItem("quizStats")) || {};
            quizStats[course] = quizStats[course] || {};
            quizStats[course][weekNum] = quizStats[course][weekNum] || {};
            quizStats[course][weekNum][subtopicNum] = {
              numCorrect: window.numCorrect,
              numQues: window.numQues,
              timeTaken: window.timeTaken,
            };
            console.log(quizStats);
            let hardnessIndex =
              parseFloat(localStorage.getItem("hardnessIndex")) || 1;
            hardnessIndex =
              hardnessIndex +
              ((window.numQues - window.numCorrect) / (window.numQues * 2)) *
                (window.timeTaken / (5 * 60 * 1000 * window.numQues));
            localStorage.setItem("hardnessIndex", hardnessIndex);
            localStorage.setItem("quizStats", JSON.stringify(quizStats));
            navigate("/roadmap?topic=" + encodeURI(course));
          }}
        >
          Nộp bài
        </button>
      </div>
    );
  };

  return (
    <div className="quiz_wrapper">
      <Header></Header>
      <Loader style={{ display: loading ? "block" : "none" }}>
        {loadingMessage}
      </Loader>
      <div className="content">
        <h1>{subtopic}</h1>
        <h3 style={{ opacity: "0.61", fontWeight: "300", marginBottom: "2em" }}>
          {description}
        </h3>
        {questions.map((question, index) => {
          return <Question questionData={question} num={index + 1} />;
        })}
        <SubmitButton />
      </div>
    </div>
  );
};

export default QuizPage;
