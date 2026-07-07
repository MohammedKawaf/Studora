import Navbar from "../components/Navbar";
import { useState } from "react";
import api from "../services/api";
import NotificationBanner from "../components/NotificationBanner";
import translations from "../translations";

function Friends() {
  const language = localStorage.getItem("language") || "en";
  const t = translations[language];

  const [searchTerm, setSearchTerm] = useState("");
  const [students, setStudents] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setErrorMessage("");

    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  };

  const showErrorMessage = (message) => {
    setErrorMessage(message);
    setSuccessMessage("");

    setTimeout(() => {
      setErrorMessage("");
    }, 3000);
  };

  const handleSearchStudents = async (e) => {
    const value = e.target.value;

    setSearchTerm(value);

    if (!value.trim()) {
      setStudents([]);
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await api.get(`/friends/search?search=${value}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setStudents(response.data);
    } catch (error) {
      console.log(error.response?.data || error.message);
      showErrorMessage(t.couldNotSearchStudents);
    }
  };

  const handleSendFriendRequest = async (receiverId) => {
    try {
      const token = localStorage.getItem("token");

      await api.post(
        "/friends/request",
        {
          receiverId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSentRequests([...sentRequests, receiverId]);
      showSuccessMessage(t.friendRequestSent);
    } catch (error) {
      console.log(error.response?.data || error.message);

      showErrorMessage(
        error.response?.data?.message || t.couldNotSendFriendRequest
      );
    }
  };

  return (
    <div>
      <Navbar user={true} />

      <main className="page">
        <section className="page-header">
          <h1>{t.friends}</h1>
          <p>{t.friendsSubtitle}</p>
        </section>

        <NotificationBanner
          successMessage={successMessage}
          errorMessage={errorMessage}
        />

        <section className="card">
          <h2>{t.searchStudents}</h2>

          <input
            type="text"
            placeholder={t.searchStudentsPlaceholder}
            value={searchTerm}
            onChange={handleSearchStudents}
            className="search-input"
          />

          {students.length === 0 && searchTerm.trim() && (
            <div className="empty-state">
              <h3>🔍 {t.noStudentsFound}</h3>
              <p>{t.tryAnotherSearch}</p>
            </div>
          )}

          {students.map((student) => (
            <div key={student._id} className="list-item">
              <div className="course-info">
                <div className="profile-avatar small-avatar">
                  {student.profileImage ? (
                    <img
                      src={`http://localhost:5000${student.profileImage}`}
                      alt={student.username}
                      className="profile-avatar-image"
                    />
                  ) : (
                    student.username.charAt(0).toUpperCase()
                  )}
                </div>

                <div>
                  <h3>{student.username}</h3>
                  <p>{student.email}</p>

                  {student.school && (
                    <p>
                      {t.school}: {student.school}
                    </p>
                  )}

                  {student.program && (
                    <p>
                      {t.program}: {student.program}
                    </p>
                  )}

                  {student.studyYear && (
                    <p>
                      {t.studyYear}: {t.year} {student.studyYear}
                    </p>
                  )}
                </div>
              </div>

              <div className="actions">
                <button
                  disabled={sentRequests.includes(student._id)}
                  onClick={() => handleSendFriendRequest(student._id)}
                >
                  {sentRequests.includes(student._id)
                    ? t.requestSent
                    : t.addFriend}
                </button>
              </div>
            </div>
          ))}
        </section>

        <section className="card">
          <h2>{t.friendRequests}</h2>
          <p>{t.incomingFriendRequestsPlaceholder}</p>
        </section>

        <section className="card">
          <h2>{t.yourFriends}</h2>
          <p>{t.friendsListPlaceholder}</p>
        </section>
      </main>
    </div>
  );
}

export default Friends;