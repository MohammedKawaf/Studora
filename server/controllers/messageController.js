const Message = require("../models/Message");
const Friend = require("../models/Friend");

const EDIT_TIME_LIMIT_MINUTES = 5;

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

const editMessage = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        message: "Message content is required",
      });
    }

    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        message: "Message not found",
      });
    }

    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        message: "Not authorized",
      });
    }

    if (message.isDeleted) {
      return res.status(400).json({
        message: "Deleted messages cannot be edited",
      });
    }

    const messageAgeInMinutes =
      (Date.now() - new Date(message.createdAt).getTime()) / 1000 / 60;

    if (messageAgeInMinutes > EDIT_TIME_LIMIT_MINUTES) {
      return res.status(400).json({
        message: "You can only edit messages within 5 minutes",
      });
    }

    message.content = content.trim();
    message.isEdited = true;

    await message.save();

    const updatedMessage = await Message.findById(message._id)
      .populate("sender", "username email profileImage")
      .populate("receiver", "username email profileImage");

    res.status(200).json(updatedMessage);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        message: "Message not found",
      });
    }

    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        message: "Not authorized",
      });
    }

    message.content = "deleted";
    message.isDeleted = true;

    await message.save();

    const deletedMessage = await Message.findById(message._id)
      .populate("sender", "username email profileImage")
      .populate("receiver", "username email profileImage");

    res.status(200).json(deletedMessage);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getUnreadMessages = async (req, res) => {
  try {
    const unreadMessages = await Message.find({
      receiver: req.user._id,
      isRead: false,
    });

    const unreadCounts = {};

    unreadMessages.forEach((message) => {
      const senderId = message.sender.toString();

      unreadCounts[senderId] = (unreadCounts[senderId] || 0) + 1;
    });

    res.status(200).json(unreadCounts);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const markMessagesAsRead = async (req, res) => {
  try {
    const friendId = req.params.friendId;

    await Message.updateMany(
      {
        sender: friendId,
        receiver: req.user._id,
        isRead: false,
      },
      {
        isRead: true,
      }
    );

    res.status(200).json({
      message: "Messages marked as read",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  sendMessage,
  getConversation,
  editMessage,
  deleteMessage,
  getUnreadMessages,
  markMessagesAsRead,
};