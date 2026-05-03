# TaskFlow — Project & Task Management Platform

A full-stack web application for managing projects, tracking tasks, and monitoring team productivity with role-based access control.

Built with Node.js + Express, React, and MongoDB.

---

## Features

### For Admins
- Create and delete workspaces (projects)
- Add team members to workspaces
- Create tickets (tasks) and assign them to collaborators
- Set urgency levels (low / normal / high / critical) and deadlines
- View the full analytics dashboard including team productivity stats
- Toggle member roles

### For Members
- View workspaces you're part of
- See assigned tickets with status and deadlines
- Update ticket status (open → in progress → done)
- Add comments and activity notes to tickets
- Personal dashboard with progress overview

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Backend | Node.js + Express | Fast, minimal, familiar to most teams |
| Database | MongoDB + Mongoose | Flexible schema, easy to iterate |
| Auth | JWT (jsonwebtoken) | Stateless, works well for SPAs |
| Frontend | React + Vite | Fast dev experience, component reuse |
| Charts | Recharts | Lightweight, built for React |
| Styling | Custom CSS vars | No extra dependencies, full control |
| Icons | Lucide React | Clean, consistent icon set |

---

## Project Structure

```
taskflow/
├── backend/
│   └── src/
│       ├── config/          # DB connection
│       ├── controllers/     # Business logic
│       │   ├── authController.js
│       │   ├── workspaceController.js
│       │   ├── ticketController.js
│       │   └── analyticsController.js
│       ├── middleware/
│       │   └── authGuard.js     # JWT + role middleware
│       ├── models/
│       │   ├── Account.js       # User model
│       │   ├── Workspace.js     # Project model
│       │   └── Ticket.js        # Task model (with activity log)
│       ├── routes/
│       │   ├── authRoutes.js
│       │   ├── workspaceRoutes.js
│       │   ├── ticketRoutes.js
│       │   ├── memberRoutes.js
│       │   └── analyticsRoutes.js
│       └── server.js
└── frontend/
    └── src/
        ├── components/
        │   └── common/         # Shared: Layout, Spinner
        ├── context/
        │   └── AuthContext.jsx  # Global auth state
        ├── pages/
        │   ├── LoginPage.jsx
        │   ├── RegisterPage.jsx
        │   ├── DashboardPage.jsx
        │   ├── WorkspacesPage.jsx
        │   ├── WorkspaceDetailPage.jsx
        │   ├── TicketsPage.jsx
        │   ├── TicketDetailPage.jsx
        │   └── MembersPage.jsx
        ├── services/
        │   └── api.js           # Axios instance + interceptors
        ├── App.jsx              # Routes
        └── index.css            # Design tokens + global styles
```

---

## Database Schema

### Account (users)
```
displayName      String
emailAddress     String (unique)
passwordHash     String (bcrypt, select: false)
accountRole      "admin" | "member"
avatarInitials   String (auto-generated)
lastActiveAt     Date
resetToken       String
resetTokenExpiry Date
```

### Workspace (projects)
```
title          String
summary        String
ownedBy        → Account
collaborators  [{ account → Account, joinedAt }]
dueOn          Date
currentPhase   "draft" | "active" | "on_hold" | "wrapped_up"
colorTag       String (hex color)
```

### Ticket (tasks)
```
heading        String
description    String
workspaceRef   → Workspace
raisedBy       → Account
assignedTo     → Account
urgency        "low" | "normal" | "high" | "critical"
resolution     "open" | "in_progress" | "done"
dueBy          Date
activityLog    [{ postedBy, entryType, body, metadata }]
```

---

## API Endpoints

### Auth
```
POST /api/auth/register         Sign up
POST /api/auth/login            Log in
GET  /api/auth/me               Get current user
POST /api/auth/forgot-password  Request reset link
PATCH /api/auth/reset-password/:token  Reset password
```

### Workspaces
```
GET    /api/workspace           List accessible workspaces
POST   /api/workspace           Create (admin)
GET    /api/workspace/:id       Get with tickets + progress
PATCH  /api/workspace/:id       Update (admin)
DELETE /api/workspace/:id       Delete + cascade tickets (admin)
POST   /api/workspace/:id/invite  Add member (admin)
```

### Tickets
```
GET    /api/tickets             List (members see own; admin sees all)
POST   /api/tickets             Create (admin)
GET    /api/tickets/:id         Full ticket with activity log
PATCH  /api/tickets/:id         Update status, urgency, etc.
POST   /api/tickets/:id/comment Add comment/note
DELETE /api/tickets/:id         Delete (admin)
```

### Members
```
GET    /api/members             All accounts (admin)
PATCH  /api/members/:id/role    Toggle role (admin)
```

### Analytics
```
GET /api/analytics/overview     Stats, charts data, team productivity
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)

### Backend
```bash
cd backend
cp .env.example .env
# Fill in MONGO_URI and JWT_SECRET
npm install
npm run dev
```

### Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Open http://localhost:5173

---

## Deployment on Railway

### Backend
1. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Select your repo, set root directory to `backend/`
3. Add environment variables (copy from `.env.example`, fill real values)
4. Railway auto-detects Node.js and runs `npm start`

### Frontend
1. New service in the same project → Deploy from GitHub
2. Set root directory to `frontend/`
3. Add `VITE_API_URL=https://your-backend.up.railway.app/api`
4. Build command: `npm run build`, publish directory: `dist`

### MongoDB
- Use MongoDB Atlas. Create a free M0 cluster.
- Whitelist all IPs (0.0.0.0/0) for Railway.
- Paste the connection string as `MONGO_URI`.

---

## Design Decisions

- **"Workspace" instead of "Project"** — feels more like how real teams talk about work areas.
- **"Ticket" instead of "Task"** — borrows from issue-tracking vocabulary (Jira, Linear), which is how software teams actually refer to work items.
- **"Account" instead of "User"** — more neutral, avoids the generic `users` collection name.
- **Activity log embedded in Ticket** — keeps reads fast (no JOIN). For very high volume, this could move to a separate collection.
- **Progress % computed on read** — avoids stale counters. Could be cached with Redis at scale.
- **JWT stored in localStorage** — acceptable for an internal tool; for public products, use httpOnly cookies.

---

## Possible Extensions

- Email notifications on ticket assignment (nodemailer configured, just needs SMTP)
- File attachments on tickets (Cloudinary or S3)
- Workspace templates
- Kanban board view (drag-and-drop columns)
- Slack webhook integration for status changes
- Export tickets to CSV

---

## License

MIT
