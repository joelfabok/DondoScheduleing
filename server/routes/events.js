const router = require('express').Router();
const PDFDocument = require('pdfkit');
const Event = require('../models/Event');
const Followup = require('../models/Followup');
const { protect, adminOnly } = require('../middleware/auth');
const { sendStatusUpdate } = require('../middleware/email');

const populate = [
  { path: 'submittedBy', select: 'name email phone whatsapp department' },
  { path: 'approvedBy', select: 'name' },
  { path: 'vehicleAsset', select: 'name type description' },
  { path: 'travelers.user', select: 'name phone whatsapp' },
  { path: 'travelers.helper', select: 'name phone specialty' },
  { path: 'statusHistory.changedBy', select: 'name' },
];

const sanitizeEventPayload = (payload = {}) => {
  const clean = { ...payload };

  clean.vehicleAsset = clean.vehicleAsset || undefined;

  if (Array.isArray(clean.travelers)) {
    clean.travelers = clean.travelers
      .map((t) => ({
        user: t?.user || undefined,
        helper: t?.helper || undefined,
        name: t?.name ? String(t.name).trim() : undefined,
        phone: t?.phone ? String(t.phone).trim() : undefined,
      }))
      .filter((t) => t.user || t.helper || t.name);
  }

  return clean;
};

// GET /api/events — admin sees all, staff sees own
router.get('/', protect, async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { submittedBy: req.user._id };
    const { status, search } = req.query;
    if (status) filter.status = status;
    if (search) filter.$or = [
      { title: new RegExp(search, 'i') },
      { destination: new RegExp(search, 'i') },
      { purpose: new RegExp(search, 'i') },
    ];

    const events = await Event.find(filter)
      .populate(populate)
      .sort({ departureDate: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/events/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate(populate);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    // Staff can only view own events
    if (req.user.role !== 'admin' && String(event.submittedBy._id) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/events
router.post('/', protect, async (req, res) => {
  try {
    const event = await Event.create({
      ...sanitizeEventPayload(req.body),
      submittedBy: req.user._id,
      statusHistory: [{ status: 'pending', changedBy: req.user._id }],
    });
    await event.populate(populate);
    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/events/:id — submitter can edit if pending; admin can always edit
router.put('/:id', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const isOwner = String(event.submittedBy) === String(req.user._id);
    const isAdmin = req.user.role === 'admin';

    if (!isAdmin && (!isOwner || event.status !== 'pending')) {
      return res.status(403).json({ message: 'Cannot edit at this stage' });
    }

    const disallowed = ['submittedBy', 'statusHistory'];
    disallowed.forEach((k) => delete req.body[k]);

    Object.assign(event, sanitizeEventPayload(req.body));
    await event.save();
    await event.populate(populate);
    res.json(event);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH /api/events/:id/status — admin only
router.patch('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const event = await Event.findById(req.params.id).populate('submittedBy', 'name email');
    if (!event) return res.status(404).json({ message: 'Event not found' });

    event.status = status;
    if (adminNotes) event.adminNotes = adminNotes;
    if (status === 'approved') event.approvedBy = req.user._id;
    event.statusHistory.push({ status, changedBy: req.user._id, note: adminNotes });
    await event.save();

    // Email notification
    await sendStatusUpdate({
      toEmail: event.submittedBy.email,
      toName: event.submittedBy.name,
      eventTitle: event.title,
      newStatus: status,
      adminNote: adminNotes,
    });

    await event.populate(populate);
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/events/:id/duplicate
router.post('/:id/duplicate', protect, async (req, res) => {
  try {
    const original = await Event.findById(req.params.id).lean();
    if (!original) return res.status(404).json({ message: 'Event not found' });

    delete original._id;
    delete original.createdAt;
    delete original.updatedAt;
    delete original.approvedBy;
    original.status = 'pending';
    original.submittedBy = req.user._id;
    original.title = `${original.title} (copy)`;
    original.statusHistory = [{ status: 'pending', changedBy: req.user._id }];

    const newEvent = await Event.create(original);
    await newEvent.populate(populate);
    res.status(201).json(newEvent);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/events/:id/pdf
router.get('/:id/pdf', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate(populate);
    const followups = await Followup.find({ event: req.params.id }).populate('submittedBy', 'name');

    if (!event) return res.status(404).json({ message: 'Event not found' });

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="event-${event._id}.pdf"`);
    doc.pipe(res);

    // Title
    doc.fontSize(20).font('Helvetica-Bold').text('EVENT SUMMARY', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(16).text(event.title, { align: 'center' });
    doc.moveDown();

    const field = (label, value) => {
      if (!value) return;
      doc.fontSize(10).font('Helvetica-Bold').text(`${label}: `, { continued: true });
      doc.font('Helvetica').text(String(value));
    };

    field('Status', event.status.toUpperCase());
    field('Destination', event.destination);
    field('Departure From', event.departureLocation);
    field('Departure Date', new Date(event.departureDate).toDateString());
    field('Return Date', new Date(event.returnDate).toDateString());
    field('Purpose', event.purpose);
    field('Submitted By', event.submittedBy?.name);
    field('Department', event.submittedBy?.department);
    doc.moveDown();

    if (event.travelers?.length) {
      doc.font('Helvetica-Bold').fontSize(12).text('Travelers');
      event.travelers.forEach((t) => {
        const name = t.user?.name || t.helper?.name || t.name || 'Unknown';
        const phone = t.user?.phone || t.helper?.phone || t.phone || '';
        doc.font('Helvetica').fontSize(10).text(`  • ${name}${phone ? ` — ${phone}` : ''}`);
      });
      doc.moveDown();
    }

    if (event.localContact?.name) {
      doc.font('Helvetica-Bold').fontSize(12).text('Local Contact');
      field('  Name', event.localContact.name);
      field('  Phone', event.localContact.phone);
      field('  Organization', event.localContact.organization);
      doc.moveDown();
    }

    if (event.vehicleRequired) {
      doc.font('Helvetica-Bold').fontSize(12).text('Transport');
      field('  Vehicle', event.vehicleAsset?.name || event.vehicleDetails);
      if (event.vehicleAsset?.name && event.vehicleDetails) field('  Vehicle Notes', event.vehicleDetails);
      field('  Driver', event.driverContact?.name);
      field('  Driver Phone', event.driverContact?.phone);
      doc.moveDown();
    }

    if (event.supplies?.length) {
      doc.font('Helvetica-Bold').fontSize(12).text('Supplies / Equipment');
      event.supplies.forEach((s) => doc.font('Helvetica').fontSize(10).text(`  • ${s}`));
      doc.moveDown();
    }

    if (event.notes) { field('Notes', event.notes); doc.moveDown(); }

    if (followups.length) {
      doc.addPage();
      doc.font('Helvetica-Bold').fontSize(14).text('FOLLOW-UP REPORTS');
      doc.moveDown();
      followups.forEach((f, i) => {
        doc.font('Helvetica-Bold').fontSize(12).text(`Follow-Up #${i + 1} — ${f.submittedBy?.name}`);
        field('  Submitted', new Date(f.createdAt).toDateString());
        field('  Outcome', f.outcome);
        field('  Objectives Achieved', f.objectivesAchieved ? 'Yes' : 'No');
        if (f.incidents) field('  Incidents', f.incidents);
        if (f.recommendations) field('  Recommendations', f.recommendations);
        doc.moveDown();
      });
    }

    doc.end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/events/:id — admin or owner (pending only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const isOwner = String(event.submittedBy) === String(req.user._id);
    const isAdmin = req.user.role === 'admin';

    if (!isAdmin && (!isOwner || event.status !== 'pending')) {
      return res.status(403).json({ message: 'Cannot delete at this stage' });
    }

    await event.deleteOne();
    await Followup.deleteMany({ event: req.params.id });
    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
