const Message = require("../models/Message");
const Friend = require("../models/Friend");

const sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;

    if (!receiverId || !content.trim()) {
      return res.status(400).json({
        message: "Receiver and message content are required",
      });
    }

    const friendship = await Friend.findOne({
      users: {
        $all: [req.user._id, receiverId],
      },
    });

    if (!friendship) {
      return res.status(401).json({
        message: "You can only message your friends",
      });
    }

    const message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      content: content.trim(),
    });

    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "username email profileImage")
      .populate("receiver", "username email profileImage");

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getConversation = async (req, res) => {
  try {
    const friendId = req.params.friendId;

    const friendship = await Friend.findOne({
      users: {
        $all: [req.user._id, friendId],
      },
    });

    if (!friendship) {
      return res.status(401).json({
        message: "You can only view conversations with your friends",
      });
    }

    const messages = await Message.find({
      $or: [
        {
          sender: req.user._id,
          receiver: friendId,
        },
        {
          sender: friendId,
          receiver: req.user._id,
        },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("sender", "username email profileImage")
      .populate("receiver", "username email profileImage");

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  sendMessage,
  getConversation,
};