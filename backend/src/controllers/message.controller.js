import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import Chat from "../models/chat.model.js";

import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import { translate } from 'google-translate-api-x';

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: chatId } = req.params;

    // Fetch messages belonging to this chat ID
    const messages = await Message.find({ chat: chatId })
      .populate("senderId", "fullName profilePic email")
      .populate("chat");

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image, chatId, lockedDuration } = req.body;
    const { id: routeChatId } = req.params; 
    const senderId = req.user._id;

    // Fetch chat to get participants
    const chatRoom = await Chat.findById(routeChatId).populate("users");
    if(!chatRoom) return res.status(404).json({error: "Chat not found"});

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    let lockedUntil = null;
    if (lockedDuration && lockedDuration > 0) {
        lockedUntil = new Date(Date.now() + lockedDuration * 1000); // Duration in seconds
    }

    const translations = {};
    if (text) {
        // Get unique languages of recipients (excluding sender if you want, but good to have all)
        // Actually, let's just translate for everyone in the chat who has a different language than sender?
        // Or just map all unique preferred languages in the chat.
        const userLanguages = new Set(chatRoom.users.map(u => u.language || 'en'));
        
        for (const lang of userLanguages) {
            try {
                if (lang === 'en' && !text) continue; // Skip if no text - handled outside
                const res = await translate(text, { to: lang });
                translations[lang] = res.text;
            } catch (err) {
                console.error(`Translation error for ${lang}:`, err.message);
                translations[lang] = text; // Fallback to original
            }
        }
    }

    var newMessage = {
      senderId: senderId,
      text: text,
      image: imageUrl,
      chat: routeChatId,
      readBy: [], 
      reactions: [],
      lockedUntil: lockedUntil,
      translations: translations
    };

    var message = await Message.create(newMessage);

    message = await message.populate("senderId", "fullName profilePic");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "fullName profilePic email",
    });

    // Update latest message in Chat
    await Chat.findByIdAndUpdate(routeChatId, {
      latestMessage: message,
    });

    // Emit socket event
    io.in(routeChatId).emit("newGroupMessage", message); 

    res.status(201).json(message);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const reactToMessage = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ error: "Message not found" });

    // Check if user already reacted
    const existingReactionIndex = message.reactions.findIndex(
      (r) => r.from.toString() === userId.toString()
    );

    if (existingReactionIndex !== -1) {
       // User reacted previously
       if (message.reactions[existingReactionIndex].emoji === emoji) {
           // Same emoji -> Remove it (Toggle)
           message.reactions.splice(existingReactionIndex, 1);
       } else {
           // Different emoji -> Update it
           message.reactions[existingReactionIndex].emoji = emoji;
       }
    } else {
       // New reaction
       message.reactions.push({ from: userId, emoji });
    }

    await message.save();
    
    // Populate necessary fields before emitting
    // We don't strictly need full populations for just a small update, 
    // but the frontend expects consistency. 
    // Minimal emission: { messageId, reactions }
    
    // Emit event to the chat room
    io.in(message.chat.toString()).emit("reactionUpdated", { 
        messageId: message._id, 
        reactions: message.reactions 
    });

    res.status(200).json(message);

  } catch (error) {
    console.log("Error in reactToMessage: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
