import React, { useState } from 'react';
import { User } from 'lucide-react';
import './welcomeModal.css';

const WelcomeModal = ({ onSubmit }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (username.trim().length < 2) {
      setError('Tên người dùng phải có ít nhất 2 ký tự');
      return;
    }

    if (username.trim().length > 30) {
      setError('Tên người dùng không được quá 30 ký tự');
      return;
    }

    onSubmit(username.trim());
  };

  return (
    <div className="welcome-modal-overlay">
      <div className="welcome-modal-content">
        <div className="welcome-modal-icon">
          <User size={80} strokeWidth={1.5} />
        </div>
        
        <h1 className="welcome-modal-title">Chào mừng đến với AI Learning Platform!</h1>
        <p className="welcome-modal-subtitle">Hãy cho chúng tôi biết tên của bạn để bắt đầu</p>
        
        <form onSubmit={handleSubmit} className="welcome-modal-form">
          <div className="welcome-modal-input-group">
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError('');
              }}
              placeholder="Nhập tên của bạn..."
              className="welcome-modal-input"
              autoFocus
              maxLength={30}
            />
            {error && <p className="welcome-modal-error">{error}</p>}
          </div>
          
          <button type="submit" className="welcome-modal-button">
            Bắt đầu học tập
          </button>
        </form>
      </div>
    </div>
  );
};

export default WelcomeModal;
