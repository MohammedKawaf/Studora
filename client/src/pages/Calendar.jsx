import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import api from "../services/api";

function Calendar() {
  const [events, setEvents] = useState([]);
  const [courses, setCourses] = useState([]);

  const [title, setTitle] = useState("");
  const [type, setType] = useState("other");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [course, setCourse] = useState("");

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

  useEffect(() => {
    fetchEvents();
    fetchCourses();
  }, []);

  const handleCreateEvent = async (e) => {
    e.preventDefault();

    if (!title || !date) {
      alert("Please fill in title and date");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await api.post(
        "/events",
        {
          title,
          type,
          date,
          time,
          course,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTitle("");
      setType("other");
      setDate("");
      setTime("");
      setCourse("");

      fetchEvents();
    } catch (error) {
      console.log(error.response?.data || error.message);
      alert("Could not create event");
    }
  };

  return (
    <div>
      <Navbar user={true} />

      <main className="page">
        <section className="page-header">
          <h1>Calendar</h1>
          <p>Your upcoming lectures, exams and deadlines.</p>
        </section>

        <section className="card">
          <h2>Create Event</h2>

          <form onSubmit={handleCreateEvent} className="form">
            <input
              type="text"
              placeholder="Event title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="exam">Exam</option>
              <option value="assignment">Assignment</option>
              <option value="lecture">Lecture</option>
              <option value="meeting">Meeting</option>
              <option value="study">Study</option>
              <option value="other">Other</option>
            </select>

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />

            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />

            <select value={course} onChange={(e) => setCourse(e.target.value)}>
              <option value="">Select course</option>

              {courses.map((courseItem) => (
                <option key={courseItem._id} value={courseItem._id}>
                  {courseItem.name}
                </option>
              ))}
            </select>

            <button type="submit">Add Event</button>
          </form>
        </section>

        <section className="card">
          <h2>Your Events</h2>

          {events.map((event) => (
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
          ))}
        </section>
      </main>
    </div>
  );
}

export default Calendar;