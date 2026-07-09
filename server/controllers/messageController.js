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
  getUnreadMessages,
  markMessagesAsRead,
};