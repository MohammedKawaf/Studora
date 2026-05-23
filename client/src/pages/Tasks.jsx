import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import api from "../services/api";

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [courses, setCourses] = useState([]);

  const [title, setTitle] = useState("");
  const [course, setCourse] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCourse, setEditCourse] = useState("");
  const [editDueDate, setEditDueDate] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

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
    fetchTasks();
    fetchCourses();
  }, []);

  const handleCreateTask = async (e) => {
    e.preventDefault();

    if (!title.trim() || !course || !dueDate) {
      showErrorMessage("Please fill in all fields");
      return;
    }

    const selectedDueDate = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDueDate < today) {
      showErrorMessage("Due date cannot be in the past");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await api.post(
        "/tasks",
        {
          title: title.trim(),
          course,
          dueDate,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTitle("");
      setCourse("");
      setDueDate("");

      fetchTasks();
      showSuccessMessage("Task created successfully");
    } catch (error) {
      console.log(error.response?.data || error.message);
      showErrorMessage("Could not create task");
    }
  };

  const handleToggleCompleted = async (taskId, completed) => {
    try {
      const token = localStorage.getItem("token");

      await api.put(
        `/tasks/${taskId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchTasks();

      showSuccessMessage(
        completed
          ? "Task marked as incomplete"
          : "Task marked as completed"
      );
    } catch (error) {
      console.log(error.response?.data || error.message);
      showErrorMessage("Could not update task");
    }
  };

  const handleDeleteTask = async (taskId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await api.delete(`/tasks/${taskId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchTasks();
      showSuccessMessage("Task deleted successfully");
    } catch (error) {
      console.log(error.response?.data || error.message);
      showErrorMessage("Could not delete task");
    }
  };

  const handleEditTask = async (taskId) => {
    if (!editTitle.trim() || !editCourse || !editDueDate) {
      showErrorMessage("Please fill in all fields");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await api.put(
        `/tasks/edit/${taskId}`,
        {
          title: editTitle.trim(),
          course: editCourse,
          dueDate: editDueDate,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setEditingTaskId(null);
      setEditTitle("");
      setEditCourse("");
      setEditDueDate("");

      fetchTasks();
      showSuccessMessage("Task updated successfully");
    } catch (error) {
      console.log(error.response?.data || error.message);
      showErrorMessage("Could not update task");
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesCourse = selectedCourse
      ? task.course?._id === selectedCourse
      : true;

    const matchesStatus =
      selectedStatus === "completed"
        ? task.completed
        : selectedStatus === "not-completed"
        ? !task.completed
        : true;

    return matchesSearch && matchesCourse && matchesStatus;
  });

  return (
    <div>
      <Navbar user={true} />

      <main className="page">
        <section className="page-header">
          <h1>Tasks</h1>
          <p>Track assignments, deadlines and study tasks.</p>
        </section>

        {successMessage && (
          <div className="success-banner">{successMessage}</div>
        )}

        {errorMessage && <div className="error-banner">{errorMessage}</div>}

        <section className="card">
          <h2>Create Task</h2>

          <form onSubmit={handleCreateTask} className="form">
            <input
              type="text"
              placeholder="Task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <select value={course} onChange={(e) => setCourse(e.target.value)}>
              <option value="">Select course</option>

              {courses.map((courseItem) => (
                <option key={courseItem._id} value={courseItem._id}>
                  {courseItem.name}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />

            <button type="submit">Add Task</button>
          </form>
        </section>

        <section className="card">
          <h2>Your Tasks</h2>

          <div className="calendar-filters">
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

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

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="not-completed">Not completed</option>
            </select>
          </div>

          {filteredTasks.length === 0 ? (
            <p>No tasks found.</p>
          ) : (
            filteredTasks.map((task) => (
              <div key={task._id} className="list-item">
                {editingTaskId === task._id ? (
                  <div className="edit-form">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
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

                    <input
                      type="date"
                      value={editDueDate}
                      onChange={(e) => setEditDueDate(e.target.value)}
                    />

                    <div className="actions">
                      <button onClick={() => handleEditTask(task._id)}>
                        Save
                      </button>

                      <button
                        className="secondary-button"
                        onClick={() => setEditingTaskId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <h3>{task.title}</h3>

                      {task.course && (
                        <p>
                          Course: {task.course.name} ({task.course.code})
                        </p>
                      )}

                      {task.dueDate && (
                        <p>
                          Due date:{" "}
                          {new Date(task.dueDate).toLocaleDateString()}
                        </p>
                      )}

                      <p>
                        Status:{" "}
                        <strong>
                          {task.completed ? "Completed" : "Not completed"}
                        </strong>
                      </p>
                    </div>

                    <div className="actions">
                      <button
                        onClick={() =>
                          handleToggleCompleted(task._id, task.completed)
                        }
                      >
                        {task.completed
                          ? "Mark as incomplete"
                          : "Mark as completed"}
                      </button>

                      <button
                        className="secondary-button"
                        onClick={() => {
                          setEditingTaskId(task._id);
                          setEditTitle(task.title);
                          setEditCourse(task.course?._id || "");
                          setEditDueDate(
                            task.dueDate
                              ? new Date(task.dueDate)
                                  .toISOString()
                                  .split("T")[0]
                              : ""
                          );
                        }}
                      >
                        Edit
                      </button>

                      <button
                        className="danger-button"
                        onClick={() => handleDeleteTask(task._id)}
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

export default Tasks;