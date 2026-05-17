import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Profile() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.get("/auth/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(response.data);
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleProfilePicture = () => {
    alert("Profile picture upload will be added later.");
  };

  const handleChangePassword = () => {
    alert("Change password will be added later.");
  };

  const handleDeleteAccount = () => {
    alert("Delete account will be added later.");
  };

  return (
    <div>
      <Navbar user={true} />

      <main className="page">
        <section className="page-header">
          <h1>Profile</h1>
          <p>Your Studora account settings and information.</p>
        </section>

        {user && (
          <section className="card profile-card">
            <div className="profile-avatar">
              {user.username.charAt(0).toUpperCase()}
            </div>

            <h2>{user.username}</h2>
            <p>{user.email}</p>

            <button onClick={handleProfilePicture}>
              Add Profile Picture
            </button>
          </section>
        )}

        <section className="card">
          <h2>Account Information</h2>

          {user && (
            <div className="profile-info">
              <div className="profile-item">
                <h3>Username</h3>
                <p>{user.username}</p>
              </div>

              <div className="profile-item">
                <h3>Email</h3>
                <p>{user.email}</p>
              </div>

              <div className="profile-item">
                <h3>Theme</h3>
                <p>
                  {localStorage.getItem("theme") === "dark"
                    ? "Dark Mode"
                    : "Light Mode"}
                </p>
              </div>
            </div>
          )}
        </section>

        <section className="card">
          <h2>Settings</h2>

          <div className="profile-actions">
            <button onClick={handleChangePassword}>
              Change Password
            </button>

            <button className="secondary-button">
              Notification Settings
            </button>

            <button className="secondary-button">
              Study Statistics
            </button>

            <button className="secondary-button" onClick={handleLogout}>
              Logout
            </button>

            <button className="danger-button" onClick={handleDeleteAccount}>
              Delete Account
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Profile;