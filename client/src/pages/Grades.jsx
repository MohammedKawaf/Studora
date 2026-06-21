import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import api from "../services/api";
import NotificationBanner from "../components/NotificationBanner";
import ConfirmModal from "../components/ConfirmModal";
import translations from "../translations";

function Grades() {
  const language = localStorage.getItem("language") || "en";
  const t = translations[language];

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
      showErrorMessage(t.pleaseFillAllFields);
      return;
    }

    if (Number(credits) <= 0) {
      showErrorMessage(t.creditsMustBeGreaterThanZero);
      return;
    }

    const selectedCourse = courses.find(
      (courseItem) => courseItem._id === course
    );

    const existingGrade = grades.find(
      (gradeItem) => gradeItem.course?._id === course
    );

    if (existingGrade) {
      showErrorMessage(t.courseAlreadyHasGrade);
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
      showSuccessMessage(t.gradeAddedSuccessfully);
    } catch (error) {
      console.log(error.response?.data || error.message);
      showErrorMessage(t.couldNotCreateGrade);
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
      showSuccessMessage(t.gradeDeletedSuccessfully);
    } catch (error) {
      console.log(error.response?.data || error.message);
      showErrorMessage(t.couldNotDeleteGrade);
    }
  };

  const handleEditGrade = async (gradeId) => {
    if (!editGrade || !editCredits || !editYear || !editTerm) {
      showErrorMessage(t.pleaseFillAllFields);
      return;
    }

    if (Number(editCredits) <= 0) {
      showErrorMessage(t.creditsMustBeGreaterThanZero);
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
      showSuccessMessage(t.gradeUpdatedSuccessfully);
    } catch (error) {
      console.log(error.response?.data || error.message);
      showErrorMessage(t.couldNotUpdateGrade);
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
      count: grades.filter((gradeItem) => gradeItem.grade === gradeLabel)
        .length,
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
          <h1>{t.grades}</h1>
          <p>{t.gradesSubtitle}</p>
        </section>

        <NotificationBanner
          successMessage={successMessage}
          errorMessage={errorMessage}
        />

        <section className="card">
          <h2>{t.gradeOverview}</h2>

          <div className="overview-grid">
            <div className="overview-card">
              <h3>{t.totalCredits}</h3>
              <p>
                {totalCredits} / {creditGoal} hp
              </p>
            </div>

            <div className="overview-card">
              <h3>{t.passedCourses}</h3>
              <p>{passedGrades.length}</p>
            </div>

            <div className="overview-card">
              <h3>{t.failedCourses}</h3>
              <p>{failedGrades.length}</p>
            </div>

            <div className="overview-card">
              <h3>{hasNumericGrades ? t.averageScore : t.averageGrade}</h3>
              <p>{averageGrade}</p>
            </div>

            <div className="overview-card">
              <h3>{t.totalCourses}</h3>
              <p>{totalCourses}</p>
            </div>
          </div>
        </section>

        <section className="card grade-chart-card">
          <h2>{t.gradeChart}</h2>

          {grades.length === 0 ? (
            <div className="empty-state">
              <h3>📊 {t.noGradeDataYet}</h3>
              <p>{t.addGradesToSeeDistribution}</p>
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
          <h2>{t.addGrade}</h2>

          <form onSubmit={handleCreateGrade} className="form">
            <select value={course} onChange={(e) => setCourse(e.target.value)}>
              <option value="">{t.selectCourse}</option>

              {courses.map((courseItem) => (
                <option key={courseItem._id} value={courseItem._id}>
                  {courseItem.name} ({courseItem.code})
                </option>
              ))}
            </select>

            <select value={grade} onChange={(e) => setGrade(e.target.value)}>
              <option value="">{t.selectGrade}</option>
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
              placeholder={t.creditsHp}
              value={credits}
              onChange={(e) => setCredits(e.target.value)}
            />

            <select value={year} onChange={(e) => setYear(e.target.value)}>
              <option value="">{t.selectYear}</option>
              <option value="1">{t.year} 1</option>
              <option value="2">{t.year} 2</option>
              <option value="3">{t.year} 3</option>
              <option value="4">{t.year} 4</option>
              <option value="5">{t.year} 5</option>
            </select>

            <select value={term} onChange={(e) => setTerm(e.target.value)}>
              <option value="">{t.selectTerm}</option>
              <option value="1">{t.term} 1</option>
              <option value="2">{t.term} 2</option>
            </select>

            <button type="submit">{t.addGrade}</button>
          </form>
        </section>

        <section className="card">
          <h2>{t.yourGrades}</h2>

          <div className="calendar-filters">
            <input
              type="text"
              placeholder={t.searchGrades}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <option value="">{t.allYears}</option>
              <option value="1">{t.year} 1</option>
              <option value="2">{t.year} 2</option>
              <option value="3">{t.year} 3</option>
              <option value="4">{t.year} 4</option>
              <option value="5">{t.year} 5</option>
            </select>

            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
            >
              <option value="">{t.allTerms}</option>
              <option value="1">{t.term} 1</option>
              <option value="2">{t.term} 2</option>
            </select>

            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
            >
              <option value="">{t.allGrades}</option>
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
              <h3>📈 {t.noGradesYet}</h3>
              <p>{t.addGradesToTrackProgress}</p>
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
                      <option value="1">{t.year} 1</option>
                      <option value="2">{t.year} 2</option>
                      <option value="3">{t.year} 3</option>
                      <option value="4">{t.year} 4</option>
                      <option value="5">{t.year} 5</option>
                    </select>

                    <select
                      value={editTerm}
                      onChange={(e) => setEditTerm(e.target.value)}
                    >
                      <option value="1">{t.term} 1</option>
                      <option value="2">{t.term} 2</option>
                    </select>

                    <div className="actions">
                      <button onClick={() => handleEditGrade(gradeItem._id)}>
                        {t.save}
                      </button>

                      <button
                        className="secondary-button"
                        onClick={() => setEditingGradeId(null)}
                      >
                        {t.cancel}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <h3>{gradeItem.title}</h3>
                      <p>
                        {t.grade}: {gradeItem.grade}
                      </p>
                      <p>
                        {t.credits}: {gradeItem.credits} hp
                      </p>
                      <p>
                        {t.year} {gradeItem.year}, {t.term} {gradeItem.term}
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
                        {t.edit}
                      </button>

                      <button
                        className="danger-button"
                        onClick={() => {
                          setGradeToDelete(gradeItem._id);
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
          title={t.deleteGradeTitle}
          message={t.deleteGradeMessage}
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