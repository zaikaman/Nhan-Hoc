import { useState } from "react";
import Modal from "../modal/modal";
import "./quizConfigModal.css";

const QuizConfigModal = ({ open, onClose, onStart, subtopicName }) => {
  const [soLuongCauHoi, setSoLuongCauHoi] = useState(5);

  const handleStart = () => {
    onStart(soLuongCauHoi);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="quiz-config-modal">
        <h2 className="config-title">Cấu hình bài kiểm tra</h2>
        <p className="config-subtitle">{subtopicName}</p>
        
        <div className="config-section">
          <label htmlFor="soLuongCauHoi" className="config-label">
            Số lượng câu hỏi:
          </label>
          <div className="input-with-buttons">
            <button 
              className="adjust-btn"
              onClick={() => setSoLuongCauHoi(Math.max(1, soLuongCauHoi - 1))}
              disabled={soLuongCauHoi <= 1}
            >
              -
            </button>
            <input
              type="number"
              id="soLuongCauHoi"
              className="config-input"
              value={soLuongCauHoi}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (value >= 1 && value <= 20) {
                  setSoLuongCauHoi(value);
                }
              }}
              min="1"
              max="20"
            />
            <button 
              className="adjust-btn"
              onClick={() => setSoLuongCauHoi(Math.min(20, soLuongCauHoi + 1))}
              disabled={soLuongCauHoi >= 20}
            >
              +
            </button>
          </div>
          <p className="config-hint">Tối thiểu: 1, Tối đa: 20 câu hỏi</p>
        </div>

        <div className="quick-select">
          <p className="quick-select-label">Chọn nhanh:</p>
          <div className="quick-select-buttons">
            <button 
              className={`quick-btn ${soLuongCauHoi === 5 ? 'active' : ''}`}
              onClick={() => setSoLuongCauHoi(5)}
            >
              5 câu
            </button>
            <button 
              className={`quick-btn ${soLuongCauHoi === 10 ? 'active' : ''}`}
              onClick={() => setSoLuongCauHoi(10)}
            >
              10 câu
            </button>
            <button 
              className={`quick-btn ${soLuongCauHoi === 15 ? 'active' : ''}`}
              onClick={() => setSoLuongCauHoi(15)}
            >
              15 câu
            </button>
            <button 
              className={`quick-btn ${soLuongCauHoi === 20 ? 'active' : ''}`}
              onClick={() => setSoLuongCauHoi(20)}
            >
              20 câu
            </button>
          </div>
        </div>

        <div className="config-actions">
          <button className="btn-cancel" onClick={onClose}>
            Hủy
          </button>
          <button className="btn-start" onClick={handleStart}>
            Bắt đầu kiểm tra
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default QuizConfigModal;
