import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import NotificationBanner from "../components/NotificationBanner";

function Register() {
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
      return "Password must be at least 8 characters";
    }

    if (!/[A-Z]/.test(passwordValue)) {
      return "Password must contain at least one uppercase letter";
    }

    if (!/[a-z]/.test(passwordValue)) {
      return "Password must contain at least one lowercase letter";
    }

    if (!/[0-9]/.test(passwordValue)) {
      return "Password must contain at least one number";
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(passwordValue)) {
      return "Password must contain at least one special character";
    }

    return "";
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!username.trim() || !email.trim() || !password.trim()) {
      showErrorMessage("Please fill in all fields");
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

      showSuccessMessage("Account created successfully!");

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      console.log(error.response?.data || error.message);

      showErrorMessage(
        error.response?.data?.message || "Registration failed"
      );
    }
  };

  return (
    <div className="auth-page">
      <nav>
        <Link to="/login">Login</Link>
      </nav>

      <main className="auth-container">
        <h1>Create account</h1>

        <NotificationBanner
          successMessage={successMessage}
          errorMessage={errorMessage}
        />

        <form onSubmit={handleRegister} className="form">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="password-input-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              type="button"
              className="password-toggle-button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <div className="password-rules">
            <p>Password must contain:</p>
            <ul>
              <li>At least 8 characters</li>
              <li>One uppercase letter</li>
              <li>One lowercase letter</li>
              <li>One number</li>
              <li>One special character, for example ! @ # $ %</li>
            </ul>
          </div>
          <button type="submit">Register</button>
        </form>
      </main>
    </div>
  );
}

export default Register;