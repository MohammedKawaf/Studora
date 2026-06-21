import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import api from "../services/api";
import NotificationBanner from "../components/NotificationBanner";
import ConfirmModal from "../components/ConfirmModal";

function Notes() {
  const [notes, setNotes] = useState([]);
  const [courses, setCourses] = useState([]);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [course, setCourse] = useState("");

  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [autosaveStatus, setAutosaveStatus] = useState("");

  const [selectedCourse, setSelectedCourse] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);

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

  const handleDeleteNote = async () => {
    if (!noteToDelete) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await api.delete(`/notes/${noteToDelete}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setShowDeleteModal(false);
      setNoteToDelete(null);

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

  const handleAutosaveNote = async (noteId, updatedTitle, updatedContent) => {
    if (!updatedTitle.trim() || !updatedContent.trim()) {
      return;
    }

    try {
      setAutosaveStatus("Saving...");

      const token = localStorage.getItem("token");

      await api.put(
        `/notes/${noteId}`,
        {
          title: updatedTitle.trim(),
          content: updatedContent.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAutosaveStatus("Saved automatically");

      setTimeout(() => {
        setAutosaveStatus("");
      }, 2000);
    } catch (error) {
      console.log(error.response?.data || error.message);
      setAutosaveStatus("Autosave failed");
    }
  };

  useEffect(() => {
    if (!editingNoteId) {
      return;
    }

    const autosaveTimer = setTimeout(() => {
      handleAutosaveNote(editingNoteId, editTitle, editContent);
    }, 1000);

    return () => clearTimeout(autosaveTimer);
  }, [editingNoteId, editTitle, editContent]);

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

        <NotificationBanner
          successMessage={successMessage}
          errorMessage={errorMessage}
        />

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

                    {autosaveStatus && (
                      <p className="autosave-status">{autosaveStatus}</p>
                    )}

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
                        <div className="course-badge">
                          <span
                            className="course-badge-color"
                            style={{ backgroundColor: note.course.color }}
                          ></span>

                          <span>
                            {note.course.name} ({note.course.code})
                          </span>
                        </div>
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
                        onClick={() => {
                          setNoteToDelete(note._id);
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
          title="Delete note?"
          message="Are you sure you want to delete this note? This action cannot be undone."
          onCancel={() => {
            setShowDeleteModal(false);
            setNoteToDelete(null);
          }}
          onConfirm={handleDeleteNote}
        />
      </main>
    </div>
  );
}

export default Notes;