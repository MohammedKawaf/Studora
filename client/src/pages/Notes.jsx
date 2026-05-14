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

    try {
      const token = localStorage.getItem("token");

      await api.post(
        "/notes",
        {
          title,
          content,
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
    } catch (error) {
      console.log(error.response?.data || error.message);
      alert("Could not create note");
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
    } catch (error) {
      console.log(error.response?.data || error.message);
      alert("Could not delete note");
    }
  };

  const handleEditNote = async (noteId) => {
    try {
      const token = localStorage.getItem("token");

      await api.put(
        `/notes/${noteId}`,
        {
          title: editTitle,
          content: editContent,
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
    } catch (error) {
      console.log(error.response?.data || error.message);
      alert("Could not update note");
    }
  };

  const filteredNotes = notes.filter((note) => {
    if (!selectedCourse) {
      return true;
    }

    return note.course?._id === selectedCourse;
  });

  return (
    <div>
      <Navbar user={true} />

      <h1>Notes</h1>

      <h2>Create Note</h2>

      <form onSubmit={handleCreateNote}>
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

      <h2>Your Notes</h2>

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

      {filteredNotes.map((note) => (
        <div key={note._id}>
          {editingNoteId === note._id ? (
            <>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />

              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
              />

              <button onClick={() => handleEditNote(note._id)}>Save</button>

              <button onClick={() => setEditingNoteId(null)}>Cancel</button>
            </>
          ) : (
            <>
              <h3>{note.title}</h3>

              <p>{note.content}</p>

              {note.course && (
                <p>
                  Course: {note.course.name} ({note.course.code})
                </p>
              )}

              <button
                onClick={() => {
                  setEditingNoteId(note._id);
                  setEditTitle(note.title);
                  setEditContent(note.content);
                }}
              >
                Edit Note
              </button>

              <button onClick={() => handleDeleteNote(note._id)}>
                Delete Note
              </button>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

export default Notes;