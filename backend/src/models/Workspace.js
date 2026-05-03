const mongoose = require('mongoose');

const workspaceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Workspace title is required'],
      trim: true,
      maxlength: 100,
    },
    summary: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    ownedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
    },
    collaborators: [
      {
        account: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
    dueOn: {
      type: Date,
    },
    currentPhase: {
      type: String,
      enum: ['draft', 'active', 'on_hold', 'wrapped_up'],
      default: 'draft',
    },
    colorTag: {
      type: String,
      default: '#6366f1',
    },
  },
  { timestamps: true }
);

// Virtual: completion percentage is computed from tickets, not stored
workspaceSchema.virtual('tickets', {
  ref: 'Ticket',
  localField: '_id',
  foreignField: 'workspaceRef',
});

module.exports = mongoose.model('Workspace', workspaceSchema);
