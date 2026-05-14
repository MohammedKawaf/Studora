import { Link, useNavigate } from "react-router-dom";

function Navbar({ user }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav>
      {user && (
        <>
          <Link to="/">Home</Link>{" "}
          <Link to="/courses">Courses</Link>{" "}
          <Link to="/notes">Notes</Link>{" "}
        </>
      )}

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