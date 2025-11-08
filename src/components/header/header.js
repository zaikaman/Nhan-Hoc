import { NavLink } from "react-router-dom";
import "./header.css";
import { CircleUser, Home, Database } from "lucide-react";

const Header = () => {
  return (
    <header>
      <div className="logo-container">
        <img src={`${process.env.PUBLIC_URL}/logo.png`} alt="Nhàn Học" height={40} className="logo" />
        <span className="logo-text">Nhàn Học</span>
      </div>
      <div className="nav-icons">
        <NavLink to="/" className={"Home"} title="Trang chủ">
          <Home size={35} strokeWidth={1.5} color="white"></Home>
        </NavLink>
        <NavLink to="/resources" className={"Resources"} title="Tài nguyên đã lưu">
          <Database size={35} strokeWidth={1.5} color="white"></Database>
        </NavLink>
        <NavLink to="/profile" className={"ProfileAvatar"} title="Hồ sơ">
          <CircleUser size={40} strokeWidth={1.5} color="white"></CircleUser>
        </NavLink>
      </div>
    </header>
  );
};

export default Header;
