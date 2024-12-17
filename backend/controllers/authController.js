const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ username, email, password: hashedPassword });

  await user.save();
  res.json({ message: 'User registered successfully' });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.status(400).json({ error: 'User not found' });
  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) return res.status(400).json({ error: 'Invalid password' });
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

  res.json({ token });
};
