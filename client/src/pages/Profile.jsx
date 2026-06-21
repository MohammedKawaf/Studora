import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import NotificationBanner from "../components/NotificationBanner";
import ConfirmModal from "../components/ConfirmModal";

function Profile() {
  const [user, setUser] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [deleteEmail, setDeleteEmail] = useState("");
  const [deletePassword, setDeletePassword] = useState("");

  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState("");

  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [deleteAccountError, setDeleteAccountError] = useState("");

  const [isEditingAcademicInfo, setIsEditingAcademicInfo] = useState(false);
  const [school, setSchool] = useState("");
  const [program, setProgram] = useState("");
  const [studyYear, setStudyYear] = useState("");

  const [showProfilePictureModal, setShowProfilePictureModal] = useState(false);
  const [profilePicturePreview, setProfilePicturePreview] = useState("");
  const [profilePictureFile, setProfilePictureFile] = useState(null);

  const [showNotificationSettingsModal, setShowNotificationSettingsModal] =
    useState(false);

  const [notificationSettings, setNotificationSettings] = useState(() => {
    const savedSettings = localStorage.getItem("notificationSettings");

    return savedSettings
      ? JSON.parse(savedSettings)
      : {
          taskReminders: true,
          calendarReminders: true,
          gradeNotifications: false,
          weeklySummary: true,
        };
  });  

  const [creditGoal, setCreditGoal] = useState(() => {
    return localStorage.getItem("creditGoal") || "180";
  });

  const navigate = useNavigate();

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

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.get("/auth/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(response.data);
      setSchool(response.data.school || "");
      setProgram(response.data.program || "");
      setStudyYear(response.data.studyYear || "");
    } catch (error) {
      console.log(error.response?.data || error.message);
      showErrorMessage("Could not load profile");
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleCreditGoalChange = (e) => {
    const selectedGoal = e.target.value;

    setCreditGoal(selectedGoal);
    localStorage.setItem("creditGoal", selectedGoal);

    showSuccessMessage("Study program goal updated successfully");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleProfilePicture = () => {
    setShowProfilePictureModal(true);
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];

    if (!file) {
      return;
    }

    setProfilePictureFile(file);
    setProfilePicturePreview(URL.createObjectURL(file));
  };

  const handleChangePassword = () => {
    showErrorMessage("Change password will be added later");
  };

  const handleNotificationSettings = () => {
    setShowNotificationSettingsModal(true);
  };

  const handleNotificationSettingChange = (settingName) => {
    setNotificationSettings((prevSettings) => ({
      ...prevSettings,
      [settingName]: !prevSettings[settingName],
    }));
  };

  const handleSaveNotificationSettings = () => {
    localStorage.setItem(
      "notificationSettings",
      JSON.stringify(notificationSettings)
    );

    setShowNotificationSettingsModal(false);
    showSuccessMessage("Notification settings updated successfully");
  };

  const handleDeleteAccountConfirm = async () => {
    if (!deleteEmail.trim() || !deletePassword.trim()) {
      setDeleteAccountError("Please enter your email and password to confirm");
      return;
    }

    if (
      user &&
      deleteEmail.trim().toLowerCase() !== user.email.toLowerCase()
    ) {
      setDeleteAccountError("Email does not match your account email");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await api.delete(
        "/auth/delete-account",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: {
            email: deleteEmail,
            password: deletePassword,
          },
        }
      );

      localStorage.removeItem("token");

      setShowDeleteAccountModal(false);

      setDeleteEmail("");
      setDeletePassword("");

      showSuccessMessage(response.data.message);

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      console.log(error.response?.data || error.message);

      setDeleteAccountError(
        error.response?.data?.message ||
          "Could not delete account"
      );
    }
  };

  const handleChangeUsername = async () => {
    if (!newUsername.trim()) {
      showErrorMessage("Please enter a username");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await api.put(
        "/auth/profile",
        {
          username: newUsername.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUser({
        ...user,
        username: newUsername.trim(),
      });

      setIsEditingUsername(false);
      setNewUsername("");

      showSuccessMessage("Username updated successfully");
    } catch (error) {
      console.log(error.response?.data || error.message);
      showErrorMessage("Could not update username");
    }
  };

  const handleChangePasswordSubmit = async () => {
    if (
      !currentPassword.trim() ||
      !newPassword.trim() ||
      !confirmPassword.trim()
    ) {
      showErrorMessage("Please fill in all password fields");
      return;
    }

    if (newPassword.length < 6) {
      showErrorMessage("New password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      showErrorMessage("New passwords do not match");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await api.put(
        "/auth/change-password",
        {
          currentPassword,
          newPassword,
          confirmPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setShowPasswordModal(false);

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      showSuccessMessage(response.data.message);
    } catch (error) {
      console.log(error.response?.data || error.message);

      showErrorMessage(
        error.response?.data?.message ||
          "Could not update password"
      );
    }
  };

  const handleUpdateAcademicInfo = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.put(
        "/auth/profile",
        {
          school,
          program,
          studyYear,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUser(response.data);
      setIsEditingAcademicInfo(false);

      showSuccessMessage("Academic information updated successfully");
    } catch (error) {
      console.log(error.response?.data || error.message);
      showErrorMessage("Could not update academic information");
    }
  };

  const handleSaveProfilePicture = async () => {
    if (!profilePictureFile) {
      showErrorMessage("Please select an image");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();

      formData.append(
        "profileImage",
        profilePictureFile
      );

      const response = await api.post(
        "/auth/upload-profile-image",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setUser({
        ...user,
        profileImage: response.data.profileImage,
      });

      setShowProfilePictureModal(false);

      showSuccessMessage(
        "Profile image uploaded successfully"
      );
    } catch (error) {
      console.log(error.response?.data || error.message);

      showErrorMessage(
        "Could not upload profile image"
      );
    }
  };

  const handleRemoveProfileImage = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.delete("/auth/remove-profile-image", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser({
        ...user,
        profileImage: response.data.profileImage,
      });

      showSuccessMessage("Profile image removed successfully");
    } catch (error) {
      console.log(error.response?.data || error.message);
      showErrorMessage("Could not remove profile image");
    }
  };

  return (
    <div>
      <Navbar user={true} />

      <main className="page">
        <section className="page-header">
          <h1>Profile</h1>
          <p>Your Studora account settings and information.</p>
        </section>

        <NotificationBanner
          successMessage={successMessage}
          errorMessage={errorMessage}
        />

        {user && (
          <section className="card profile-card">
            <div className="profile-avatar">
              {user.profileImage ? (
                <img
                  src={`http://localhost:5000${user.profileImage}`}
                  alt="Profile"
                  className="profile-avatar-image"
                />
              ) : (
                user.username.charAt(0).toUpperCase()
              )}
            </div>

            <h2>{user.username}</h2>
            <p>{user.email}</p>

            <div className="actions" style={{ justifyContent: "center" }}>
              <button onClick={handleProfilePicture}>
                {user.profileImage ? "Change Profile Picture" : "Add Profile Picture"}
              </button>

              {user.profileImage && (
                <button
                  className="danger-button"
                  onClick={handleRemoveProfileImage}
                >
                  Remove Picture
                </button>
              )}
            </div>
          </section>
        )}

        <section className="card">
          <h2>Account Information</h2>

          {user && (
            <div className="profile-info">
              <div className="profile-item profile-item-row">
                <div>
                  <h3>Username</h3>

                  {isEditingUsername ? (
                    <div className="username-edit">
                      <input
                        type="text"
                        placeholder="New username"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                      />

                      <div className="actions">
                        <button onClick={handleChangeUsername}>
                          Save
                        </button>

                        <button
                          className="secondary-button"
                          onClick={() => {
                            setIsEditingUsername(false);
                            setNewUsername("");
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p>{user.username}</p>
                  )}
                </div>

                {!isEditingUsername && (
                  <button
                    className="secondary-button"
                    onClick={() => setIsEditingUsername(true)}
                  >
                    Change Username
                  </button>
                )}
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
          <div className="section-header">
            <h2>Academic Information</h2>

            {!isEditingAcademicInfo && (
              <button
                className="secondary-button"
                onClick={() => setIsEditingAcademicInfo(true)}
              >
                Edit
              </button>
            )}
          </div>

          {user && (
            <div className="profile-info">
              {isEditingAcademicInfo ? (
                <div className="username-edit">
                  <input
                    type="text"
                    placeholder="School"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                  />

                  <input
                    type="text"
                    placeholder="Program"
                    value={program}
                    onChange={(e) => setProgram(e.target.value)}
                  />

                  <select
                    value={studyYear}
                    onChange={(e) => setStudyYear(e.target.value)}
                  >
                    <option value="">Select study year</option>
                    <option value="1">Year 1</option>
                    <option value="2">Year 2</option>
                    <option value="3">Year 3</option>
                    <option value="4">Year 4</option>
                    <option value="5">Year 5</option>
                    <option value="6">Year 6</option>
                  </select>

                  <div className="actions">
                    <button onClick={handleUpdateAcademicInfo}>Save</button>

                    <button
                      className="secondary-button"
                      onClick={() => {
                        setIsEditingAcademicInfo(false);
                        setSchool(user.school || "");
                        setProgram(user.program || "");
                        setStudyYear(user.studyYear || "");
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="profile-item">
                    <h3>School</h3>
                    <p>{user.school || "Not added yet"}</p>
                  </div>

                  <div className="profile-item">
                    <h3>Program</h3>
                    <p>{user.program || "Not added yet"}</p>
                  </div>

                  <div className="profile-item profile-item-row">
                    <div>
                      <h3>Study Year</h3>
                      <p>{user.studyYear ? `Year ${user.studyYear}` : "Not added yet"}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </section>

        <section className="card">
          <h2>Study Program Settings</h2>

          <div className="profile-info">
            <div className="profile-item">
              <h3>Degree Length</h3>
              <p>Choose how many credits your study program includes.</p>

              <select value={creditGoal} onChange={handleCreditGoalChange}>
                <option value="60">1 Year (60 hp)</option>
                <option value="90">1.5 Years (90 hp)</option>
                <option value="120">2 Years (120 hp)</option>
                <option value="150">2.5 Years (150 hp)</option>
                <option value="180">3 Years (180 hp)</option>
                <option value="210">3.5 Years (210 hp)</option>
                <option value="240">4 Years (240 hp)</option>
                <option value="270">4.5 Years (270 hp)</option>
                <option value="300">5 Years (300 hp)</option>
                <option value="330">5.5 Years (330 hp)</option>
                <option value="360">6 Years (360 hp)</option>
              </select>
            </div>
          </div>
        </section>

        <section className="card">
          <h2>Settings</h2>

          <div className="profile-actions">
            <button onClick={() => setShowPasswordModal(true)}>
              Change Password
            </button>

            <button
              className="secondary-button"
              onClick={handleNotificationSettings}
            >
              Notification Settings
            </button>

            <button
              className="secondary-button"
              onClick={() => setShowLogoutModal(true)}
            >
              Logout
            </button>

            <button
              className="danger-button"
              onClick={() => {
                setDeleteAccountError("");
                setShowDeleteAccountModal(true);
              }}
            >
              Delete Account
            </button>
          </div>
        </section>

        <ConfirmModal
          isOpen={showLogoutModal}
          title="Log out?"
          message="Are you sure you want to log out?"
          onCancel={() => setShowLogoutModal(false)}
          onConfirm={handleLogout}
        />

        {showDeleteAccountModal && (
          <div className="modal-overlay">
            <div className="modal confirm-modal">
              <h2>Delete account?</h2>

              <p>
                Are you sure you want to delete your account? This action cannot
                be undone. For extra security, enter your email and password to
                confirm.
              </p>

              {deleteAccountError && (
                <div className="error-banner">
                  {deleteAccountError}
                </div>
              )}

              <div className="form">
                <input
                  type="email"
                  placeholder="Confirm email"
                  value={deleteEmail}
                  onChange={(e) => setDeleteEmail(e.target.value)}
                />

                <input
                  type="password"
                  placeholder="Confirm password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                />
              </div>

              <div className="confirm-modal-actions">
                <button
                  className="secondary-button"
                  onClick={() => {
                    setShowDeleteAccountModal(false);
                    setDeleteEmail("");
                    setDeletePassword("");
                    setDeleteAccountError("");
                  }}
                >
                  Cancel
                </button>

                <button
                  className="danger-button"
                  onClick={handleDeleteAccountConfirm}
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )}

        {showNotificationSettingsModal && (
          <div className="modal-overlay">
            <div className="modal confirm-modal">
              <h2>Notification Settings</h2>

              <p>Choose which study notifications you want to receive.</p>

              <div className="profile-info">
                <label className="profile-item profile-item-row">
                  <div>
                    <h3>Task reminders</h3>
                    <p>Get reminders about upcoming and overdue tasks.</p>
                  </div>

                  <input
                    type="checkbox"
                    checked={notificationSettings.taskReminders}
                    onChange={() =>
                      handleNotificationSettingChange("taskReminders")
                    }
                  />
                </label>

                <label className="profile-item profile-item-row">
                  <div>
                    <h3>Calendar reminders</h3>
                    <p>Get reminders about upcoming calendar events.</p>
                  </div>

                  <input
                    type="checkbox"
                    checked={notificationSettings.calendarReminders}
                    onChange={() =>
                      handleNotificationSettingChange("calendarReminders")
                    }
                  />
                </label>

                <label className="profile-item profile-item-row">
                  <div>
                    <h3>Grade notifications</h3>
                    <p>Get notified when grade-related updates are available.</p>
                  </div>

                  <input
                    type="checkbox"
                    checked={notificationSettings.gradeNotifications}
                    onChange={() =>
                      handleNotificationSettingChange("gradeNotifications")
                    }
                  />
                </label>

                <label className="profile-item profile-item-row">
                  <div>
                    <h3>Weekly summary</h3>
                    <p>Receive a weekly summary of your study progress.</p>
                  </div>

                  <input
                    type="checkbox"
                    checked={notificationSettings.weeklySummary}
                    onChange={() =>
                      handleNotificationSettingChange("weeklySummary")
                    }
                  />
                </label>
              </div>

              <div className="confirm-modal-actions">
                <button
                  className="secondary-button"
                  onClick={() => setShowNotificationSettingsModal(false)}
                >
                  Cancel
                </button>

                <button onClick={handleSaveNotificationSettings}>
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        )}

        {showProfilePictureModal && (
          <div className="modal-overlay">
            <div className="modal confirm-modal">
              <h2>Upload Profile Picture</h2>

              <p>Select an image from your computer.</p>

              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePictureChange}
              />

              {profilePicturePreview && (
                <div style={{ marginTop: "15px", textAlign: "center" }}>
                  <img
                    src={profilePicturePreview}
                    alt="Preview"
                    style={{
                      width: "120px",
                      height: "120px",
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                </div>
              )}

              <div className="confirm-modal-actions">
                <button
                  className="secondary-button"
                  onClick={() => {
                    setShowProfilePictureModal(false);
                    setProfilePicturePreview("");
                    setProfilePictureFile(null);
                  }}
                >
                  Cancel
                </button>

                <button onClick={handleSaveProfilePicture}>
                  Save Picture
                </button>
              </div>
            </div>
          </div>
        )}

        {showPasswordModal && (
          <div className="modal-overlay">
            <div className="modal confirm-modal">
              <h2>Change Password</h2>

              <p>
                Enter your current password and choose a new secure password.
              </p>

              <div className="form">
                <input
                  type="password"
                  placeholder="Current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />

                <input
                  type="password"
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />

                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <div className="confirm-modal-actions">
                <button
                  className="secondary-button"
                  onClick={() => {
                    setShowPasswordModal(false);

                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                >
                  Cancel
                </button>

                <button onClick={handleChangePasswordSubmit}>
                  Update Password
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Profile;