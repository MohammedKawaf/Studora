import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import api from "../services/api";
import NotificationBanner from "../components/NotificationBanner";
import ConfirmModal from "../components/ConfirmModal";
import translations from "../translations";

function Courses() {
  const language = localStorage.getItem("language") || "en";
  const t = translations[language];

  const [courses, setCourses] = useState([]);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [color, setColor] = useState("#2563eb");
  const [user, setUser] = useState(null);

  const [editingCourseId, setEditingCourseId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editCode, setEditCode] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);

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

  useEffect(() => {
    fetchCourses();
    fetchUser();
  }, []);

  const handleCreateCourse = async (e) => {
    e.preventDefault();

    if (!name.trim() || !code.trim()) {
      showErrorMessage(t.courseNameAndCodeRequired);
      return;
    }

    const duplicateCourse = courses.find(
      (course) =>
        course.name.toLowerCase() === name.trim().toLowerCase() ||
        course.code.toLowerCase() === code.trim().toLowerCase()
    );

    if (duplicateCourse) {
      showErrorMessage(t.courseAlreadyExists);
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await api.post(
        "/courses",
        {
          name: name.trim(),
          code: code.trim(),
          color,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setName("");
      setCode("");
      setColor("#2563eb");

      fetchCourses();
      showSuccessMessage(t.courseCreatedSuccessfully);
    } catch (error) {
      console.log(error.response?.data || error.message);
      showErrorMessage(t.couldNotCreateCourse);
    }
  };

  const handleDeleteCourse = async () => {
    if (!courseToDelete) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await api.delete(`/courses/${courseToDelete}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setShowDeleteModal(false);
      setCourseToDelete(null);

      fetchCourses();
      showSuccessMessage(t.courseDeletedSuccessfully);
    } catch (error) {
      console.log(error.response?.data || error.message);
      showErrorMessage(t.couldNotDeleteCourse);
    }
  };

  const handleEditCourse = async (courseId) => {
    if (!editName.trim() || !editCode.trim()) {
      showErrorMessage(t.courseNameAndCodeRequired);
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await api.put(
        `/courses/${courseId}`,
        {
          name: editName.trim(),
          code: editCode.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setEditingCourseId(null);
      setEditName("");
      setEditCode("");

      fetchCourses();
      showSuccessMessage(t.courseUpdatedSuccessfully);
    } catch (error) {
      console.log(error.response?.data || error.message);
      showErrorMessage(t.couldNotUpdateCourse);
    }
  };

  const filteredCourses = courses.filter((course) => {
    const courseName = course.name.toLowerCase();
    const courseCode = course.code.toLowerCase();
    const search = searchTerm.toLowerCase();

    return courseName.includes(search) || courseCode.includes(search);
  });

  return (
    <div>
      <Navbar user={user} />

      <main className="page">
        <section className="page-header">
          <h1>{t.courses}</h1>

          {user && (
            <p>
              {t.welcome}, {user.username}
            </p>
          )}
        </section>

        <NotificationBanner
          successMessage={successMessage}
          errorMessage={errorMessage}
        />

        <section className="card">
          <h2>{t.createCourse}</h2>

          <form onSubmit={handleCreateCourse} className="form">
            <input
              type="text"
              placeholder={t.courseName}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              type="text"
              placeholder={t.courseCode}
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />

            <div>
              <label>{t.courseColor}</label>

              <div className="color-picker-row">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="color-input"
                />

                <span>{color}</span>
              </div>
            </div>

            <button type="submit">{t.addCourse}</button>
          </form>
        </section>

        <section className="card">
          <div className="section-header">
            <h2>{t.yourCourses}</h2>

            <input
              type="text"
              placeholder={t.searchCourses}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          {filteredCourses.length === 0 ? (
            <div className="empty-state">
              <h3>📚 {t.noCoursesYet}</h3>
              <p>{t.createFirstCourse}</p>
            </div>
          ) : (
            filteredCourses.map((course) => (
              <div key={course._id} className="list-item">
                {editingCourseId === course._id ? (
                  <div className="edit-form">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />

                    <input
                      type="text"
                      value={editCode}
                      onChange={(e) => setEditCode(e.target.value)}
                    />

                    <div className="actions">
                      <button onClick={() => handleEditCourse(course._id)}>
                        {t.save}
                      </button>

                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => setEditingCourseId(null)}
                      >
                        {t.cancel}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="course-info">
                      <div
                        className="course-color"
                        style={{ backgroundColor: course.color }}
                      ></div>

                      <div>
                        <h3>{course.name}</h3>
                        <p>{course.code}</p>
                      </div>
                    </div>

                    <div className="actions">
                      <button
                        className="secondary-button"
                        onClick={() => {
                          setEditingCourseId(course._id);
                          setEditName(course.name);
                          setEditCode(course.code);
                        }}
                      >
                        {t.edit}
                      </button>

                      <button
                        className="danger-button"
                        onClick={() => {
                          setCourseToDelete(course._id);
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
          title={t.deleteCourseTitle}
          message={t.deleteCourseMessage}
          onCancel={() => {
            setShowDeleteModal(false);
            setCourseToDelete(null);
          }}
          onConfirm={handleDeleteCourse}
        />
      </main>
    </div>
  );
}

export default Courses;