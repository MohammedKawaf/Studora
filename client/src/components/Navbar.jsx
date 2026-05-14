import { Link, useNavigate } from "react-router-dom";

function Navbar({ user }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav>
      <Link to="/">Dashboard</Link>{" "}

      <Link to="/notes">Notes</Link>{" "}

      {!user && (
        <>
          <Link to="/login">Login</Link>{" "}
          <Link to="/register">Register</Link>{" "}
        </>
      )}

      {user && <button onClick={handleLogout}>Logout</button>}
    </nav>
  );
}

export default Navbar;