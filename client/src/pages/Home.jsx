import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import api from "../services/api";

function Home() {
  const [user, setUser] = useState(null);

  const [courses, setCourses] = useState([]);
  const [notes, setNotes] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);

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

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.get("/events", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setEvents(response.data);
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchCourses();
    fetchNotes();
    fetchTasks();
    fetchEvents();
  }, []);

  const upcomingDeadlines = tasks
    .filter((task) => task.dueDate && !task.completed)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);

  const upcomingEvents = events
    .filter((event) => new Date(event.date) >= new Date().setHours(0, 0, 0, 0))
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5);

  return (
    <div>
      <Navbar user={true} />

      <main className="page">
        <section className="page-header">
          <h1>Studora Home</h1>

          {user && <p>Welcome back, {user.username}</p>}
        </section>

        <section className="card">
          <h2>Your Overview</h2>

          <div className="overview-grid">
            <div className="overview-card">
              <h3>Courses</h3>
              <p>{courses.length}</p>
            </div>

            <div className="overview-card">
              <h3>Notes</h3>
              <p>{notes.length}</p>
            </div>

            <div className="overview-card">
              <h3>Tasks</h3>
              <p>{tasks.length}</p>
            </div>

            <div className="overview-card">
              <h3>Events</h3>
              <p>{events.length}</p>
            </div>
          </div>
        </section>

        <section className="card">
          <h2>Upcoming Deadlines</h2>

          {upcomingDeadlines.length === 0 ? (
            <p>No upcoming deadlines.</p>
          ) : (
            upcomingDeadlines.map((task) => (
              <div key={task._id} className="list-item">
                <div>
                  <h3>{task.title}</h3>

                  {task.course && (
                    <p>
                      Course: {task.course.name} ({task.course.code})
                    </p>
                  )}

                  <p>Due date: {new Date(task.dueDate).toLocaleDateString()}</p>
                </div>
              </div>
            ))
          )}
        </section>

        <section className="card">
          <h2>Upcoming Events</h2>

          {upcomingEvents.length === 0 ? (
            <p>No upcoming events.</p>
          ) : (
            upcomingEvents.map((event) => (
              <div key={event._id} className="list-item">
                <div>
                  <h3>{event.title}</h3>

                  <p>Type: {event.type}</p>

                  <p>Date: {new Date(event.date).toLocaleDateString()}</p>

                  {event.time && <p>Time: {event.time}</p>}

                  {event.course && (
                    <p>
                      Course: {event.course.name} ({event.course.code})
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </section>
      </main>
    </div>
  );
}

export default Home;