import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import api from "../services/api";
import NotificationBanner from "../components/NotificationBanner";
import ConfirmModal from "../components/ConfirmModal";

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

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [gradeToDelete, setGradeToDelete] = useState(null);

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
      showErrorMessage("Please fill in all fields");
      return;
    }

    if (Number(credits) <= 0) {
      showErrorMessage("Credits must be greater than 0");
      return;
    }

    const selectedCourse = courses.find(
      (courseItem) => courseItem._id === course
    );

    const existingGrade = grades.find(
      (gradeItem) => gradeItem.course?._id === course
    );

    if (existingGrade) {
      showErrorMessage("This course already has a grade");
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
      showSuccessMessage("Grade added successfully");
    } catch (error) {
      console.log(error.response?.data || error.message);
      showErrorMessage("Could not create grade");
    }
  };

  const handleDeleteGrade = async () => {
    if (!gradeToDelete) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await api.delete(`/grades/${gradeToDelete}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setShowDeleteModal(false);
      setGradeToDelete(null);

      fetchGrades();
      showSuccessMessage("Grade deleted successfully");
    } catch (error) {
      console.log(error.response?.data || error.message);
      showErrorMessage("Could not delete grade");
    }
  };

  const handleEditGrade = async (gradeId) => {
    if (!editGrade || !editCredits || !editYear || !editTerm) {
      showErrorMessage("Please fill in all fields");
      return;
    }

    if (Number(editCredits) <= 0) {
      showErrorMessage("Credits must be greater than 0");
      return;
    }

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
      showSuccessMessage("Grade updated successfully");
    } catch (error) {
      console.log(error.response?.data || error.message);
      showErrorMessage("Could not update grade");
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
          if (gradeItem.grade === "5") return 5;
          if (gradeItem.grade === "4") return 4;
          if (gradeItem.grade === "3") return 3;
          return null;
        })
        .filter((gradeValue) => gradeValue !== null);

      if (numericGrades.length === 0) return "N/A";

      const average =
        numericGrades.reduce((a, b) => a + b, 0) / numericGrades.length;

      return average.toFixed(1);
    }

    const letterGrades = grades
      .map((gradeItem) => {
        if (gradeItem.grade === "MVG") return 5;
        if (gradeItem.grade === "VG") return 4;
        if (gradeItem.grade === "G") return 3;
        return null;
      })
      .filter((gradeValue) => gradeValue !== null);

    if (letterGrades.length === 0) return "N/A";

    const average =
      letterGrades.reduce((a, b) => a + b, 0) / letterGrades.length;

    if (average >= 4.5) return "MVG";
    if (average >= 3.5) return "VG";
    return "G";
  })();

  const numericGradeSystem = ["U", "3", "4", "5"];
  const letterGradeSystem = ["U", "G", "VG", "MVG"];

  const hasOnlyNumericSystem = grades.some((gradeItem) =>
    ["3", "4", "5"].includes(gradeItem.grade)
  );

  const gradeChartLabels = hasOnlyNumericSystem
    ? numericGradeSystem
    : letterGradeSystem;

  const gradeChartData = gradeChartLabels.map((gradeLabel) => {
    return {
      label: gradeLabel,
      count: grades.filter((gradeItem) => gradeItem.grade === gradeLabel).length,
    };
  });

  const maxGradeCount = Math.max(
    ...gradeChartData.map((gradeItem) => gradeItem.count),
    1
  );

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

  const [creditGoal, setCreditGoal] = useState(() => {
    return localStorage.getItem("creditGoal") || "180";
  });

  useEffect(() => {
    localStorage.setItem("creditGoal", creditGoal);
  }, [creditGoal]);

  return (
    <div>
      <Navbar user={true} />

      <main className="page">
        <section className="page-header">
          <h1>Grades</h1>
          <p>Track your grades, credits and study progress.</p>
        </section>

        <NotificationBanner
          successMessage={successMessage}
          errorMessage={errorMessage}
        />

        <section className="card">
          <h2>Grade Overview</h2>

          <div className="overview-grid">
            <div className="overview-card">
              <h3>Total Credits</h3>
              <p>{totalCredits} / {creditGoal} hp</p>
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
          </div>
        </section>

        <section className="card grade-chart-card">
          <h2>Grade Chart</h2>

          {grades.length === 0 ? (
            <div className="empty-state">
              <h3>📊 No grade data yet</h3>
              <p>Add grades to see your grade distribution.</p>
            </div>
          ) : (
            <div className="grade-chart">
              {gradeChartData.map((gradeItem) => (
                <div key={gradeItem.label} className="grade-chart-row">
                  <div className="grade-chart-label">{gradeItem.label}</div>

                  <div className="grade-chart-track">
                    <div
                      className="grade-chart-bar"
                      style={{
                        width: `${(gradeItem.count / maxGradeCount) * 100}%`,
                      }}
                    ></div>
                  </div>

                  <div className="grade-chart-count">{gradeItem.count}</div>
                </div>
              ))}
            </div>
          )}
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

          {filteredGrades.length === 0 ? (
            <div className="empty-state">
              <h3>📈 No grades yet</h3>
              <p>Add your grades to track your study progress.</p>
            </div>
          ) : (
            filteredGrades.map((gradeItem) => (
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
                        <div className="course-badge">
                          <span
                            className="course-badge-color"
                            style={{ backgroundColor: gradeItem.course.color }}
                          ></span>

                          <span>
                            {gradeItem.course.name} ({gradeItem.course.code})
                          </span>
                        </div>
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
                        onClick={() => {
                          setGradeToDelete(gradeItem._id);
                          setShowDeleteModal(true);
                        }}
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

        <ConfirmModal
          isOpen={showDeleteModal}
          title="Delete grade?"
          message="Are you sure you want to delete this grade? This action cannot be undone."
          onCancel={() => {
            setShowDeleteModal(false);
            setGradeToDelete(null);
          }}
          onConfirm={handleDeleteGrade}
        />
        
      </main>
    </div>
  );
}

export default Grades;