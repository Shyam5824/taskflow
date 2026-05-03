const Ticket = require('../models/Ticket');
const Workspace = require('../models/Workspace');
const Account = require('../models/Account');

// GET /api/analytics/overview
exports.getOverview = async (req, res, next) => {
  try {
    const isAdmin = req.currentUser.accountRole === 'admin';

    const ticketFilter = isAdmin ? {} : { assignedTo: req.currentUser._id };
    const workspaceFilter = isAdmin ? {} : { 'collaborators.account': req.currentUser._id };

    const [allTickets, allWorkspaces] = await Promise.all([
      Ticket.find(ticketFilter).populate('workspaceRef', 'title'),
      Workspace.find(workspaceFilter),
    ]);

    const now = new Date();

    const stats = {
      totalTickets: allTickets.length,
      openTickets: allTickets.filter((t) => t.resolution === 'open').length,
      inProgressTickets: allTickets.filter((t) => t.resolution === 'in_progress').length,
      doneTickets: allTickets.filter((t) => t.resolution === 'done').length,
      overdueTickets: allTickets.filter(
        (t) => t.resolution !== 'done' && t.dueBy && new Date(t.dueBy) < now
      ).length,
      totalWorkspaces: allWorkspaces.length,
      activeWorkspaces: allWorkspaces.filter((w) => w.currentPhase === 'active').length,
    };

    // Urgency breakdown
    const urgencyBreakdown = ['low', 'normal', 'high', 'critical'].map((u) => ({
      label: u,
      count: allTickets.filter((t) => t.urgency === u).length,
    }));

    // Tickets created in last 7 days
    const last7 = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date();
      day.setDate(day.getDate() - i);
      const label = day.toLocaleDateString('en-US', { weekday: 'short' });
      const count = allTickets.filter((t) => {
        const d = new Date(t.createdAt);
        return d.toDateString() === day.toDateString();
      }).length;
      last7.push({ label, count });
    }

    // Admin-only: team productivity
    let teamStats = null;
    if (isAdmin) {
      const members = await Account.find({ accountRole: 'member' }).select('displayName avatarInitials');
      teamStats = await Promise.all(
        members.map(async (m) => {
          const mTickets = await Ticket.find({ assignedTo: m._id });
          return {
            member: m,
            total: mTickets.length,
            done: mTickets.filter((t) => t.resolution === 'done').length,
            overdue: mTickets.filter(
              (t) => t.resolution !== 'done' && t.dueBy && new Date(t.dueBy) < now
            ).length,
          };
        })
      );
    }

    res.json({ success: true, stats, urgencyBreakdown, last7, teamStats });
  } catch (err) {
    next(err);
  }
};
