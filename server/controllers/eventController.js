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

module.exports = {
  createEvent,
  getEvents,
};