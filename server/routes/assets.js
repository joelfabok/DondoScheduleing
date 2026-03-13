const router = require('express').Router();
const Asset = require('../models/Asset');
const { protect, adminOnly } = require('../middleware/auth');

// GET /api/assets - all active assets (all authenticated users)
router.get('/', protect, async (req, res) => {
  try {
    const filter = { isActive: true };
    if (req.query.type) filter.type = req.query.type;
    const assets = await Asset.find(filter).sort({ type: 1, name: 1 });
    res.json(assets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/assets - admin only
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const payload = {
      name: req.body.name,
      type: req.body.type || 'vehicle',
      description: req.body.description,
    };
    const asset = await Asset.create(payload);
    res.status(201).json(asset);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/assets/:id - admin only (soft delete)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const asset = await Asset.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!asset) return res.status(404).json({ message: 'Asset not found' });
    res.json({ message: 'Asset deactivated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
