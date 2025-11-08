import { NavLink } from "react-router-dom";
import "./header.css";
import { CircleUser, Home, Database } from "lucide-react";
import { translateLocalStorage } from "../../translate/translate";

const Header = () => {
  return (
    <header>
      <img src="logo.png" alt="LearnX" height={40} className="logo" />
      <NavLink to="/" className={"Home"}>
        <Home size={40} strokeWidth={1} color="white"></Home>
      </NavLink>
      <NavLink to="/resources" className={"Resources"} title="Tài nguyên đã lưu">
        <Database size={40} strokeWidth={1} color="white"></Database>
      </NavLink>
      <NavLink to="/profile" className={"ProfileAvatar"}>
        <CircleUser size={50} strokeWidth={1} color="white"></CircleUser>
      </NavLink>
    </header>
  );
};

export default Header;
