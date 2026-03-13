const mongoose = require('mongoose');

const followupSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Outcome
    outcome: { type: String, required: true, trim: true },
    objectivesAchieved: { type: Boolean },
    incidents: { type: String, trim: true },

    // People / contacts made
    contactsMade: [
      {
        name: { type: String, trim: true },
        organization: { type: String, trim: true },
        phone: { type: String, trim: true },
        notes: { type: String, trim: true },
      },
    ],

    // Action items
    actionItems: [
      {
        description: { type: String, trim: true },
        assignedTo: { type: String, trim: true },
        dueDate: { type: Date },
        done: { type: Boolean, default: false },
      },
    ],

    // Actual spend
    actualSpend: { type: Number },
    currency: { type: String, default: 'MZN' },

    // Recommendations
    recommendations: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Followup', followupSchema);
