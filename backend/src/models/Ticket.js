const mongoose = require('mongoose');

const activityEntrySchema = new mongoose.Schema(
  {
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
    entryType: {
      type: String,
      enum: ['comment', 'status_change', 'assignment', 'priority_update'],
      default: 'comment',
    },
    body: { type: String, trim: true },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

const ticketSchema = new mongoose.Schema(
  {
    heading: {
      type: String,
      required: [true, 'Ticket heading is required'],
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      trim: true,
    },
    workspaceRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
    },
    raisedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      default: null,
    },
    urgency: {
      type: String,
      enum: ['low', 'normal', 'high', 'critical'],
      default: 'normal',
    },
    resolution: {
      type: String,
      enum: ['open', 'in_progress', 'done'],
      default: 'open',
    },
    dueBy: {
      type: Date,
    },
    activityLog: [activityEntrySchema],
  },
  { timestamps: true }
);

// Computed field: is the ticket overdue?
ticketSchema.virtual('isOverdue').get(function () {
  if (!this.dueBy || this.resolution === 'done') return false;
  return new Date() > new Date(this.dueBy);
});

ticketSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Ticket', ticketSchema);
