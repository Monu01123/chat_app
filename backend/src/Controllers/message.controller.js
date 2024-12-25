const sendMessages = async (req, res) => {
  const { sender, receiver, text, image } = req.body;
  if (!sender || !receiver) {
    return res
      .status(400)
      .json({ message: "Sender and receiver are required." });
  }
  try {
    const newMessage = new Message({
      sender,
      receiver,
      text,
      image,
    });

    const savedMessage = await newMessage.save();
    res.status(201).json(savedMessage);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error sending message.", error: err.message });
  }
};



module.exports = { sendMessages };
