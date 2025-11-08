import React, { useState } from 'react';
import { FileText, Upload, Download, Loader, AlertCircle, CheckCircle } from 'lucide-react';
import './pdfAnalysis.css';
import Header from '../../components/header/header';
import API_CONFIG from '../../config/api';

const PDFAnalysis = () => {
  const [file, setFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [error, setError] = useState('');
  const [resultPdfUrl, setResultPdfUrl] = useState(null);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        setError('');
        setAnalysisComplete(false);
        setResultPdfUrl(null);
      } else {
        setError('Vui lòng chọn file PDF');
        setFile(null);
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile);
      setError('');
      setAnalysisComplete(false);
      setResultPdfUrl(null);
    } else {
      setError('Vui lòng kéo thả file PDF');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const analyzeFile = async () => {
    if (!file) {
      setError('Vui lòng chọn file PDF trước');
      return;
    }

    setIsAnalyzing(true);
    setError('');
    setProgress(0);
    setProgressMessage('Đang chuẩn bị...');

    const formData = new FormData();
    formData.append('file', file);

    // Bắt đầu chạy progress bar giả
    const progressMessages = [
      { start: 0, end: 10, message: 'Đang đọc file PDF...' },
      { start: 10, end: 20, message: 'Đang trích xuất nội dung...' },
      { start: 20, end: 30, message: 'Đang gửi dữ liệu đến AI...' },
      { start: 30, end: 45, message: 'Đang phân tích nội dung...' },
      { start: 45, end: 60, message: 'AI đang xử lý tài liệu...' },
      { start: 60, end: 70, message: 'Đang tạo cấu trúc flashcard...' },
      { start: 70, end: 80, message: 'Đang phân tích thuật ngữ...' },
      { start: 80, end: 90, message: 'Đang tạo câu hỏi tự đánh giá...' },
      { start: 90, end: 99, message: 'Đang render PDF...' },
    ];

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 1;
        
        // Tìm message phù hợp với progress hiện tại
        const currentMessageObj = progressMessages.find(pm => newProgress >= pm.start && newProgress < pm.end);
        
        if (currentMessageObj) {
          setProgressMessage(currentMessageObj.message);
        }
        
        // Dừng ở 99%
        if (newProgress >= 99) {
          clearInterval(progressInterval);
          setProgressMessage('Đang hoàn thiện...');
          return 99;
        }
        
        return newProgress;
      });
    }, 100); // Tăng 1% mỗi 100ms = 10 giây để đến 99%

    try {
      const response = await fetch(`${API_CONFIG.baseURL}/api/analyze-pdf`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        clearInterval(progressInterval);
        const errorData = await response.json();
        throw new Error(errorData.error || 'Có lỗi xảy ra khi phân tích PDF');
      }

      // Nhận job_id từ response
      const { job_id, status, message } = await response.json();
      console.log(`[PDF Analysis] Job đã tạo - ID: ${job_id}, Status: ${status}`);
      console.log(`[PDF Analysis] ${message}`);

      // Polling để kiểm tra trạng thái
      await pollPdfStatus(job_id, progressInterval);

    } catch (err) {
      console.error('Error analyzing PDF:', err);
      clearInterval(progressInterval);
      setError(err.message || 'Có lỗi xảy ra khi phân tích PDF');
      setIsAnalyzing(false);
    }
  };

  // Hàm polling để kiểm tra trạng thái PDF job
  const pollPdfStatus = async (jobId, progressInterval, maxAttempts = 120, interval = 1000) => {
    let attempts = 0;

    const checkStatus = async () => {
      try {
        attempts++;
        console.log(`[PDF Polling] Lần thử ${attempts}/${maxAttempts} - Job ID: ${jobId}`);

        const response = await fetch(`${API_CONFIG.baseURL}/api/analyze-pdf/status/${jobId}`);
        
        if (!response.ok) {
          throw new Error('Không thể kiểm tra trạng thái');
        }

        const jobData = await response.json();
        console.log(`[PDF Polling] Trạng thái: ${jobData.status}`);

        if (jobData.status === 'completed') {
          console.log('[PDF Polling] ✅ Hoàn thành!');

          // Dừng progress giả và nhảy lên 100%
          clearInterval(progressInterval);
          setProgress(100);
          setProgressMessage('Hoàn thành!');

          // Decode base64 PDF content
          const pdfBase64 = jobData.result.pdf_content;
          const pdfBinary = atob(pdfBase64);
          const pdfArray = new Uint8Array(pdfBinary.length);
          for (let i = 0; i < pdfBinary.length; i++) {
            pdfArray[i] = pdfBinary.charCodeAt(i);
          }
          
          const blob = new Blob([pdfArray], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);
          
          setResultPdfUrl(url);
          setAnalysisComplete(true);
          setIsAnalyzing(false);
          return true;
        }
        else if (jobData.status === 'failed') {
          console.error('[PDF Polling] ❌ Lỗi:', jobData.error);
          
          clearInterval(progressInterval);
          setError(jobData.error || 'Có lỗi xảy ra khi phân tích PDF');
          setIsAnalyzing(false);
          return true;
        }
        else if (attempts >= maxAttempts) {
          console.error('[PDF Polling] ⏱️ Timeout');
          
          clearInterval(progressInterval);
          setError('Quá trình phân tích mất quá nhiều thời gian. Vui lòng thử lại sau.');
          setIsAnalyzing(false);
          return true;
        }

        // Tiếp tục polling
        setTimeout(checkStatus, interval);
        return false;

      } catch (error) {
        console.error('[PDF Polling] Lỗi khi kiểm tra trạng thái:', error);

        if (attempts >= maxAttempts) {
          clearInterval(progressInterval);
          setError('Không thể kết nối đến server. Vui lòng kiểm tra kết nối và thử lại.');
          setIsAnalyzing(false);
          return true;
        }

        setTimeout(checkStatus, interval);
        return false;
      }
    };

    await checkStatus();
  };

  const downloadResult = () => {
    if (resultPdfUrl) {
      const link = document.createElement('a');
      link.href = resultPdfUrl;
      link.download = `phan_tich_${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const resetAnalysis = () => {
    setFile(null);
    setAnalysisComplete(false);
    setResultPdfUrl(null);
    setError('');
    setProgress(0);
    setProgressMessage('');
  };

  return (
    <div className="pdf-analysis-container">
      <Header />
      
      <div className="pdf-analysis-content">
        <div className="pdf-analysis-header">
          <FileText size={48} className="header-icon" />
          <h1>Phân tích Tài liệu Học thuật</h1>
          <p className="subtitle">
            Upload file PDF để AI phân tích và tạo flashcard học tập chi tiết
          </p>
        </div>

        <div className="pdf-analysis-main">
          {!analysisComplete ? (
            <>
              <div 
                className={`upload-zone ${file ? 'has-file' : ''}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <input
                  type="file"
                  id="pdf-upload"
                  accept=".pdf"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                
                {!file ? (
                  <label htmlFor="pdf-upload" className="upload-label">
                    <Upload size={64} className="upload-icon" />
                    <h3>Kéo thả file PDF vào đây</h3>
                    <p>hoặc click để chọn file</p>
                    <span className="file-info">Chỉ chấp nhận file PDF</span>
                  </label>
                ) : (
                  <div className="file-selected">
                    <FileText size={48} className="file-icon" />
                    <div className="file-details">
                      <h3>{file.name}</h3>
                      <p>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button 
                      className="change-file-btn"
                      onClick={resetAnalysis}
                    >
                      Đổi file
                    </button>
                  </div>
                )}
              </div>

              {error && (
                <div className="error-message">
                  <AlertCircle size={20} />
                  <span>{error}</span>
                </div>
              )}

              {isAnalyzing && (
                <div className="analyzing-status">
                  <Loader size={24} className="spinner" />
                  <div className="progress-info">
                    <p>{progressMessage || 'Đang phân tích tài liệu...'}</p>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <span className="progress-text">{progress}%</span>
                  </div>
                </div>
              )}

              <button
                className="analyze-btn"
                onClick={analyzeFile}
                disabled={!file || isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <Loader size={20} className="spinner" />
                    Đang phân tích...
                  </>
                ) : (
                  <>
                    <FileText size={20} />
                    Phân tích PDF
                  </>
                )}
              </button>

              <div className="features-info">
                <h3>Flashcard sẽ bao gồm:</h3>
                <div className="features-grid">
                  <div className="feature-item">
                    <CheckCircle size={20} />
                    <span>Tóm tắt tổng quan</span>
                  </div>
                  <div className="feature-item">
                    <CheckCircle size={20} />
                    <span>Mục tiêu học tập</span>
                  </div>
                  <div className="feature-item">
                    <CheckCircle size={20} />
                    <span>Thuật ngữ & định nghĩa</span>
                  </div>
                  <div className="feature-item">
                    <CheckCircle size={20} />
                    <span>Phát hiện chính</span>
                  </div>
                  <div className="feature-item">
                    <CheckCircle size={20} />
                    <span>Phương pháp nghiên cứu</span>
                  </div>
                  <div className="feature-item">
                    <CheckCircle size={20} />
                    <span>Ứng dụng thực tế</span>
                  </div>
                  <div className="feature-item">
                    <CheckCircle size={20} />
                    <span>Câu hỏi tư duy phê phán</span>
                  </div>
                  <div className="feature-item">
                    <CheckCircle size={20} />
                    <span>Bản đồ tư duy</span>
                  </div>
                  <div className="feature-item">
                    <CheckCircle size={20} />
                    <span>Câu hỏi tự đánh giá</span>
                  </div>
                  <div className="feature-item">
                    <CheckCircle size={20} />
                    <span>Mẹo học tập</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="analysis-complete">
              <div className="success-icon">
                <CheckCircle size={64} />
              </div>
              <h2>Phân tích hoàn tất!</h2>
              <p>Flashcard học tập đã được tạo thành công</p>
              
              <div className="result-actions">
                <button 
                  className="download-btn"
                  onClick={downloadResult}
                >
                  <Download size={20} />
                  Tải về PDF
                </button>
                
                <button 
                  className="new-analysis-btn"
                  onClick={resetAnalysis}
                >
                  <Upload size={20} />
                  Phân tích file mới
                </button>
              </div>

              <div className="result-info">
                <p className="info-text">
                  [*] Flashcard đã được tạo với đầy đủ nội dung phân tích chi tiết
                </p>
                <p className="info-text">
                  [*] Sử dụng flashcard để ôn tập và ghi nhớ kiến thức hiệu quả
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PDFAnalysis;
