import { Link, useNavigate } from "react-router-dom";
import translations from "../translations";

function Navbar({ user }) {
  const navigate = useNavigate();

  const language = localStorage.getItem("language") || "en";
  const t = translations[language];

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav>
      {user && (
        <>
          <Link to="/">{t.home}</Link>{" "}
          <Link to="/courses">{t.courses}</Link>{" "}
          <Link to="/notes">{t.notes}</Link>{" "}
          <Link to="/tasks">{t.tasks}</Link>{" "}
          <Link to="/calendar">{t.calendar}</Link>{" "}
          <Link to="/grades">{t.grades}</Link>{" "}
          <Link to="/friends">{t.friends}</Link>{" "}
          <Link to="/profile">{t.profile}</Link>{" "}
        </>
      )}

      {!user && (
        <>
          <Link to="/login">{t.login}</Link>{" "}
          <Link to="/register">{t.register}</Link>{" "}
        </>
      )}
    </nav>
  );
}

export default Navbar;