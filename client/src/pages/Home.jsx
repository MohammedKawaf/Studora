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

  const upcomingDeadlines = tasks
    .filter((task) => task.dueDate && !task.completed)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);

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

      <h2>Upcoming Deadlines</h2>

      {upcomingDeadlines.length === 0 ? (
        <p>No upcoming deadlines.</p>
      ) : (
        upcomingDeadlines.map((task) => (
          <div key={task._id}>
            <h3>{task.title}</h3>

            {task.course && (
              <p>
                Course: {task.course.name} ({task.course.code})
              </p>
            )}

            <p>Due date: {new Date(task.dueDate).toLocaleDateString()}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default Home;