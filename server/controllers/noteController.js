const Note = require("../models/Note");

const createNote = async (req, res) => {
  try {
    const { title, content, course } = req.body;

    const note = await Note.create({
      title,
      content,
      course,
      user: req.user._id,
    });

    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getNotes = async (req, res) => {
  try {
    const notes = await Note.find({
      user: req.user._id,
    }).populate("course", "name code");

    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        message: "Note not found",
      });
    }

    if (note.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        message: "Not authorized",
      });
    }

    await note.deleteOne();

    res.status(200).json({
      message: "Note deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createNote,
  getNotes,
  deleteNote,
};