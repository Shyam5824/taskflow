const Ticket = require('../models/Ticket');
const Workspace = require('../models/Workspace');

// GET /api/tickets?workspaceRef=&assignedTo=
exports.listTickets = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.workspaceRef) filter.workspaceRef = req.query.workspaceRef;
    if (req.query.assignedTo) filter.assignedTo = req.query.assignedTo;

    // Members can only see their assigned tickets unless they're admin
    if (req.currentUser.accountRole === 'member') {
      filter.assignedTo = req.currentUser._id;
    }

    const tickets = await Ticket.find(filter)
      .populate('assignedTo', 'displayName avatarInitials')
      .populate('raisedBy', 'displayName avatarInitials')
      .populate('workspaceRef', 'title colorTag')
      .sort({ createdAt: -1 });

    res.json({ success: true, tickets });
  } catch (err) {
    next(err);
  }
};

// POST /api/tickets
exports.createTicket = async (req, res, next) => {
  try {
    const { heading, description, workspaceRef, assignedTo, urgency, dueBy } = req.body;

    const workspace = await Workspace.findById(workspaceRef);
    if (!workspace) return res.status(404).json({ success: false, message: 'Workspace not found.' });

    const ticket = await Ticket.create({
      heading,
      description,
      workspaceRef,
      assignedTo: assignedTo || null,
      urgency,
      dueBy,
      raisedBy: req.currentUser._id,
      activityLog: [
        {
          postedBy: req.currentUser._id,
          entryType: 'comment',
          body: 'Ticket created.',
        },
      ],
    });

    await ticket.populate('assignedTo', 'displayName avatarInitials');
    await ticket.populate('raisedBy', 'displayName avatarInitials');

    res.status(201).json({ success: true, ticket });
  } catch (err) {
    next(err);
  }
};

// GET /api/tickets/:id
exports.getTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('assignedTo', 'displayName avatarInitials emailAddress')
      .populate('raisedBy', 'displayName avatarInitials')
      .populate('workspaceRef', 'title colorTag')
      .populate('activityLog.postedBy', 'displayName avatarInitials');

    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found.' });
    res.json({ success: true, ticket });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/tickets/:id
exports.updateTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found.' });

    const { resolution, urgency, assignedTo, heading, description, dueBy } = req.body;

    if (resolution && resolution !== ticket.resolution) {
      ticket.activityLog.push({
        postedBy: req.currentUser._id,
        entryType: 'status_change',
        body: `Status changed from "${ticket.resolution}" to "${resolution}"`,
        metadata: { from: ticket.resolution, to: resolution },
      });
      ticket.resolution = resolution;
    }

    if (urgency) ticket.urgency = urgency;
    if (assignedTo !== undefined) ticket.assignedTo = assignedTo;
    if (heading) ticket.heading = heading;
    if (description) ticket.description = description;
    if (dueBy) ticket.dueBy = dueBy;

    await ticket.save();
    await ticket.populate('assignedTo', 'displayName avatarInitials');
    res.json({ success: true, ticket });
  } catch (err) {
    next(err);
  }
};

// POST /api/tickets/:id/comment
exports.addComment = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found.' });

    ticket.activityLog.push({
      postedBy: req.currentUser._id,
      entryType: 'comment',
      body: req.body.body,
    });

    await ticket.save();
    await ticket.populate('activityLog.postedBy', 'displayName avatarInitials');
    res.json({ success: true, activityLog: ticket.activityLog });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/tickets/:id
exports.deleteTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findByIdAndDelete(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found.' });
    res.json({ success: true, message: 'Ticket deleted.' });
  } catch (err) {
    next(err);
  }
};
