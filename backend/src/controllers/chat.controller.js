import Chat from "../models/chat.model.js";
import User from "../models/user.model.js";

// Access or create a one-on-one chat
export const accessChat = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    console.log("UserId param not sent with request");
    return res.sendStatus(400);
  }

  // Check if a chat already exists
  var isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "fullName profilePic email",
  });

  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    // Create new chat
    var chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    try {
      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      res.status(200).send(FullChat);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }
};

// Fetch all chats for the user
// Fetch all chats for the user
export const fetchChats = async (req, res) => {
  try {
    const results = await Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    const populatedResults = await User.populate(results, {
      path: "latestMessage.sender",
      select: "fullName profilePic email",
    });

    res.status(200).send(populatedResults);
  } catch (error) {
    console.error("Error in fetchChats: ", error.message);
    res.status(500).send(error.message);
  }
};

// Create a group chat
export const createGroupChat = async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: "Please Fill all the feilds" });
  }

  var users = JSON.parse(req.body.users);

  if (users.length < 2) {
    return res
      .status(400)
      .send("More than 2 users are required to form a group chat");
  }

  users.push(req.user);

  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user,
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(fullGroupChat);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

// Rename a group chat
export const renameGroup = async (req, res) => {
  const { chatId, chatName } = req.body;

  const chat = await Chat.findById(chatId);
  if (!chat) return res.status(404).send("Chat Not Found");

  // Check Admin
  if (chat.groupAdmin.toString() !== req.user._id.toString()) {
     return res.status(403).send("Only Admins can perform this action");
  }

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      chatName: chatName,
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  res.json(updatedChat);
};

// Add user to group
export const addToGroup = async (req, res) => {
  const { chatId, userId } = req.body;

  const chat = await Chat.findById(chatId);
  if (!chat) return res.status(404).send("Chat Not Found");

  if (chat.groupAdmin.toString() !== req.user._id.toString()) {
    return res.status(403).send("Only Admins can perform this action");
  }

  const added = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!added) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(added);
  }
};

// Remove user from group
export const removeFromGroup = async (req, res) => {
  const { chatId, userId } = req.body;

  const chat = await Chat.findById(chatId);
  if (!chat) return res.status(404).send("Chat Not Found");

  // Allow admin to remove anyone, or user to remove themselves (leave group)
  if (chat.groupAdmin.toString() !== req.user._id.toString() && userId !== req.user._id.toString()) {
     return res.status(403).send("Only Admins can remove users");
  }

  const removed = await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!removed) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(removed);
  }
};

// Delete Group
export const deleteGroup = async (req, res) => {
    const { id: chatId } = req.params;

    try {
        const chat = await Chat.findById(chatId);
        if (!chat) return res.status(404).send("Chat Not Found");

        // Check Admin
        if (chat.groupAdmin.toString() !== req.user._id.toString()) {
            return res.status(403).send("Only Admins can delete the group");
        }
        
        await Chat.findByIdAndDelete(chatId);
        res.status(200).json({ message: "Group deleted successfully", _id: chatId });
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
};
