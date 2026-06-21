import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import NotificationBanner from "../components/NotificationBanner";
import translations from "../translations";

function Register() {
  const language = localStorage.getItem("language") || "en";
  const t = translations[language];

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

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

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!username.trim() || !email.trim() || !password.trim()) {
      showErrorMessage(t.pleaseFillAllFields);
      return;
    }

    const passwordError = validatePassword(password);

    if (passwordError) {
      showErrorMessage(passwordError);
      return;
    }

    try {
      await api.post("/auth/register", {
        username: username.trim(),
        email: email.trim(),
        password: password.trim(),
      });

      showSuccessMessage(t.accountCreatedSuccessfully);

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      console.log(error.response?.data || error.message);

      showErrorMessage(
        error.response?.data?.message || t.registrationFailed
      );
    }
  };

  return (
    <div className="auth-page">
      <nav>
        <Link to="/login">{t.login}</Link>
      </nav>

      <main className="auth-container">
        <h1>{t.createAccount}</h1>

        <NotificationBanner
          successMessage={successMessage}
          errorMessage={errorMessage}
        />

        <form onSubmit={handleRegister} className="form">
          <input
            type="text"
            placeholder={t.username}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            type="email"
            placeholder={t.email}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="password-input-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder={t.password}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              type="button"
              className="password-toggle-button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? t.hide : t.show}
            </button>
          </div>

          <div className="password-rules">
            <p>{t.passwordMustContain}</p>

            <ul>
              <li>{t.passwordRuleLength}</li>
              <li>{t.passwordRuleUppercase}</li>
              <li>{t.passwordRuleLowercase}</li>
              <li>{t.passwordRuleNumber}</li>
              <li>{t.passwordRuleSpecial}</li>
            </ul>
          </div>

          <button type="submit">{t.register}</button>
        </form>
      </main>
    </div>
  );
}

export default Register;