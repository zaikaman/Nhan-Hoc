import { NavLink } from "react-router-dom";
import "./header.css";
import { Database } from "lucide-react";

const Header = () => {
  return (
    <header>
      <NavLink to="/" className="logo-link">
        <div className="logo-container">
          <img src={`${process.env.PUBLIC_URL}/logo.png`} alt="Nhàn Học" height={100} width={100} className="logo" />
          <span className="logo-text">Nhàn Học</span>
        </div>
      </NavLink>
      <div className="nav-icons">
        <NavLink to="/resources" className={"Resources"} title="Tài nguyên đã lưu">
          <Database size={35} strokeWidth={1.5} color="white"></Database>
        </NavLink>
      </div>
    </header>
  );
};

export default Header;
