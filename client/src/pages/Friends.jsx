import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import api from "../services/api";
import NotificationBanner from "../components/NotificationBanner";
import translations from "../translations";

function Friends() {
  const language = localStorage.getItem("language") || "en";
  const t = translations[language];

  const [searchTerm, setSearchTerm] = useState("");
  const [students, setStudents] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);

  const [friendRequests, setFriendRequests] = useState([]);
  const [friends, setFriends] = useState([]);

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

  const fetchFriendRequests = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.get("/friends/requests", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setFriendRequests(response.data);
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  const fetchFriends = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.get("/friends", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setFriends(response.data);
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  useEffect(() => {
    fetchFriendRequests();
    fetchFriends();
  }, []);

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

  const handleAcceptFriendRequest = async (requestId) => {
    try {
      const token = localStorage.getItem("token");

      await api.post(
        `/friends/accept/${requestId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchFriendRequests();
      fetchFriends();

      showSuccessMessage(t.friendRequestAccepted);
    } catch (error) {
      console.log(error.response?.data || error.message);
      showErrorMessage(t.couldNotAcceptFriendRequest);
    }
  };

  const handleDeclineFriendRequest = async (requestId) => {
    try {
      const token = localStorage.getItem("token");

      await api.post(
        `/friends/decline/${requestId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchFriendRequests();

      showSuccessMessage(t.friendRequestDeclined);
    } catch (error) {
      console.log(error.response?.data || error.message);
      showErrorMessage(t.couldNotDeclineFriendRequest);
    }
  };

  const renderUserCard = (person) => {
    return (
      <div className="course-info">
        <div className="profile-avatar small-avatar">
          {person.profileImage ? (
            <img
              src={`http://localhost:5000${person.profileImage}`}
              alt={person.username}
              className="profile-avatar-image"
            />
          ) : (
            person.username.charAt(0).toUpperCase()
          )}
        </div>

        <div>
          <h3>{person.username}</h3>
          <p>{person.email}</p>

          {person.school && (
            <p>
              {t.school}: {person.school}
            </p>
          )}

          {person.program && (
            <p>
              {t.program}: {person.program}
            </p>
          )}

          {person.studyYear && (
            <p>
              {t.studyYear}: {t.year} {person.studyYear}
            </p>
          )}
        </div>
      </div>
    );
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
              {renderUserCard(student)}

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

          {friendRequests.length === 0 ? (
            <div className="empty-state">
              <h3>📩 {t.noFriendRequests}</h3>
              <p>{t.noFriendRequestsDescription}</p>
            </div>
          ) : (
            friendRequests.map((request) => (
              <div key={request._id} className="list-item">
                {renderUserCard(request.sender)}

                <div className="actions">
                  <button onClick={() => handleAcceptFriendRequest(request._id)}>
                    {t.accept}
                  </button>

                  <button
                    className="danger-button"
                    onClick={() => handleDeclineFriendRequest(request._id)}
                  >
                    {t.decline}
                  </button>
                </div>
              </div>
            ))
          )}
        </section>

        <section className="card">
          <h2>{t.yourFriends}</h2>

          {friends.length === 0 ? (
            <div className="empty-state">
              <h3>👥 {t.noFriendsYet}</h3>
              <p>{t.noFriendsYetDescription}</p>
            </div>
          ) : (
            friends.map((friend) => (
              <div key={friend._id} className="list-item">
                {renderUserCard(friend)}
              </div>
            ))
          )}
        </section>
      </main>
    </div>
  );
}

export default Friends;