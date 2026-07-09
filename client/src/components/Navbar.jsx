import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import translations from "../translations";
import api from "../services/api";
import socket from "../services/socket";

function Navbar({ user }) {
  const navigate = useNavigate();

  const language = localStorage.getItem("language") || "en";
  const t = translations[language];

  const [unreadTotal, setUnreadTotal] = useState(0);

  const fetchUnreadMessages = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        return;
      }

      const response = await api.get("/messages/unread", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const total = Object.values(response.data).reduce(
        (sum, count) => sum + count,
        0
      );

      setUnreadTotal(total);
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUnreadMessages();
    }
  }, [user]);

  useEffect(() => {
    const updateUnread = () => {
      fetchUnreadMessages();
    };

    socket.on("receiveMessage", updateUnread);

    window.addEventListener("unreadMessagesUpdated", updateUnread);

    return () => {
      socket.off("receiveMessage", updateUnread);
      window.removeEventListener("unreadMessagesUpdated", updateUnread);
    };
  }, []);

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
          <Link to="/chat">
            {t.chat}
            {unreadTotal > 0 && (
              <span className="unread-badge navbar-unread-badge">
                {unreadTotal}
              </span>
            )}
          </Link>{" "}
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