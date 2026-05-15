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

    if (!title || !course || !dueDate) {
    alert("Please fill in all fields");
    return;
    }

    try {
      const token = localStorage.getItem("token");

      await api.post(
        "/tasks",
        {
          title,
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
    } catch (error) {
      console.log(error.response?.data || error.message);
      alert("Could not create task");
    }
  };

  const handleToggleCompleted = async (taskId) => {
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
    } catch (error) {
      console.log(error.response?.data || error.message);
      alert("Could not update task");
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
    } catch (error) {
      console.log(error.response?.data || error.message);
      alert("Could not delete task");
    }
  };

  const handleEditTask = async (taskId) => {
    try {
      const token = localStorage.getItem("token");

      await api.put(
        `/tasks/edit/${taskId}`,
        {
          title: editTitle,
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
    } catch (error) {
      console.log(error.response?.data || error.message);
      alert("Could not update task");
    }
  };

  return (
    <div>
      <Navbar user={true} />

      <h1>Tasks</h1>

      <h2>Create Task</h2>

      <form onSubmit={handleCreateTask}>
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

      <h2>Your Tasks</h2>

      {tasks.map((task) => (
        <div key={task._id}>
          {editingTaskId === task._id ? (
            <>
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

              <button onClick={() => handleEditTask(task._id)}>
                Save
              </button>

              <button onClick={() => setEditingTaskId(null)}>
                Cancel
              </button>
            </>
          ) : (
            <>
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
                Status: {task.completed ? "Completed" : "Not completed"}
              </p>

              <button onClick={() => handleToggleCompleted(task._id)}>
                {task.completed
                  ? "Mark as incomplete"
                  : "Mark as completed"}
              </button>

              <button
                onClick={() => {
                  setEditingTaskId(task._id);
                  setEditTitle(task.title);
                  setEditCourse(task.course?._id || "");
                  setEditDueDate(
                    task.dueDate
                      ? new Date(task.dueDate).toISOString().split("T")[0]
                      : ""
                  );
                }}
              >
                Edit Task
              </button>

              <button onClick={() => handleDeleteTask(task._id)}>
                Delete Task
              </button>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

export default Tasks;