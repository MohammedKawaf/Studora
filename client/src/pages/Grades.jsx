import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import api from "../services/api";

function Grades() {
  const [grades, setGrades] = useState([]);
  const [courses, setCourses] = useState([]);

  const [course, setCourse] = useState("");
  const [grade, setGrade] = useState("");
  const [credits, setCredits] = useState("");
  const [year, setYear] = useState("");
  const [term, setTerm] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("");

  const [editingGradeId, setEditingGradeId] = useState(null);
  const [editGrade, setEditGrade] = useState("");
  const [editCredits, setEditCredits] = useState("");
  const [editYear, setEditYear] = useState("");
  const [editTerm, setEditTerm] = useState("");

  const fetchGrades = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.get("/grades", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setGrades(response.data);
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
    fetchGrades();
    fetchCourses();
  }, []);

  const handleCreateGrade = async (e) => {
    e.preventDefault();

    if (!course || !grade || !credits || !year || !term) {
      alert("Please fill in all fields");
      return;
    }

    const selectedCourse = courses.find(
      (courseItem) => courseItem._id === course
    );

    const existingGrade = grades.find(
      (gradeItem) => gradeItem.course?._id === course
    );

    if (existingGrade) {
      alert("This course already has a grade");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await api.post(
        "/grades",
        {
          title: selectedCourse.name,
          grade,
          credits,
          year,
          term,
          course,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCourse("");
      setGrade("");
      setCredits("");
      setYear("");
      setTerm("");

      fetchGrades();
    } catch (error) {
      console.log(error.response?.data || error.message);
      alert("Could not create grade");
    }
  };

  const handleDeleteGrade = async (gradeId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this grade?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await api.delete(`/grades/${gradeId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchGrades();
    } catch (error) {
      console.log(error.response?.data || error.message);
      alert("Could not delete grade");
    }
  };

  const handleEditGrade = async (gradeId) => {
    try {
      const token = localStorage.getItem("token");

      const existingGrade = grades.find(
        (gradeItem) => gradeItem._id === gradeId
      );

      await api.put(
        `/grades/${gradeId}`,
        {
          title: existingGrade.title,
          course: existingGrade.course?._id,
          grade: editGrade,
          credits: editCredits,
          year: editYear,
          term: editTerm,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setEditingGradeId(null);
      setEditGrade("");
      setEditCredits("");
      setEditYear("");
      setEditTerm("");

      fetchGrades();
    } catch (error) {
      console.log(error.response?.data || error.message);
      alert("Could not update grade");
    }
  };

  const passedGrades = grades.filter((gradeItem) => gradeItem.grade !== "U");

  const failedGrades = grades.filter((gradeItem) => gradeItem.grade === "U");

  const totalCredits = passedGrades.reduce(
    (total, gradeItem) => total + Number(gradeItem.credits),
    0
  );

  const totalCourses = grades.length;

  const hasNumericGrades = grades.some((gradeItem) =>
    ["3", "4", "5"].includes(gradeItem.grade)
  );

  const averageGrade = (() => {
    if (hasNumericGrades) {
      const numericGrades = grades
        .map((gradeItem) => {
          switch (gradeItem.grade) {
            case "5":
              return 5;
            case "4":
              return 4;
            case "3":
              return 3;
            default:
              return null;
          }
        })
        .filter((gradeValue) => gradeValue !== null);

      if (numericGrades.length === 0) {
        return "N/A";
      }

      const average =
        numericGrades.reduce((a, b) => a + b, 0) / numericGrades.length;

      return average.toFixed(1);
    }

    const letterGrades = grades
      .map((gradeItem) => {
        switch (gradeItem.grade) {
          case "MVG":
            return 5;
          case "VG":
            return 4;
          case "G":
            return 3;
          default:
            return null;
        }
      })
      .filter((gradeValue) => gradeValue !== null);

    if (letterGrades.length === 0) {
      return "N/A";
    }

    const average =
      letterGrades.reduce((a, b) => a + b, 0) / letterGrades.length;

    if (average >= 4.5) {
      return "MVG";
    }

    if (average >= 3.5) {
      return "VG";
    }

    return "G";
  })();

  const filteredGrades = grades.filter((gradeItem) => {
    const matchesSearch = gradeItem.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesYear = selectedYear
      ? gradeItem.year.toString() === selectedYear
      : true;

    const matchesTerm = selectedTerm
      ? gradeItem.term.toString() === selectedTerm
      : true;

    const matchesGrade = selectedGrade
      ? gradeItem.grade === selectedGrade
      : true;

    return matchesSearch && matchesYear && matchesTerm && matchesGrade;
  });

  return (
    <div>
      <Navbar user={true} />

      <main className="page">
        <section className="page-header">
          <h1>Grades</h1>
          <p>Track your grades, credits and study progress.</p>
        </section>

        <section className="overview-grid">
          <div className="overview-card">
            <h3>Total Credits</h3>
            <p>{totalCredits} hp</p>
          </div>

          <div className="overview-card">
            <h3>Passed Courses</h3>
            <p>{passedGrades.length}</p>
          </div>

          <div className="overview-card">
            <h3>Failed Courses</h3>
            <p>{failedGrades.length}</p>
          </div>

          <div className="overview-card">
            <h3>{hasNumericGrades ? "Average Score" : "Average Grade"}</h3>
            <p>{averageGrade}</p>
          </div>

          <div className="overview-card">
            <h3>Total Courses</h3>
            <p>{totalCourses}</p>
          </div>
        </section>

        <section className="card">
          <h2>Add Grade</h2>

          <form onSubmit={handleCreateGrade} className="form">
            <select value={course} onChange={(e) => setCourse(e.target.value)}>
              <option value="">Select course</option>

              {courses.map((courseItem) => (
                <option key={courseItem._id} value={courseItem._id}>
                  {courseItem.name} ({courseItem.code})
                </option>
              ))}
            </select>

            <select value={grade} onChange={(e) => setGrade(e.target.value)}>
              <option value="">Select grade</option>
              <option value="U">U</option>
              <option value="G">G</option>
              <option value="VG">VG</option>
              <option value="MVG">MVG</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>

            <input
              type="number"
              step="0.5"
              placeholder="Credits / HP"
              value={credits}
              onChange={(e) => setCredits(e.target.value)}
            />

            <select value={year} onChange={(e) => setYear(e.target.value)}>
              <option value="">Select year</option>
              <option value="1">Year 1</option>
              <option value="2">Year 2</option>
              <option value="3">Year 3</option>
              <option value="4">Year 4</option>
              <option value="5">Year 5</option>
            </select>

            <select value={term} onChange={(e) => setTerm(e.target.value)}>
              <option value="">Select term</option>
              <option value="1">Term 1</option>
              <option value="2">Term 2</option>
            </select>

            <button type="submit">Add Grade</button>
          </form>
        </section>

        <section className="card">
          <h2>Your Grades</h2>

          <div className="calendar-filters">
            <input
              type="text"
              placeholder="Search grades..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <option value="">All Years</option>
              <option value="1">Year 1</option>
              <option value="2">Year 2</option>
              <option value="3">Year 3</option>
              <option value="4">Year 4</option>
              <option value="5">Year 5</option>
            </select>

            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
            >
              <option value="">All Terms</option>
              <option value="1">Term 1</option>
              <option value="2">Term 2</option>
            </select>

            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
            >
              <option value="">All Grades</option>
              <option value="U">U</option>
              <option value="G">G</option>
              <option value="VG">VG</option>
              <option value="MVG">MVG</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>
          </div>

          {filteredGrades.map((gradeItem) => (
            <div key={gradeItem._id} className="list-item">
              {editingGradeId === gradeItem._id ? (
                <div className="edit-form">
                  <select
                    value={editGrade}
                    onChange={(e) => setEditGrade(e.target.value)}
                  >
                    <option value="U">U</option>
                    <option value="G">G</option>
                    <option value="VG">VG</option>
                    <option value="MVG">MVG</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                  </select>

                  <input
                    type="number"
                    step="0.5"
                    value={editCredits}
                    onChange={(e) => setEditCredits(e.target.value)}
                  />

                  <select
                    value={editYear}
                    onChange={(e) => setEditYear(e.target.value)}
                  >
                    <option value="1">Year 1</option>
                    <option value="2">Year 2</option>
                    <option value="3">Year 3</option>
                    <option value="4">Year 4</option>
                    <option value="5">Year 5</option>
                  </select>

                  <select
                    value={editTerm}
                    onChange={(e) => setEditTerm(e.target.value)}
                  >
                    <option value="1">Term 1</option>
                    <option value="2">Term 2</option>
                  </select>

                  <div className="actions">
                    <button onClick={() => handleEditGrade(gradeItem._id)}>
                      Save
                    </button>

                    <button
                      className="secondary-button"
                      onClick={() => setEditingGradeId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <h3>{gradeItem.title}</h3>

                    <p>Grade: {gradeItem.grade}</p>

                    <p>Credits: {gradeItem.credits} hp</p>

                    <p>
                      Year {gradeItem.year}, Term {gradeItem.term}
                    </p>

                    {gradeItem.course && (
                      <p>
                        Course: {gradeItem.course.name} (
                        {gradeItem.course.code})
                      </p>
                    )}
                  </div>

                  <div className="actions">
                    <button
                      className="secondary-button"
                      onClick={() => {
                        setEditingGradeId(gradeItem._id);
                        setEditGrade(gradeItem.grade);
                        setEditCredits(gradeItem.credits);
                        setEditYear(gradeItem.year);
                        setEditTerm(gradeItem.term);
                      }}
                    >
                      Edit
                    </button>

                    <button
                      className="danger-button"
                      onClick={() => handleDeleteGrade(gradeItem._id)}
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}

export default Grades;