const router = require('express').Router();
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

// GET /api/users — list all (for traveler picker)
router.get('/', protect, async (req, res) => {
  try {
    const users = await User.find({ isActive: true }).select('-password').sort('name');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/users/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/users/me — update own profile
router.put('/me', protect, async (req, res) => {
  try {
    const allowed = ['name', 'department', 'phone', 'whatsapp', 'country', 'emergencyContact'];
    const updates = {};
    allowed.forEach((k) => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    if (req.body.password) {
      req.user.password = req.body.password;
      await req.user.save();
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/users/:id/role — admin only
router.put('/:id/role', protect, adminOnly, async (req, res) => {
  try {
    const requestedRole = String(req.body.role || '').toLowerCase();
    const normalizedRole = requestedRole === 'user' ? 'staff' : requestedRole;

    if (!['admin', 'staff'].includes(normalizedRole)) {
      return res.status(400).json({ message: 'Role must be user/admin' });
    }

    if (String(req.user._id) === String(req.params.id)) {
      return res.status(400).json({ message: 'You cannot change your own role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: normalizedRole },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/users/:id — admin only (soft delete)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    if (String(req.user._id) === String(req.params.id)) {
      return res.status(400).json({ message: 'You cannot remove your own account' });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deactivated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
