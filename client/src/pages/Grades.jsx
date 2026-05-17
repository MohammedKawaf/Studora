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

    const selectedCourse = courses.find((courseItem) => courseItem._id === course);

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

  return (
    <div>
      <Navbar user={true} />

      <main className="page">
        <section className="page-header">
          <h1>Grades</h1>
          <p>Track your grades, credits and study progress.</p>
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

          {grades.map((gradeItem) => (
            <div key={gradeItem._id} className="list-item">
              <div>
                <h3>{gradeItem.title}</h3>

                <p>Grade: {gradeItem.grade}</p>

                <p>Credits: {gradeItem.credits} hp</p>

                <p>
                  Year {gradeItem.year}, Term {gradeItem.term}
                </p>

                {gradeItem.course && (
                  <p>
                    Course: {gradeItem.course.name} ({gradeItem.course.code})
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

export default Grades;