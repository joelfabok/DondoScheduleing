const router = require('express').Router();
const Helper = require('../models/Helper');
const { protect, adminOnly } = require('../middleware/auth');

// GET /api/helpers - all active helpers for picker
router.get('/', protect, async (req, res) => {
  try {
    const helpers = await Helper.find({ isActive: true }).sort('name');
    res.json(helpers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/helpers - admin only
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const payload = {
      name: req.body.name,
      phone: req.body.phone,
      specialty: req.body.specialty,
      notes: req.body.notes,
    };
    const helper = await Helper.create(payload);
    res.status(201).json(helper);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/helpers/:id - admin only
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const updates = {
      name: req.body.name,
      phone: req.body.phone,
      specialty: req.body.specialty,
      notes: req.body.notes,
    };

    const helper = await Helper.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!helper) return res.status(404).json({ message: 'Helper not found' });
    res.json(helper);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/helpers/:id - admin only (soft delete)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const helper = await Helper.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!helper) return res.status(404).json({ message: 'Helper not found' });
    res.json({ message: 'Helper deactivated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
