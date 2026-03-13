const mongoose = require('mongoose');

const travelerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  helper: { type: mongoose.Schema.Types.ObjectId, ref: 'Helper' },
  name: { type: String },   // for external travelers not in system
  phone: { type: String },
}, { _id: false });

const statusHistorySchema = new mongoose.Schema({
  status: { type: String },
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  changedAt: { type: Date, default: Date.now },
  note: { type: String },
}, { _id: false });

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    purpose: { type: String, required: true, trim: true },

    // Location
    destination: { type: String, required: true, trim: true },
    departureLocation: { type: String, trim: true },

    // Dates
    departureDate: { type: Date, required: true },
    returnDate: { type: Date, required: true },

    // Requester
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Travelers
    travelers: [travelerSchema],

    // Local contact at destination
    localContact: {
      name: { type: String, trim: true },
      phone: { type: String, trim: true },
      organization: { type: String, trim: true },
    },

    // Logistics
    vehicleRequired: { type: Boolean, default: false },
    vehicleAsset: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset' },
    vehicleDetails: { type: String, trim: true },
    driverContact: {
      name: { type: String, trim: true },
      phone: { type: String, trim: true },
    },

    // Budget
    estimatedBudget: { type: Number },
    currency: { type: String, default: 'MZN' },

    // Supplies / equipment needed
    supplies: [{ type: String, trim: true }],
    notes: { type: String, trim: true },

    // Status
    status: {
      type: String,
      enum: ['pending', 'approved', 'active', 'complete', 'cancelled'],
      default: 'pending',
    },
    statusHistory: [statusHistorySchema],

    // Admin fields
    adminNotes: { type: String, trim: true },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Event', eventSchema);
