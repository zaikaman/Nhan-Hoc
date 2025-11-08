import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import "./quiz.css";
import Header from "../../components/header/header";
import Loader from "../../components/loader/loader";
import API_CONFIG from "../../config/api";
import { CircleCheck, CircleX } from "lucide-react";
import { saveQuizResult, saveLearningActivity } from "../../utils/indexedDB";

// Helper function để đảm bảo answerIndex là số nguyên
const normalizeQuizData = (questions) => {
  return questions.map(q => ({
    ...q,
    answerIndex: typeof q.answerIndex === 'string' ? parseInt(q.answerIndex) : q.answerIndex
  }));
};

const Question = ({ questionData, num, style }) => {
  const [attempted, setAttempted] = useState(false);
  
  // Debug: Kiểm tra kiểu dữ liệu của answerIndex
  useEffect(() => {
    console.log(`Question ${num} - answerIndex:`, questionData.answerIndex, typeof questionData.answerIndex);
  }, [questionData.answerIndex, num]);
  
  return (
    <div className="question" style={style}>
      <h3>
        <span style={{ marginRight: "1ch" }}>{num + "."}</span>
        {questionData.question}
      </h3>
      <div className="flexbox options">
        {questionData.options.map((option, index) => {
          const isCorrectAnswer = index === questionData.answerIndex;
          return (
            <div className="option" key={index}>
              <input
                type="radio"
                name={"ques" + (num + 1)}
                id={"ques" + (num + 1) + "index" + index}
                className={
                  (isCorrectAnswer ? "correct" : "wrong") +
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
                    if (isCorrectAnswer) {
                      window.numCorrect++;
                      console.log(`✓ Đúng! Đáp án: ${index}`);
                    } else {
                      console.log(`✗ Sai! Chọn: ${index}, Đúng: ${questionData.answerIndex}`);
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
              {isCorrectAnswer ? (
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
  const [showResult, setShowResult] = useState(false);
  const [quizResult, setQuizResult] = useState(null);

  const navigate = useNavigate();

  const course = searchParams.get("topic");
  const weekNum = searchParams.get("week");
  const subtopicNum = searchParams.get("subtopic");
  const numQuestions = parseInt(searchParams.get("numQuestions")) || 5; // Mặc định 5 câu hỏi
  
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

  const pollQuizStatus = useCallback(async (jobId, maxAttempts = 120, interval = 2000) => {
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

          const normalizedQuestions = normalizeQuizData(jobData.result.questions);
          setQuestions(normalizedQuestions);
          
          // Lưu vào localStorage với key bao gồm số lượng câu hỏi
          const quizzes = JSON.parse(localStorage.getItem("quizzes")) || {};
          const cacheKey = `${weekNum}_${subtopicNum}_${numQuestions}`;
          quizzes[course] = quizzes[course] || {};
          quizzes[course][cacheKey] = normalizedQuestions;
          localStorage.setItem("quizzes", JSON.stringify(quizzes));
          
          window.numQues = normalizedQuestions.length;
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
  }, [course, weekNum, subtopicNum, numQuestions]);

  const fetchQuizWithPolling = useCallback(async () => {
    try {
      console.log("Đang tạo quiz job với", numQuestions, "câu hỏi...");
      axios.defaults.baseURL = API_CONFIG.baseURL;

      // Gọi API để tạo job
      const response = await axios({
        method: "POST",
        url: "/api/quiz",
        headers: {
          "Content-Type": "application/json",
        },
        data: { 
          course, 
          topic, 
          subtopic, 
          description,
          num_questions: numQuestions // Thêm số lượng câu hỏi
        },
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
  }, [course, topic, subtopic, description, numQuestions, pollQuizStatus]);

  useEffect(() => {
    console.log(course, topic, subtopic, description);
    if (!course || !topic || !subtopic || !description) return;
    
    const quizzes = JSON.parse(localStorage.getItem("quizzes")) || {};
    
    // Kiểm tra cache theo số lượng câu hỏi
    const cacheKey = `${weekNum}_${subtopicNum}_${numQuestions}`;
    
    if (
      quizzes[course] &&
      quizzes[course][cacheKey]
    ) {
      console.log("Tìm thấy quiz trong cache:", cacheKey);
      const normalizedQuestions = normalizeQuizData(quizzes[course][cacheKey]);
      setQuestions(normalizedQuestions);
      window.numQues = normalizedQuestions.length;
      setLoading(false);
      window.startTime = new Date().getTime();
      window.numAttmpt = 0;
      window.numCorrect = 0;
      return;
    }
    
    // Nếu chưa có quiz trong cache, tạo mới với polling
    fetchQuizWithPolling();
    
  }, [course, topic, subtopic, description, subtopicNum, weekNum, numQuestions, fetchQuizWithPolling]);

  const SubmitButton = () => {
    return (
      <div className="submit">
        <button
          className="SubmitButton"
          onClick={async () => {
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
            
            // 📊 LƯU DỮ LIỆU CHO ANALYTICS
            try {
              const score = (window.numCorrect * 100) / window.numQues;
              
              // Lưu kết quả quiz
              await saveQuizResult({
                topic: topic,
                subtopic: subtopic,
                score: score,
                totalQuestions: window.numQues,
                correctAnswers: window.numCorrect,
                timeSpent: Math.round(window.timeTaken / 1000), // seconds
              });
              
              // Lưu hoạt động học tập
              await saveLearningActivity({
                topic: topic,
                subtopic: subtopic,
                activityType: 'quiz',
                duration: Math.round(window.timeTaken / 1000), // seconds
                score: score,
              });
              
              console.log('✅ Đã lưu dữ liệu analytics cho quiz');
            } catch (error) {
              console.error('❌ Lỗi khi lưu analytics:', error);
            }
            
            // Hiển thị kết quả thay vì navigate ngay
            setQuizResult({
              numCorrect: window.numCorrect,
              numQues: window.numQues,
              timeTaken: window.timeTaken,
              percentage: ((window.numCorrect * 100) / window.numQues).toFixed(1)
            });
            setShowResult(true);
          }}
        >
          Nộp bài
        </button>
      </div>
    );
  };

  const ResultModal = () => {
    if (!showResult || !quizResult) return null;
    
    const isPassed = parseFloat(quizResult.percentage) >= 70;
    
    return (
      <div className="result-modal-overlay">
        <div className="result-modal">
          <div className={`result-icon ${isPassed ? 'passed' : 'failed'}`}>
            {isPassed ? '🎉' : '📚'}
          </div>
          <h2 className="result-title">
            {isPassed ? 'Xuất sắc!' : 'Cần cố gắng thêm!'}
          </h2>
          <div className="result-stats">
            <div className="stat-item">
              <span className="stat-label">Điểm số</span>
              <span className="stat-value">{quizResult.percentage}%</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Đúng</span>
              <span className="stat-value">{quizResult.numCorrect}/{quizResult.numQues}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Thời gian</span>
              <span className="stat-value">{(quizResult.timeTaken / 1000).toFixed(0)}s</span>
            </div>
          </div>
          <div className="result-actions">
            <button 
              className="btn-back-roadmap"
              onClick={() => navigate("/roadmap?topic=" + encodeURI(course))}
            >
              Quay về Roadmap
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="quiz_wrapper">
      <Header></Header>
      <Loader style={{ display: loading ? "block" : "none" }}>
        {loadingMessage}
      </Loader>
      <ResultModal />
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
