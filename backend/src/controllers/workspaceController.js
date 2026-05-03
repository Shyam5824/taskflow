const Workspace = require('../models/Workspace');
const Ticket = require('../models/Ticket');
const Account = require('../models/Account');

// GET /api/workspace
exports.listWorkspaces = async (req, res, next) => {
  try {
    const filter =
      req.currentUser.accountRole === 'admin'
        ? {}
        : { 'collaborators.account': req.currentUser._id };

    const workspaces = await Workspace.find(filter)
      .populate('ownedBy', 'displayName avatarInitials')
      .populate('collaborators.account', 'displayName avatarInitials')
      .sort({ updatedAt: -1 });

    // Attach progress percentage
    const withProgress = await Promise.all(
      workspaces.map(async (ws) => {
        const tickets = await Ticket.find({ workspaceRef: ws._id });
        const total = tickets.length;
        const done = tickets.filter((t) => t.resolution === 'done').length;
        return { ...ws.toJSON(), progressPct: total ? Math.round((done / total) * 100) : 0, ticketCount: total };
      })
    );

    res.json({ success: true, workspaces: withProgress });
  } catch (err) {
    next(err);
  }
};

// POST /api/workspace
exports.createWorkspace = async (req, res, next) => {
  try {
    const { title, summary, dueOn, colorTag, memberIds } = req.body;

    const collaborators = (memberIds || []).map((id) => ({ account: id }));
    // Owner is always a collaborator
    if (!collaborators.find((c) => String(c.account) === String(req.currentUser._id))) {
      collaborators.unshift({ account: req.currentUser._id });
    }

    const workspace = await Workspace.create({
      title,
      summary,
      dueOn,
      colorTag,
      ownedBy: req.currentUser._id,
      collaborators,
    });

    res.status(201).json({ success: true, workspace });
  } catch (err) {
    next(err);
  }
};

// GET /api/workspace/:id
exports.getWorkspace = async (req, res, next) => {
  try {
    const workspace = await Workspace.findById(req.params.id)
      .populate('ownedBy', 'displayName avatarInitials emailAddress')
      .populate('collaborators.account', 'displayName avatarInitials emailAddress accountRole');

    if (!workspace) return res.status(404).json({ success: false, message: 'Workspace not found.' });

    const tickets = await Ticket.find({ workspaceRef: workspace._id })
      .populate('assignedTo', 'displayName avatarInitials')
      .populate('raisedBy', 'displayName avatarInitials');

    const total = tickets.length;
    const done = tickets.filter((t) => t.resolution === 'done').length;
    const progressPct = total ? Math.round((done / total) * 100) : 0;

    res.json({ success: true, workspace: { ...workspace.toJSON(), progressPct }, tickets });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/workspace/:id
exports.updateWorkspace = async (req, res, next) => {
  try {
    const workspace = await Workspace.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!workspace) return res.status(404).json({ success: false, message: 'Workspace not found.' });
    res.json({ success: true, workspace });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/workspace/:id
exports.deleteWorkspace = async (req, res, next) => {
  try {
    const workspace = await Workspace.findByIdAndDelete(req.params.id);
    if (!workspace) return res.status(404).json({ success: false, message: 'Workspace not found.' });
    await Ticket.deleteMany({ workspaceRef: req.params.id });
    res.json({ success: true, message: 'Workspace and its tickets removed.' });
  } catch (err) {
    next(err);
  }
};

// POST /api/workspace/:id/invite
exports.inviteMember = async (req, res, next) => {
  try {
    const workspace = await Workspace.findById(req.params.id);
    if (!workspace) return res.status(404).json({ success: false, message: 'Workspace not found.' });

    const { accountId } = req.body;
    const alreadyIn = workspace.collaborators.find(
      (c) => String(c.account) === String(accountId)
    );
    if (alreadyIn) {
      return res.status(400).json({ success: false, message: 'Member already in workspace.' });
    }

    workspace.collaborators.push({ account: accountId });
    await workspace.save();
    res.json({ success: true, message: 'Member added.' });
  } catch (err) {
    next(err);
  }
};
