import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import api from "../services/api";

function Home() {
  const [user, setUser] = useState(null);

  const [courses, setCourses] = useState([]);
  const [notes, setNotes] = useState([]);
  const [tasks, setTasks] = useState([]);

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

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.get("/courses", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCourses(response.data);
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.get("/notes", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setNotes(response.data);
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.get("/tasks", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTasks(response.data);
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchCourses();
    fetchNotes();
    fetchTasks();
  }, []);

  return (
    <div>
      <Navbar user={true} />

      <h1>Studora Home</h1>

      {user && <h2>Welcome back, {user.username}</h2>}

      <h2>Your Overview</h2>

      <div>
        <h3>Courses</h3>
        <p>{courses.length}</p>
      </div>

      <div>
        <h3>Notes</h3>
        <p>{notes.length}</p>
      </div>

      <div>
        <h3>Tasks</h3>
        <p>{tasks.length}</p>
      </div>
    </div>
  );
}

export default Home;