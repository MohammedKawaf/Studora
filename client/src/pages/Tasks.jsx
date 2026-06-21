import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import api from "../services/api";
import NotificationBanner from "../components/NotificationBanner";
import ConfirmModal from "../components/ConfirmModal";
import translations from "../translations";

function Tasks() {
  const language = localStorage.getItem("language") || "en";
  const t = translations[language];

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

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

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
      showErrorMessage(t.pleaseFillAllFields);
      return;
    }

    const selectedDueDate = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDueDate < today) {
      showErrorMessage(t.dueDateCannotBePast);
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
      showSuccessMessage(t.taskCreatedSuccessfully);
    } catch (error) {
      console.log(error.response?.data || error.message);
      showErrorMessage(t.couldNotCreateTask);
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
        completed ? t.taskMarkedIncomplete : t.taskMarkedCompleted
      );
    } catch (error) {
      console.log(error.response?.data || error.message);
      showErrorMessage(t.couldNotUpdateTask);
    }
  };

  const handleDeleteTask = async () => {
    if (!taskToDelete) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await api.delete(`/tasks/${taskToDelete}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setShowDeleteModal(false);
      setTaskToDelete(null);

      fetchTasks();
      showSuccessMessage(t.taskDeletedSuccessfully);
    } catch (error) {
      console.log(error.response?.data || error.message);
      showErrorMessage(t.couldNotDeleteTask);
    }
  };

  const handleEditTask = async (taskId) => {
    if (!editTitle.trim() || !editCourse || !editDueDate) {
      showErrorMessage(t.pleaseFillAllFields);
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
      showSuccessMessage(t.taskUpdatedSuccessfully);
    } catch (error) {
      console.log(error.response?.data || error.message);
      showErrorMessage(t.couldNotUpdateTask);
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
          <h1>{t.tasks}</h1>
          <p>{t.tasksSubtitle}</p>
        </section>

        <NotificationBanner
          successMessage={successMessage}
          errorMessage={errorMessage}
        />

        <section className="card">
          <h2>{t.createTask}</h2>

          <form onSubmit={handleCreateTask} className="form">
            <input
              type="text"
              placeholder={t.taskTitle}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <select value={course} onChange={(e) => setCourse(e.target.value)}>
              <option value="">{t.selectCourse}</option>

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

            <button type="submit">{t.addTask}</button>
          </form>
        </section>

        <section className="card">
          <h2>{t.yourTasks}</h2>

          <div className="calendar-filters">
            <input
              type="text"
              placeholder={t.searchTasks}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              <option value="">{t.allCourses}</option>

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
              <option value="">{t.allStatuses}</option>
              <option value="completed">{t.completed}</option>
              <option value="not-completed">{t.notCompleted}</option>
            </select>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="empty-state">
              <h3>📋 {t.noTasksYet}</h3>
              <p>{t.addTasksToStayOrganized}</p>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task._id}
                className={`list-item ${
                  task.completed ? "completed-task" : ""
                }`}
              >
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
                      <option value="">{t.selectCourse}</option>

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
                        {t.save}
                      </button>

                      <button
                        className="secondary-button"
                        onClick={() => setEditingTaskId(null)}
                      >
                        {t.cancel}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <h3
                        className={
                          task.completed ? "completed-task-title" : ""
                        }
                      >
                        {task.title}
                      </h3>

                      {task.course && (
                        <div className="course-badge">
                          <span
                            className="course-badge-color"
                            style={{ backgroundColor: task.course.color }}
                          ></span>

                          <span>
                            {task.course.name} ({task.course.code})
                          </span>
                        </div>
                      )}

                      {task.dueDate && (
                        <p>
                          {t.dueDate}:{" "}
                          {new Date(task.dueDate).toLocaleDateString()}
                        </p>
                      )}

                      <p>
                        {t.status}:{" "}
                        <strong>
                          {task.completed ? t.completed : t.notCompleted}
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
                          ? t.markAsIncomplete
                          : t.markAsCompleted}
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
                        {t.edit}
                      </button>

                      <button
                        className="danger-button"
                        onClick={() => {
                          setTaskToDelete(task._id);
                          setShowDeleteModal(true);
                        }}
                      >
                        {t.delete}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </section>

        <ConfirmModal
          isOpen={showDeleteModal}
          title={t.deleteTaskTitle}
          message={t.deleteTaskMessage}
          onCancel={() => {
            setShowDeleteModal(false);
            setTaskToDelete(null);
          }}
          onConfirm={handleDeleteTask}
        />
      </main>
    </div>
  );
}

export default Tasks;