import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import api from "../services/api";

function Courses() {
  const [courses, setCourses] = useState([]);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [color, setColor] = useState("#2563eb");
  const [user, setUser] = useState(null);

  const [editingCourseId, setEditingCourseId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editCode, setEditCode] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

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

    try {
      const token = localStorage.getItem("token");

      await api.post(
        "/courses",
        { name, code, color },
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
    } catch (error) {
      console.log(error.response?.data || error.message);
      alert("Could not create course");
    }
  };

  const handleDeleteCourse = async (courseId, courseName) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${courseName}?`
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await api.delete(`/courses/${courseId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchCourses();
    } catch (error) {
      console.log(error.response?.data || error.message);
      alert("Could not delete course");
    }
  };

  const handleEditCourse = async (courseId) => {
    try {
      const token = localStorage.getItem("token");

      await api.put(
        `/courses/${courseId}`,
        {
          name: editName,
          code: editCode,
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
    } catch (error) {
      console.log(error.response?.data || error.message);
      alert("Could not update course");
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
          <h1>Courses</h1>
          {user && <p>Welcome, {user.username}</p>}
        </section>

        <section className="card">
          <h2>Create Course</h2>

          <form onSubmit={handleCreateCourse} className="form">
            <input
              type="text"
              placeholder="Course name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              type="text"
              placeholder="Course code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />

            <div>
              <label>Course color</label>

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

            <button type="submit">Add Course</button>
          </form>
        </section>

        <section className="card">
          <div className="section-header">
            <h2>Your Courses</h2>

            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          {filteredCourses.length === 0 ? (
            <p>No courses found.</p>
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
                        Save
                      </button>

                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => setEditingCourseId(null)}
                      >
                        Cancel
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
                        Edit
                      </button>

                      <button
                        className="danger-button"
                        onClick={() =>
                          handleDeleteCourse(course._id, course.name)
                        }
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

export default Courses;