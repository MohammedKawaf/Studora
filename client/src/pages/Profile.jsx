import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import NotificationBanner from "../components/NotificationBanner";
import ConfirmModal from "../components/ConfirmModal";
import translations from "../translations";

function Profile() {
  const language = localStorage.getItem("language") || "en";
  const t = translations[language];

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

  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    return localStorage.getItem("language") || "en";
  });

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
      showErrorMessage(t.couldNotLoadProfile);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleCreditGoalChange = (e) => {
    const selectedGoal = e.target.value;

    setCreditGoal(selectedGoal);
    localStorage.setItem("creditGoal", selectedGoal);

    showSuccessMessage(t.studyProgramGoalUpdated);
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
    showSuccessMessage(t.notificationSettingsUpdated);
  };

  const handleDeleteAccountConfirm = async () => {
    if (!deleteEmail.trim() || !deletePassword.trim()) {
      setDeleteAccountError(t.enterEmailAndPasswordToConfirm);
      return;
    }

    if (user && deleteEmail.trim().toLowerCase() !== user.email.toLowerCase()) {
      setDeleteAccountError(t.emailDoesNotMatch);
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await api.delete("/auth/delete-account", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          email: deleteEmail,
          password: deletePassword,
        },
      });

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
        error.response?.data?.message || t.couldNotDeleteAccount
      );
    }
  };

  const handleChangeUsername = async () => {
    if (!newUsername.trim()) {
      showErrorMessage(t.pleaseEnterUsername);
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

      showSuccessMessage(t.usernameUpdatedSuccessfully);
    } catch (error) {
      console.log(error.response?.data || error.message);
      showErrorMessage(t.couldNotUpdateUsername);
    }
  };

  const validatePassword = (passwordValue) => {
    if (passwordValue.length < 8) {
      return t.passwordMinLength;
    }

    if (!/[A-Z]/.test(passwordValue)) {
      return t.passwordNeedsUppercase;
    }

    if (!/[a-z]/.test(passwordValue)) {
      return t.passwordNeedsLowercase;
    }

    if (!/[0-9]/.test(passwordValue)) {
      return t.passwordNeedsNumber;
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(passwordValue)) {
      return t.passwordNeedsSpecial;
    }

    return "";
  };

  const handleChangePasswordSubmit = async () => {
    if (
      !currentPassword.trim() ||
      !newPassword.trim() ||
      !confirmPassword.trim()
    ) {
      showErrorMessage(t.fillAllPasswordFields);
      return;
    }

    const passwordError = validatePassword(newPassword);

    if (passwordError) {
      showErrorMessage(passwordError);
      return;
    }

    if (newPassword !== confirmPassword) {
      showErrorMessage(t.newPasswordsDoNotMatch);
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
        error.response?.data?.message || t.couldNotUpdatePassword
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

      showSuccessMessage(t.academicInfoUpdated);
    } catch (error) {
      console.log(error.response?.data || error.message);
      showErrorMessage(t.couldNotUpdateAcademicInfo);
    }
  };

  const handleSaveProfilePicture = async () => {
    if (!profilePictureFile) {
      showErrorMessage(t.pleaseSelectImage);
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();

      formData.append("profileImage", profilePictureFile);

      const response = await api.post("/auth/upload-profile-image", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setUser({
        ...user,
        profileImage: response.data.profileImage,
      });

      setShowProfilePictureModal(false);

      showSuccessMessage(t.profileImageUploaded);
    } catch (error) {
      console.log(error.response?.data || error.message);
      showErrorMessage(t.couldNotUploadProfileImage);
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

      showSuccessMessage(t.profileImageRemoved);
    } catch (error) {
      console.log(error.response?.data || error.message);
      showErrorMessage(t.couldNotRemoveProfileImage);
    }
  };

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;

    setSelectedLanguage(newLanguage);
    localStorage.setItem("language", newLanguage);

    window.location.reload();
  };

  return (
    <div>
      <Navbar user={true} />

      <main className="page">
        <section className="page-header">
          <h1>{t.profile}</h1>
          <p>{t.profileSubtitle}</p>
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
                  alt={t.profile}
                  className="profile-avatar-image"
                />
              ) : (
                user.username.charAt(0).toUpperCase()
              )}
            </div>

            <h2>{user.username}</h2>
            <p>{user.email}</p>

            <p className="last-active-text">
              {t.lastActive}:{" "}
              {user.lastActive
                ? new Date(user.lastActive).toLocaleString()
                : t.unknown}
            </p>

            <div className="actions" style={{ justifyContent: "center" }}>
              <button onClick={handleProfilePicture}>
                {user.profileImage
                  ? t.changeProfilePicture
                  : t.addProfilePicture}
              </button>

              {user.profileImage && (
                <button
                  className="danger-button"
                  onClick={handleRemoveProfileImage}
                >
                  {t.removePicture}
                </button>
              )}
            </div>
          </section>
        )}

        <section className="card">
          <h2>{t.accountInformation}</h2>

          {user && (
            <div className="profile-info">
              <div className="profile-item profile-item-row">
                <div>
                  <h3>{t.username}</h3>

                  {isEditingUsername ? (
                    <div className="username-edit">
                      <input
                        type="text"
                        placeholder={t.newUsername}
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                      />

                      <div className="actions">
                        <button onClick={handleChangeUsername}>{t.save}</button>

                        <button
                          className="secondary-button"
                          onClick={() => {
                            setIsEditingUsername(false);
                            setNewUsername("");
                          }}
                        >
                          {t.cancel}
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
                    {t.changeUsername}
                  </button>
                )}
              </div>

              <div className="profile-item">
                <h3>{t.email}</h3>
                <p>{user.email}</p>
              </div>

              <div className="profile-item">
                <h3>{t.theme}</h3>
                <p>
                  {localStorage.getItem("theme") === "dark"
                    ? t.darkMode
                    : t.lightMode}
                </p>
              </div>
            </div>
          )}
        </section>

        <section className="card">
          <div className="section-header">
            <h2>{t.academicInformation}</h2>

            {!isEditingAcademicInfo && (
              <button
                className="secondary-button"
                onClick={() => setIsEditingAcademicInfo(true)}
              >
                {t.edit}
              </button>
            )}
          </div>

          {user && (
            <div className="profile-info">
              {isEditingAcademicInfo ? (
                <div className="username-edit">
                  <input
                    type="text"
                    placeholder={t.school}
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                  />

                  <input
                    type="text"
                    placeholder={t.program}
                    value={program}
                    onChange={(e) => setProgram(e.target.value)}
                  />

                  <select
                    value={studyYear}
                    onChange={(e) => setStudyYear(e.target.value)}
                  >
                    <option value="">{t.selectStudyYear}</option>
                    <option value="1">{t.year} 1</option>
                    <option value="2">{t.year} 2</option>
                    <option value="3">{t.year} 3</option>
                    <option value="4">{t.year} 4</option>
                    <option value="5">{t.year} 5</option>
                    <option value="6">{t.year} 6</option>
                  </select>

                  <div className="actions">
                    <button onClick={handleUpdateAcademicInfo}>
                      {t.save}
                    </button>

                    <button
                      className="secondary-button"
                      onClick={() => {
                        setIsEditingAcademicInfo(false);
                        setSchool(user.school || "");
                        setProgram(user.program || "");
                        setStudyYear(user.studyYear || "");
                      }}
                    >
                      {t.cancel}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="profile-item">
                    <h3>{t.school}</h3>
                    <p>{user.school || t.notAddedYet}</p>
                  </div>

                  <div className="profile-item">
                    <h3>{t.program}</h3>
                    <p>{user.program || t.notAddedYet}</p>
                  </div>

                  <div className="profile-item profile-item-row">
                    <div>
                      <h3>{t.studyYear}</h3>
                      <p>
                        {user.studyYear
                          ? `${t.year} ${user.studyYear}`
                          : t.notAddedYet}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </section>

        <section className="card">
          <h2>{t.studyProgramSettings}</h2>

          <div className="profile-info">
            <div className="profile-item">
              <h3>{t.degreeLength}</h3>
              <p>{t.degreeLengthDescription}</p>

              <select value={creditGoal} onChange={handleCreditGoalChange}>
                <option value="60">1 {t.year} (60 hp)</option>
                <option value="90">1.5 {t.years} (90 hp)</option>
                <option value="120">2 {t.years} (120 hp)</option>
                <option value="150">2.5 {t.years} (150 hp)</option>
                <option value="180">3 {t.years} (180 hp)</option>
                <option value="210">3.5 {t.years} (210 hp)</option>
                <option value="240">4 {t.years} (240 hp)</option>
                <option value="270">4.5 {t.years} (270 hp)</option>
                <option value="300">5 {t.years} (300 hp)</option>
                <option value="330">5.5 {t.years} (330 hp)</option>
                <option value="360">6 {t.years} (360 hp)</option>
              </select>
            </div>
          </div>
        </section>

        <section className="card">
          <h2>{t.settings}</h2>

          <div className="profile-actions">
            <button onClick={() => setShowPasswordModal(true)}>
              {t.changePassword}
            </button>

            <button
              className="secondary-button"
              onClick={handleNotificationSettings}
            >
              {t.notificationSettings}
            </button>

            <div className="profile-item">
              <h3>{t.language}</h3>
              <p>{t.languageDescription}</p>

              <select value={selectedLanguage} onChange={handleLanguageChange}>
                <option value="en">English</option>
                <option value="sv">Svenska</option>
              </select>
            </div>

            <button
              className="secondary-button"
              onClick={() => setShowLogoutModal(true)}
            >
              {t.logout}
            </button>

            <button
              className="danger-button"
              onClick={() => {
                setDeleteAccountError("");
                setShowDeleteAccountModal(true);
              }}
            >
              {t.deleteAccount}
            </button>
          </div>
        </section>

        <ConfirmModal
          isOpen={showLogoutModal}
          title={t.logoutTitle}
          message={t.logoutMessage}
          onCancel={() => setShowLogoutModal(false)}
          onConfirm={handleLogout}
        />

        {showDeleteAccountModal && (
          <div className="modal-overlay">
            <div className="modal confirm-modal">
              <h2>{t.deleteAccountTitle}</h2>

              <p>{t.deleteAccountWarning}</p>

              {deleteAccountError && (
                <div className="error-banner">{deleteAccountError}</div>
              )}

              <div className="form">
                <input
                  type="email"
                  placeholder={t.confirmEmail}
                  value={deleteEmail}
                  onChange={(e) => setDeleteEmail(e.target.value)}
                />

                <input
                  type="password"
                  placeholder={t.confirmPassword}
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
                  {t.cancel}
                </button>

                <button
                  className="danger-button"
                  onClick={handleDeleteAccountConfirm}
                >
                  {t.deleteAccount}
                </button>
              </div>
            </div>
          </div>
        )}

        {showNotificationSettingsModal && (
          <div className="modal-overlay">
            <div className="modal confirm-modal">
              <h2>{t.notificationSettings}</h2>

              <p>{t.notificationSettingsDescription}</p>

              <div className="profile-info">
                <label className="profile-item profile-item-row">
                  <div>
                    <h3>{t.taskReminders}</h3>
                    <p>{t.taskRemindersDescription}</p>
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
                    <h3>{t.calendarReminders}</h3>
                    <p>{t.calendarRemindersDescription}</p>
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
                    <h3>{t.gradeNotifications}</h3>
                    <p>{t.gradeNotificationsDescription}</p>
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
                    <h3>{t.weeklySummary}</h3>
                    <p>{t.weeklySummaryDescription}</p>
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
                  {t.cancel}
                </button>

                <button onClick={handleSaveNotificationSettings}>
                  {t.saveSettings}
                </button>
              </div>
            </div>
          </div>
        )}

        {showProfilePictureModal && (
          <div className="modal-overlay">
            <div className="modal confirm-modal">
              <h2>{t.uploadProfilePicture}</h2>

              <p>{t.selectImageFromComputer}</p>

              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePictureChange}
              />

              {profilePicturePreview && (
                <div style={{ marginTop: "15px", textAlign: "center" }}>
                  <img
                    src={profilePicturePreview}
                    alt={t.preview}
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
                  {t.cancel}
                </button>

                <button onClick={handleSaveProfilePicture}>
                  {t.savePicture}
                </button>
              </div>
            </div>
          </div>
        )}

        {showPasswordModal && (
          <div className="modal-overlay">
            <div className="modal confirm-modal">
              <h2>{t.changePassword}</h2>

              <p>{t.changePasswordDescription}</p>

              <div className="form">
                <input
                  type="password"
                  placeholder={t.currentPassword}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />

                <input
                  type="password"
                  placeholder={t.newPassword}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />

                <input
                  type="password"
                  placeholder={t.confirmNewPassword}
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
                  {t.cancel}
                </button>

                <button onClick={handleChangePasswordSubmit}>
                  {t.updatePassword}
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