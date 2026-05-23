import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import api from "../services/api";

function Calendar() {
  const [events, setEvents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [courses, setCourses] = useState([]);

  const [title, setTitle] = useState("");
  const [type, setType] = useState("other");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [course, setCourse] = useState("");

  const [editingEventId, setEditingEventId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editType, setEditType] = useState("other");
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editCourse, setEditCourse] = useState("");

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

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
    fetchTasks();
    fetchCourses();
  }, []);

  const handleCreateEvent = async (e) => {
    e.preventDefault();

    if (!title.trim() || !date || !time || !course) {
      showErrorMessage("Please fill in all fields");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await api.post(
        "/events",
        {
          title: title.trim(),
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
      setSelectedDate(null);
      setShowEventModal(false);

      fetchEvents();
      showSuccessMessage("Event created successfully");
    } catch (error) {
      console.log(error.response?.data || error.message);
      showErrorMessage("Could not create event");
    }
  };

  const handleEditEvent = async (eventId) => {
    if (!editTitle.trim() || !editDate || !editTime || !editCourse) {
      showErrorMessage("Please fill in all fields");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await api.put(
        `/events/${eventId}`,
        {
          title: editTitle.trim(),
          type: editType,
          date: editDate,
          time: editTime,
          course: editCourse,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setEditingEventId(null);
      setEditTitle("");
      setEditType("other");
      setEditDate("");
      setEditTime("");
      setEditCourse("");

      fetchEvents();
      showSuccessMessage("Event updated successfully");
    } catch (error) {
      console.log(error.response?.data || error.message);
      showErrorMessage("Could not update event");
    }
  };

  const handleDeleteEvent = async (eventId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this event?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await api.delete(`/events/${eventId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchEvents();
      showSuccessMessage("Event deleted successfully");
    } catch (error) {
      console.log(error.response?.data || error.message);
      showErrorMessage("Could not delete event");
    }
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  const goToNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  const monthName = currentMonth.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = firstDayOfMonth.getDay();

  const calendarDays = [];

  for (let i = 0; i < startDay; i++) {
    calendarDays.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesType = selectedType ? event.type === selectedType : true;

    const matchesCourse = selectedCourse
      ? event.course?._id === selectedCourse
      : true;

    return matchesSearch && matchesType && matchesCourse;
  });

  const filteredTaskDeadlines = tasks.filter((task) => {
    if (!task.dueDate || task.completed) {
      return false;
    }

    const matchesSearch = task.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesType = selectedType ? selectedType === "task" : true;

    const matchesCourse = selectedCourse
      ? task.course?._id === selectedCourse
      : true;

    return matchesSearch && matchesType && matchesCourse;
  });

  const getItemsForDay = (day) => {
    if (!day) {
      return [];
    }

    const dayEvents = filteredEvents
      .filter((event) => {
        const eventDate = new Date(event.date);

        return (
          eventDate.getFullYear() === year &&
          eventDate.getMonth() === month &&
          eventDate.getDate() === day
        );
      })
      .map((event) => ({
        ...event,
        itemType: "event",
      }));

    const dayTasks = filteredTaskDeadlines
      .filter((task) => {
        const taskDate = new Date(task.dueDate);

        return (
          taskDate.getFullYear() === year &&
          taskDate.getMonth() === month &&
          taskDate.getDate() === day
        );
      })
      .map((task) => ({
        ...task,
        itemType: "task",
      }));

    return [...dayEvents, ...dayTasks];
  };

  const handleDayClick = (day) => {
    if (!day) {
      return;
    }

    const formattedDate = `${year}-${String(month + 1).padStart(
      2,
      "0"
    )}-${String(day).padStart(2, "0")}`;

    setSelectedDate(formattedDate);
    setDate(formattedDate);
    setShowEventModal(true);
  };

  return (
    <div>
      <Navbar user={true} />

      <main className="page">
        <section className="page-header">
          <h1>Calendar</h1>
          <p>Your upcoming lectures, exams, deadlines and tasks.</p>
        </section>

        {successMessage && (
          <div className="success-banner">{successMessage}</div>
        )}

        {errorMessage && <div className="error-banner">{errorMessage}</div>}

        <section className="card">
          <div className="calendar-header">
            <button onClick={goToPreviousMonth}>Previous</button>
            <h2>{monthName}</h2>
            <button onClick={goToNextMonth}>Next</button>
          </div>

          <div className="calendar-grid calendar-weekdays">
            <strong>Sun</strong>
            <strong>Mon</strong>
            <strong>Tue</strong>
            <strong>Wed</strong>
            <strong>Thu</strong>
            <strong>Fri</strong>
            <strong>Sat</strong>
          </div>

          <div className="calendar-grid">
            {calendarDays.map((day, index) => (
              <div
                key={index}
                className="calendar-day"
                onClick={() => handleDayClick(day)}
              >
                {day && (
                  <>
                    <span className="calendar-day-number">{day}</span>

                    {getItemsForDay(day).map((item) => (
                      <div
                        key={`${item.itemType}-${item._id}`}
                        className={`calendar-event ${
                          item.itemType === "task"
                            ? "calendar-task"
                            : item.type === "exam"
                            ? "calendar-exam"
                            : item.type === "assignment"
                            ? "calendar-assignment"
                            : item.type === "lecture"
                            ? "calendar-lecture"
                            : item.type === "meeting"
                            ? "calendar-meeting"
                            : item.type === "study"
                            ? "calendar-study"
                            : "calendar-other"
                        }`}
                      >
                        {item.itemType === "task" ? (
                          <>Task: {item.title}</>
                        ) : (
                          <>
                            {item.time && <span>{item.time} </span>}
                            {item.title}
                          </>
                        )}
                      </div>
                    ))}
                  </>
                )}
              </div>
            ))}
          </div>
        </section>

        {showEventModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>Create Event</h2>

              <p>
                Selected date:{" "}
                <strong>{new Date(selectedDate).toLocaleDateString()}</strong>
              </p>

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
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />

                <select
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                >
                  <option value="">Select course</option>

                  {courses.map((courseItem) => (
                    <option key={courseItem._id} value={courseItem._id}>
                      {courseItem.name}
                    </option>
                  ))}
                </select>

                <button type="submit">Add Event</button>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setShowEventModal(false)}
                >
                  Cancel
                </button>
              </form>
            </div>
          </div>
        )}

        <section className="card">
          <h2>Your Events</h2>

          <div className="calendar-filters">
            <input
              type="text"
              placeholder="Search calendar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="exam">Exam</option>
              <option value="assignment">Assignment</option>
              <option value="lecture">Lecture</option>
              <option value="meeting">Meeting</option>
              <option value="study">Study</option>
              <option value="other">Other</option>
              <option value="task">Task deadlines</option>
            </select>

            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              <option value="">All Courses</option>

              {courses.map((courseItem) => (
                <option key={courseItem._id} value={courseItem._id}>
                  {courseItem.name}
                </option>
              ))}
            </select>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="empty-state">
              <h3>📅 No events yet</h3>
              <p>Create calendar events and manage your schedule.</p>
            </div>
          ) : (
            filteredEvents.map((event) => (
              <div key={event._id} className="list-item">
                {editingEventId === event._id ? (
                  <div className="edit-form">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                    />

                    <select
                      value={editType}
                      onChange={(e) => setEditType(e.target.value)}
                    >
                      <option value="exam">Exam</option>
                      <option value="assignment">Assignment</option>
                      <option value="lecture">Lecture</option>
                      <option value="meeting">Meeting</option>
                      <option value="study">Study</option>
                      <option value="other">Other</option>
                    </select>

                    <input
                      type="date"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                    />

                    <input
                      type="time"
                      value={editTime}
                      onChange={(e) => setEditTime(e.target.value)}
                    />

                    <select
                      value={editCourse}
                      onChange={(e) => setEditCourse(e.target.value)}
                    >
                      <option value="">Select course</option>

                      {courses.map((courseItem) => (
                        <option key={courseItem._id} value={courseItem._id}>
                          {courseItem.name}
                        </option>
                      ))}
                    </select>

                    <div className="actions">
                      <button onClick={() => handleEditEvent(event._id)}>
                        Save
                      </button>

                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => setEditingEventId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
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

                    <div className="actions">
                      <button
                        className="secondary-button"
                        onClick={() => {
                          setEditingEventId(event._id);
                          setEditTitle(event.title);
                          setEditType(event.type);
                          setEditDate(
                            event.date
                              ? new Date(event.date).toISOString().split("T")[0]
                              : ""
                          );
                          setEditTime(event.time || "");
                          setEditCourse(event.course?._id || "");
                        }}
                      >
                        Edit
                      </button>

                      <button
                        className="danger-button"
                        onClick={() => handleDeleteEvent(event._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </section>
      </main>
    </div>
  );
}

export default Calendar;