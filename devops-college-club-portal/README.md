# College Club Management Portal

A production-ready, full-stack web application for managing college clubs, events, members, and attendance.

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, Axios, Recharts |
| Backend | Node.js, Express.js |
| ORM | Sequelize |
| Database | MySQL 8.0 |
| Auth | JWT (JSON Web Tokens) |
| Reverse Proxy | NGINX |
| Containerization | Docker + Docker Compose |
| CI/CD | Jenkins |

---

## 📁 Project Structure

```
college-club-portal/
├── backend/
│   ├── src/
│   │   ├── config/          # DB config
│   │   ├── controllers/     # Business logic
│   │   ├── middleware/      # Auth + Role guards
│   │   ├── models/          # Sequelize models
│   │   ├── routes/          # Express routes
│   │   ├── seeders/         # Sample data
│   │   └── server.js        # Entry point
│   ├── tests/               # Jest tests
│   ├── .env
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios instance
│   │   ├── components/      # Sidebar, Topbar, etc.
│   │   ├── context/         # Auth context
│   │   ├── pages/           # All page components
│   │   └── index.css        # Design system
│   ├── public/
│   ├── .env
│   └── Dockerfile
├── nginx/
│   └── default.conf         # Reverse proxy config
├── docker-compose.yml
├── Jenkinsfile
└── README.md
```

---

## 🚀 Quick Start (Local – No Docker)

### Prerequisites
- Node.js 18+
- MySQL 8.0 running locally

### 1. Clone & Configure

```bash
git clone <your-repo-url>
cd college-club-portal
```

### 2. Backend Setup

```bash
cd backend
cp .env .env.local      # edit DB credentials if needed
npm install
npm run seed            # creates tables + inserts sample data
npm run dev             # starts on :5000
```

### 3. Frontend Setup

```bash
cd frontend
# For local dev, edit .env:
# REACT_APP_API_URL=http://localhost:5000/api
npm install
npm start               # starts on :3000
```

---

## 🐳 Docker Setup (Recommended)

### Prerequisites
- Docker Desktop installed and running
- Docker Compose v2+

### 1. Build & Start All Services

```bash
cd college-club-portal
docker-compose up --build -d
```

This starts:
- **MySQL** on port `3306`
- **Backend API** on port `5000`
- **Frontend** (served internally)
- **NGINX** on port `80` ← your entry point

### 2. Seed the Database

```bash
docker exec college_club_backend node src/seeders/seed.js
```

### 3. Open the App

```
http://localhost
```

### 4. Stop Services

```bash
docker-compose down
# To also remove DB data:
docker-compose down -v
```

---

## 🔑 Default Login Credentials

| Role | Email | Password |
|---|---|---|
| **Admin** | admin@college.edu | admin123 |
| **Leader** | priya@college.edu | password123 |
| **Leader** | rahul@college.edu | password123 |
| **Student** | ankit@college.edu | password123 |
| **Student** | sneha@college.edu | password123 |

> **Tip:** Use the "Demo" buttons on the login page to auto-fill credentials.

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login (returns JWT) |
| GET | `/api/auth/me` | Get current user info |

### Student
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/clubs` | List all active clubs |
| POST | `/api/clubs/join` | Request to join a club |
| GET | `/api/events` | List all events |
| POST | `/api/events/register` | Register for event |
| GET | `/api/history` | View participation history |
| GET | `/api/notifications` | Get notifications |

### Leader
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/events/create` | Create an event |
| GET | `/api/members` | View pending join requests |
| POST | `/api/members/approve` | Approve/reject member |
| POST | `/api/attendance/mark` | Mark attendance |
| POST | `/api/notices` | Send notice to members |
| GET | `/api/club/events` | Get leader's events |

### Admin
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/dashboard` | Analytics dashboard |
| GET | `/api/admin/users` | List all users |
| GET | `/api/admin/clubs` | List all clubs |
| POST | `/api/admin/create-club` | Create a club |
| PUT | `/api/admin/assign-leader` | Assign leader to club |
| DELETE | `/api/admin/user/:id` | Delete a user |
| GET | `/api/admin/reports` | Generate reports |

---

## ⚙️ Jenkins CI/CD Setup

### Prerequisites
- Jenkins server running (locally or on a server)
- Plugins: Git, Pipeline, Docker Pipeline, Workspace Cleanup

### Steps

1. **Install Jenkins** (if not already):
   ```bash
   docker run -d -p 8080:8080 -p 50000:50000 \
     -v jenkins_home:/var/jenkins_home \
     -v /var/run/docker.sock:/var/run/docker.sock \
     jenkins/jenkins:lts
   ```

2. **Create New Pipeline Job**:
   - Jenkins → New Item → "CollegeClubPortal" → Pipeline
   - Definition: Pipeline script from SCM
   - SCM: Git → paste your repo URL
   - Script Path: `Jenkinsfile`

3. **Set Up GitHub Webhook** (for auto-trigger):
   - GitHub → Repo Settings → Webhooks → Add webhook
   - Payload URL: `http://<your-jenkins-ip>:8080/github-webhook/`
   - Content type: `application/json`
   - Trigger: `Push events`
   - In Jenkins: Job → Configure → Build Triggers → ✅ "GitHub hook trigger for GITScm polling"

4. **Run the Pipeline**:
   - Click "Build Now"
   - Pipeline stages: Checkout → Install → Test → Build → Docker Build → Deploy → Health Check

---

## 🌐 NGINX Architecture

```
Browser
   │
   ▼
NGINX :80
   ├── /api/*  ──────────────→  Backend :5000
   └── /*  ──────────────────→  Frontend (React Build)
```

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Manual API Testing (curl)

```bash
# Register
curl -X POST http://localhost/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"pass123","role":"student"}'

# Login
curl -X POST http://localhost/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@college.edu","password":"admin123"}'

# Get clubs (with token)
curl http://localhost/api/clubs \
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

---

## 🔐 Security Features

- **JWT Authentication**: All protected routes require a valid JWT Bearer token
- **Role-Based Access Control**: Middleware enforces student/leader/admin permissions
- **Password Hashing**: bcrypt with salt rounds=12
- **CORS**: Configurable origin restriction
- **SQL Injection Protection**: Sequelize ORM with parameterized queries

---

## 🌍 Environment Variables

### Backend `.env`
```env
NODE_ENV=development
PORT=5000
DB_HOST=mysql
DB_PORT=3306
DB_NAME=college_club_db
DB_USER=club_user
DB_PASSWORD=club_pass123
JWT_SECRET=super_secret_jwt_key_change_in_production_2024
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost
```

### Frontend `.env`
```env
REACT_APP_API_URL=http://localhost/api
```

---

## 📊 Database Schema

| Table | Key Fields |
|---|---|
| users | id, name, email, password_hash, role, created_at |
| clubs | club_id, club_name, category, description, leader_id, status |
| events | event_id, title, venue, event_date, club_id, created_by |
| memberships | id, student_id, club_id, join_date, status |
| attendance | id, student_id, event_id, status, marked_at |
| notifications | notif_id, user_id, message, is_read, created_at |

---

## 🛠️ Troubleshooting

| Problem | Solution |
|---|---|
| DB connection refused | Wait 30s for MySQL to start; retry `docker-compose up -d` |
| Port 80 already in use | `docker-compose down` or change port in `docker-compose.yml` |
| JWT token expired | Log out and log back in |
| `npm ci` fails | Delete `node_modules` and `package-lock.json`, run `npm install` |
| Jenkins can't run docker | Map `/var/run/docker.sock` into Jenkins container |

---

## 📝 License

MIT License — Free to use for academic and commercial projects.
