import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import api from "../services/api";

function Notes() {
  const [notes, setNotes] = useState([]);
  const [courses, setCourses] = useState([]);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [course, setCourse] = useState("");

  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  const [selectedCourse, setSelectedCourse] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

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

  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.get("/notes", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setNotes(response.data);
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
    fetchNotes();
    fetchCourses();
  }, []);

  const handleCreateNote = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim() || !course) {
      showErrorMessage("Please fill in title, content and course");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await api.post(
        "/notes",
        {
          title: title.trim(),
          content: content.trim(),
          course,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTitle("");
      setContent("");
      setCourse("");

      fetchNotes();
      showSuccessMessage("Note created successfully");
    } catch (error) {
      console.log(error.response?.data || error.message);
      showErrorMessage("Could not create note");
    }
  };

  const handleDeleteNote = async (noteId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this note?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await api.delete(`/notes/${noteId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchNotes();
      showSuccessMessage("Note deleted successfully");
    } catch (error) {
      console.log(error.response?.data || error.message);
      showErrorMessage("Could not delete note");
    }
  };

  const handleEditNote = async (noteId) => {
    if (!editTitle.trim() || !editContent.trim()) {
      showErrorMessage("Please fill in title and content");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await api.put(
        `/notes/${noteId}`,
        {
          title: editTitle.trim(),
          content: editContent.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setEditingNoteId(null);
      setEditTitle("");
      setEditContent("");

      fetchNotes();
      showSuccessMessage("Note updated successfully");
    } catch (error) {
      console.log(error.response?.data || error.message);
      showErrorMessage("Could not update note");
    }
  };

  const filteredNotes = notes.filter((note) => {
    const matchesCourse = selectedCourse
      ? note.course?._id === selectedCourse
      : true;

    const matchesSearch =
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCourse && matchesSearch;
  });

  return (
    <div>
      <Navbar user={true} />

      <main className="page">
        <section className="page-header">
          <h1>Notes</h1>
          <p>Create, edit and organize your course notes.</p>
        </section>

        {successMessage && (
          <div className="success-banner">{successMessage}</div>
        )}

        {errorMessage && <div className="error-banner">{errorMessage}</div>}

        <section className="card">
          <h2>Create Note</h2>

          <form onSubmit={handleCreateNote} className="form">
            <input
              type="text"
              placeholder="Note title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <textarea
              placeholder="Write your note here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />

            <select value={course} onChange={(e) => setCourse(e.target.value)}>
              <option value="">Select course</option>

              {courses.map((courseItem) => (
                <option key={courseItem._id} value={courseItem._id}>
                  {courseItem.name}
                </option>
              ))}
            </select>

            <button type="submit">Add Note</button>
          </form>
        </section>

        <section className="card">
          <h2>Your Notes</h2>

          <div className="calendar-filters">
            <input
              type="text"
              placeholder="Search notes..."
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
          </div>

          {filteredNotes.length === 0 ? (
            <div className="empty-state">
              <h3>📝 No notes yet</h3>
              <p>Create notes for your courses and study material.</p>
            </div>
          ) : (
            filteredNotes.map((note) => (
              <div key={note._id} className="list-item">
                {editingNoteId === note._id ? (
                  <div className="edit-form">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                    />

                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                    />

                    <div className="actions">
                      <button onClick={() => handleEditNote(note._id)}>
                        Save
                      </button>

                      <button
                        className="secondary-button"
                        onClick={() => setEditingNoteId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <h3>{note.title}</h3>

                      <p>{note.content}</p>

                      {note.course && (
                        <p>
                          Course: {note.course.name} ({note.course.code})
                        </p>
                      )}
                    </div>

                    <div className="actions">
                      <button
                        className="secondary-button"
                        onClick={() => {
                          setEditingNoteId(note._id);
                          setEditTitle(note.title);
                          setEditContent(note.content);
                        }}
                      >
                        Edit
                      </button>

                      <button
                        className="danger-button"
                        onClick={() => handleDeleteNote(note._id)}
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

export default Notes;