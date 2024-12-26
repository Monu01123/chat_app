const Message = require("../models/message.model");
const User = require("../models/user.model");
const cloudinary = require("../cloudanary");

const sendMessage = async (req, res) => {
  try {
    const { text } = req.body; // Extract text
    const { id: receiverId } = req.params; 
    const senderId = req.user._id; 

    let imageUrl = null;
    if (req.file) { // Check if file is present
      try {
        const uploadResponse = await cloudinary.uploader.upload_stream(
          {
            folder: "chat_app",
          },
          (error, result) => {
            if (error) {
              throw error;
            }
            return result;
          }
        ).end(req.file.buffer); // Use buffer from multer
        imageUrl = uploadResponse.secure_url;
      } catch (err) {
        console.error("Error uploading image to Cloudinary: ", err.message);
        return res.status(500).json({ error: "Image upload failed" });
      }
    }

    const newMessage = new Message({
      sender: senderId,  
      receiver: receiverId,  
      text,
      image: imageUrl,
    });

    await newMessage.save();

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};


const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    console.log("Logged in user ID:", loggedInUserId);

    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    console.log("Filtered users:", filteredUsers);

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { sendMessage, getUsersForSidebar, getMessages };
