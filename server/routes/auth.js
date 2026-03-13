const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, department, phone, whatsapp, country, emergencyContact } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    // First user ever gets admin role automatically
    const count = await User.countDocuments();
    const role = count === 0 ? 'admin' : 'staff';

    const user = await User.create({
      name, email, password, department, phone, whatsapp,
      country: country || 'Mozambique',
      emergencyContact,
      role,
    });

    res.status(201).json({ token: signToken(user._id), user: user.toPublic() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    res.json({ token: signToken(user._id), user: user.toPublic() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/me
router.get('/me', protect, (req, res) => {
  res.json(req.user.toPublic ? req.user.toPublic() : req.user);
});

module.exports = router;
