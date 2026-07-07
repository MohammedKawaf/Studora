const User = require("../models/User");
const Friend = require("../models/Friend");
const FriendRequest = require("../models/FriendRequest");

const sendFriendRequest = async (req, res) => {
  try {
    const { receiverId } = req.body;

    if (!receiverId) {
      return res.status(400).json({
        message: "Receiver id is required",
      });
    }

    if (receiverId === req.user._id.toString()) {
      return res.status(400).json({
        message: "You cannot send a friend request to yourself",
      });
    }

    const receiver = await User.findById(receiverId);

    if (!receiver) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const existingFriend = await Friend.findOne({
      users: {
        $all: [req.user._id, receiverId],
      },
    });

    if (existingFriend) {
      return res.status(400).json({
        message: "You are already friends",
      });
    }

    const existingRequest = await FriendRequest.findOne({
      sender: req.user._id,
      receiver: receiverId,
      status: "pending",
    });

    if (existingRequest) {
      return res.status(400).json({
        message: "Friend request already sent",
      });
    }

    const reverseRequest = await FriendRequest.findOne({
      sender: receiverId,
      receiver: req.user._id,
      status: "pending",
    });

    if (reverseRequest) {
      return res.status(400).json({
        message: "This user has already sent you a friend request",
      });
    }

    const friendRequest = await FriendRequest.create({
      sender: req.user._id,
      receiver: receiverId,
    });

    res.status(201).json(friendRequest);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getFriendRequests = async (req, res) => {
  try {
    const requests = await FriendRequest.find({
      receiver: req.user._id,
      status: "pending",
    }).populate("sender", "username email school program studyYear profileImage lastActive");

    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const acceptFriendRequest = async (req, res) => {
  try {
    const request = await FriendRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        message: "Friend request not found",
      });
    }

    if (request.receiver.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        message: "Not authorized",
      });
    }

    const existingFriend = await Friend.findOne({
      users: {
        $all: [request.sender, request.receiver],
      },
    });

    if (!existingFriend) {
      await Friend.create({
        users: [request.sender, request.receiver],
      });
    }

    request.status = "accepted";
    await request.save();

    res.status(200).json({
      message: "Friend request accepted",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const declineFriendRequest = async (req, res) => {
  try {
    const request = await FriendRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        message: "Friend request not found",
      });
    }

    if (request.receiver.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        message: "Not authorized",
      });
    }

    request.status = "declined";
    await request.save();

    res.status(200).json({
      message: "Friend request declined",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getFriends = async (req, res) => {
  try {
    const friendships = await Friend.find({
      users: req.user._id,
    }).populate("users", "username email school program studyYear profileImage lastActive");

    const friends = friendships.map((friendship) => {
      return friendship.users.find(
        (user) => user._id.toString() !== req.user._id.toString()
      );
    });

    res.status(200).json(friends);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const searchUsers = async (req, res) => {
  try {
    const searchTerm = req.query.search || "";

    if (!searchTerm.trim()) {
      return res.status(200).json([]);
    }

    const users = await User.find({
      _id: { $ne: req.user._id },
      $or: [
        { username: { $regex: searchTerm, $options: "i" } },
        { email: { $regex: searchTerm, $options: "i" } },
        { school: { $regex: searchTerm, $options: "i" } },
        { program: { $regex: searchTerm, $options: "i" } },
      ],
    }).select("username email school program studyYear profileImage lastActive");

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  sendFriendRequest,
  getFriendRequests,
  acceptFriendRequest,
  declineFriendRequest,
  getFriends,
  searchUsers,
};