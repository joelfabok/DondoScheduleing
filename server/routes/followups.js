const router = require('express').Router();
const Followup = require('../models/Followup');
const Event = require('../models/Event');
const { protect } = require('../middleware/auth');

const populate = [
  { path: 'submittedBy', select: 'name email' },
  { path: 'event', select: 'title destination departureDate' },
];

// GET /api/followups?event=:eventId
router.get('/', protect, async (req, res) => {
  try {
    const filter = {};
    if (req.query.event) filter.event = req.query.event;
    if (req.user.role !== 'admin') filter.submittedBy = req.user._id;
    const followups = await Followup.find(filter).populate(populate).sort('-createdAt');
    res.json(followups);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/followups/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const f = await Followup.findById(req.params.id).populate(populate);
    if (!f) return res.status(404).json({ message: 'Follow-up not found' });
    res.json(f);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/followups
router.post('/', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.body.event);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const followup = await Followup.create({ ...req.body, submittedBy: req.user._id });
    await followup.populate(populate);
    res.status(201).json(followup);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/followups/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const f = await Followup.findById(req.params.id);
    if (!f) return res.status(404).json({ message: 'Follow-up not found' });

    const isOwner = String(f.submittedBy) === String(req.user._id);
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    Object.assign(f, req.body);
    await f.save();
    await f.populate(populate);
    res.json(f);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/followups/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const f = await Followup.findById(req.params.id);
    if (!f) return res.status(404).json({ message: 'Follow-up not found' });

    const isOwner = String(f.submittedBy) === String(req.user._id);
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await f.deleteOne();
    res.json({ message: 'Follow-up deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
