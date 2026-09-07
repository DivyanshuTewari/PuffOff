const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

const sendTokenCookie = (res, token) => {
  res.cookie('token', token, {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
};

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (typeof username !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ success: false, message: 'Please provide valid strings for all fields' });
    }

    const cleanUsername = username.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanUsername || !cleanEmail || !password) {
      return res.status(400).json({ success: false, message: 'Please fill all fields' });
    }

    if (cleanUsername.length < 3 || cleanUsername.length > 30) {
      return res.status(400).json({ success: false, message: 'Username must be between 3 and 30 characters' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    const exists = await User.findOne({
      $or: [{ email: cleanEmail }, { username: cleanUsername }],
    });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Username or email already exists' });
    }

    const user = await User.create({ username: cleanUsername, email: cleanEmail, password });
    const token = generateToken(user._id);
    sendTokenCookie(res, token);

    res.status(201).json({
      success: true,
      token,
      user: { _id: user._id, username: user.username, email: user.email, createdAt: user.createdAt },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Username or email already exists' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ success: false, message: 'Please provide valid credentials' });
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: cleanEmail }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);
    sendTokenCookie(res, token);

    res.json({
      success: true,
      token,
      user: { _id: user._id, username: user.username, email: user.email, createdAt: user.createdAt },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/auth/logout
const logout = async (req, res) => {
  res.cookie('token', '', { expires: new Date(0), httpOnly: true });
  res.json({ success: true, message: 'Logged out successfully' });
};

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      user: { _id: user._id, username: user.username, email: user.email, bio: user.bio, profileImage: user.profileImage, dob: user.dob, emergencyContacts: user.emergencyContacts, currency: user.currency, createdAt: user.createdAt },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const { username, dob, profileImage, bio, emergencyContacts, currency } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (username !== undefined) {
      if (typeof username !== 'string' || username.trim().length < 3) {
        return res.status(400).json({ success: false, message: 'Username must be at least 3 characters' });
      }
      const cleanUsername = username.trim();
      if (cleanUsername !== user.username) {
        const existing = await User.findOne({ username: cleanUsername, _id: { $ne: user._id } });
        if (existing) {
          return res.status(400).json({ success: false, message: 'Username is already taken' });
        }
        user.username = cleanUsername;
      }
    }

    if (dob !== undefined) user.dob = dob;
    if (profileImage !== undefined && typeof profileImage === 'string') user.profileImage = profileImage;
    if (bio !== undefined && typeof bio === 'string') user.bio = bio.slice(0, 200);
    if (currency !== undefined && typeof currency === 'string') user.currency = currency;
    if (Array.isArray(emergencyContacts)) user.emergencyContacts = emergencyContacts;

    await user.save();

    res.json({
      success: true,
      user: { _id: user._id, username: user.username, email: user.email, bio: user.bio, profileImage: user.profileImage, dob: user.dob, emergencyContacts: user.emergencyContacts, currency: user.currency, createdAt: user.createdAt },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Username is already taken' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/auth/password
const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (typeof currentPassword !== 'string' || typeof newPassword !== 'string') {
      return res.status(400).json({ success: false, message: 'Invalid password format' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user || !(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ success: false, message: 'Incorrect current password' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { register, login, logout, getMe, updateProfile, updatePassword };
