import { NavLink } from "react-router-dom";
import "./header.css";
import { Database, MessageCircle, BarChart3, Target, FileText } from "lucide-react";

const Header = ({ chatStyle = false }) => {
  return (
    <header className={chatStyle ? "chat-header-style" : ""}>
      <NavLink to="/" className="logo-link">
        <div className="logo-container">
          <img src={`${process.env.PUBLIC_URL}/logo.png`} alt="Nhàn Học" height={100} width={100} className="logo" />
          <span className="logo-text">Nhàn Học</span>
        </div>
      </NavLink>
      <div className="nav-icons">
        <NavLink to="/recommendations" className={"Recommendations"} title="Gợi ý cá nhân hóa">
          <Target size={35} strokeWidth={1.5} color="white"></Target>
        </NavLink>
        <NavLink to="/pdf-analysis" className={"PDFAnalysis"} title="Phân tích tài liệu">
          <FileText size={35} strokeWidth={1.5} color="white"></FileText>
        </NavLink>
        <NavLink to="/analytics" className={"Analytics"} title="Learning Analytics">
          <BarChart3 size={35} strokeWidth={1.5} color="white"></BarChart3>
        </NavLink>
        <NavLink to="/chat" className={"ChatBot"} title="Trợ lý AI">
          <MessageCircle size={35} strokeWidth={1.5} color="white"></MessageCircle>
        </NavLink>
        <NavLink to="/resources" className={"Resources"} title="Tài nguyên đã lưu">
          <Database size={35} strokeWidth={1.5} color="white"></Database>
        </NavLink>
      </div>
    </header>
  );
};

export default Header;
