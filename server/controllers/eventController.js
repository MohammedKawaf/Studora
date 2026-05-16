const Event = require("../models/Event");

const createEvent = async (req, res) => {
  try {
    const { title, type, date, time, course } = req.body;

    const event = await Event.create({
      title,
      type,
      date,
      time,
      course,
      user: req.user._id,
    });

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getEvents = async (req, res) => {
  try {
    const events = await Event.find({
      user: req.user._id,
    }).populate("course", "name code color");

    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const updateEvent = async (req, res) => {
  try {
    const { title, type, date, time, course } = req.body;

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    event.title = title;
    event.type = type;
    event.date = date;
    event.time = time;
    event.course = course;

    const updatedEvent = await event.save();

    res.status(200).json(updatedEvent);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    await event.deleteOne();

    res.status(200).json({
      message: "Event deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createEvent,
  getEvents,
  updateEvent,
  deleteEvent,
};