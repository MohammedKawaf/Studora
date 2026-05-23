import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import NotificationBanner from "../components/NotificationBanner";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!username.trim() || !email.trim() || !password.trim()) {
      showErrorMessage("Please fill in all fields");
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

      showErrorMessage("Registration failed");
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

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit">Register</button>
        </form>
      </main>
    </div>
  );
}

export default Register;