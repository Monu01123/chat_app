const Message = require("../models/message.model");
const User = require("../models/user.model");
const cloudinary = require("../cloudanary");

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

const sendMessage = async (req, res) => {
  try {
    const { text } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl = null;

    if (req.file) {
      try {
        // Upload file buffer to Cloudinary
        const uploadResponse = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: "chat_app" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(req.file.buffer); // Send file buffer to Cloudinary
        });

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
    console.error("Error in sendMessage controller:", error.message);
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
