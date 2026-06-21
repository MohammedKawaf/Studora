import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import NotificationBanner from "../components/NotificationBanner";
import translations from "../translations";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const language = localStorage.getItem("language") || "en";
  const t = translations[language];

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

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      showErrorMessage(t.pleaseFillAllFields);
      return;
    }

    try {
      const response = await api.post("/auth/login", {
        email: email.trim(),
        password: password.trim(),
      });

      localStorage.setItem("token", response.data.token);

      showSuccessMessage(t.loginSuccessful);
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (error) {
      console.log(error.response?.data || error.message);

      showErrorMessage(t.loginFailed);
    }
  };

  return (
    <div className="auth-page">
      <nav>
        <Link to="/register">{t.register}</Link>
      </nav>

      <main className="auth-container">
        <h1>{t.login}</h1>

        <NotificationBanner
          successMessage={successMessage}
          errorMessage={errorMessage}
        />

        <form onSubmit={handleLogin} className="form">
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

          <button type="submit">{t.login}</button>
        </form>
      </main>
    </div>
  );
}

export default Login;