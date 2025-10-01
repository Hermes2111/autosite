# Autosite - F1 Model Collection

A modern, full-stack application for managing and displaying a Formula 1 diecast model collection.

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose (for PostgreSQL)
- Python 3.9+ (for serving the static frontend quickly)

### Running the Full Stack

1. **Clone & enter the project**
   ```bash
   git clone <repo-url>
   cd autosite
   ```

2. **Start PostgreSQL** (via Docker Compose). If you already have your own Postgres instance, you can skip this step.
   ```bash
   docker-compose up -d db
   ```

3. **Configure environment variables**
   - Copy `backend/.env.example` to `backend/.env` or create it manually using the template further below.
   - Adjust DB credentials or JWT secrets as needed.

4. **Install backend dependencies & apply migrations**
   ```bash
   cd backend
   npm install
   npm run db:migrate    # runs schema + seed migrations (includes watchlist tables)
   npm run db:seed       # optional: loads extra CSV data
   ```

5. **Start the NestJS API**
   ```bash
   npm run start:dev
   ```
   - Base URL: **http://localhost:3000/api**
   - Static uploads: **http://localhost:3000/uploads**
   - Seeded users (from migrations):
     - `admin@example.com` / `Admin1234!` (roles: `admin`, `user`)
     - `user@example.com` / `User1234!`

6. **Serve the frontend**
   From the project root (not inside `backend/`):
   ```bash
   python3 -m http.server 5500
   # or
   npx serve .
   ```
   Open **http://localhost:5500**. Use the “Backend URL” field in the login modal to point to your API (default `http://localhost:3000`). After logging in:
   - Users can add/remove models from their watchlist via the card buttons.
   - Admins see “Bestaande modellen beheren” with edit/delete support.

7. **Optional:** run the FastAPI fallback (Python) if you need the older API version.
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   uvicorn api.main:app --reload
   ```

## 🔐 Authentication & Roles

- `POST /api/auth/login` – obtain JWT
- `POST /api/auth/register` – create user (default role `user`)
- `GET /api/auth/me` – current user profile
- Admin-only endpoints require `Authorization: Bearer <token>` header
- Admin module (`/api/admin/models`) accepts multipart form-data (`images[]`)
- Watchlist endpoints under `/api/watchlist` require authentication

### Watchlist API
- `GET /api/watchlist` – list current user’s watchlist entries
- `POST /api/watchlist/:modelId` – add model to watchlist
- `DELETE /api/watchlist/:modelId` – remove model from watchlist
- `DELETE /api/watchlist` – clear watchlist

Front-end stores JWT in `localStorage` and exposes admin panel when user has `admin` role.

## 📡 API Endpoints

The backend is served under `/api`. Key routes:
- `GET /api/health`
- `GET /api/diecast-models` (returns `{ items: [...] }`)
- `POST /api/diecast-models` (admin)
- `PATCH /api/diecast-models/:id` (admin)
- `DELETE /api/diecast-models/:id` (admin)
- `POST /api/admin/models` (admin upload with photos)
- `PATCH /api/admin/models/:id` (admin update with optional new photos)
- `DELETE /api/admin/models/:id`
- `GET /api/watchlist`, `POST /api/watchlist/:modelId`, `DELETE /api/watchlist/:modelId`
- `GET /api/teams`, `GET /api/drivers`, etc.

## 🎨 Frontend Features

- **Modern futuristic design** with sleek black UI
- **Color scheme:** Yellow (#FFDD00), Green (#009739), Blue (#003D8E)
- **Responsive admin panel** with edit/delete tooling and live feedback
- **User watchlist integration** with quick toggle buttons on every card
- **Real-time search and filtering**
- **Image gallery modal** with keyboard navigation
- **Statistics dashboard**
- **Responsive design** for all devices
- **Smooth animations** and hover effects

## 🗄️ Database

PostgreSQL running in Docker with:
- **Tables:** users, teams, drivers, diecast_models, watchlist_items, model_driver
- **Relationships:** Team → DiecastModel (1:N), DiecastModel ↔ Driver (M:N), User → WatchlistItem (1:N)
- **Migrations:** TypeORM migrations in `backend/src/migrations/`
- **Seeding:** Populated from `collection.csv` (diecast models + drivers)

## 📁 Project Structure

```
autosite/
├── backend/              # NestJS + TypeORM + PostgreSQL
│   ├── src/
│   │   ├── entities/     # TypeORM entities
│   │   ├── diecast-model/# CRUD module
│   │   ├── team/         # CRUD module
│   │   ├── user/         # CRUD module
│   │   ├── driver/       # CRUD module
│   │   ├── health/       # Health check
│   │   ├── migrations/   # Database migrations
│   │   └── seeds/        # Seed scripts
│   ├── Dockerfile
│   └── package.json
├── api/                  # FastAPI alternative (Python)
│   └── main.py
├── index.html            # Frontend
├── style.css             # Futuristic styling
├── script.js             # Frontend logic
├── collection.csv        # Source data
└── docker-compose.yml    # Docker services

```

## 🧪 Testing the API

```bash
# Health check
curl http://localhost:3000/health

# Get all models
curl http://localhost:3000/diecast-models

# Get all teams
curl http://localhost:3000/teams

# Create a new user
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User"}'

# Get specific model
curl http://localhost:3000/diecast-models/1
```

## 🌐 Environment Variables

Create `backend/.env`:
```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=devusr
DB_PASSWORD=devpwd
DB_NAME=autosite
AUTH_JWT_SECRET=super-secret-change-me
AUTH_JWT_AUDIENCE=autosite.local
AUTH_JWT_ISSUER=autosite.local
AUTH_JWT_EXPIRATION=3600
AUTH_ARGON_HASH_LENGTH=32
AUTH_ARGON_TIME_COST=3
AUTH_ARGON_MEMORY_COST=65536
PUBLIC_UPLOAD_BASE_URL=http://localhost:3000/uploads
```

Uploads and watchlist metadata are stored in PostgreSQL, while images save to `uploads/models`. Ensure the directory exists and is writable (created automatically on boot).

## 📧 Contact

- **Email:** hermesvansteenbrugge1@gmail.com
- **Phone:** +32 484 32 16 20
- **Location:** Avelgem, Belgium

## ⚡ Tech Stack

- **Frontend:** HTML5, CSS3 (Glass Morphism), Vanilla JavaScript
- **Backend:** NestJS, TypeORM, Node.js
- **Database:** PostgreSQL 16
- **Authentication:** JWT, Passport.js, Argon2
- **Alternative API:** FastAPI (Python)
- **Deployment:** Docker, Docker Compose (API, DB), static hosting for frontend
- **Fonts:** Inter (Google Fonts)
- **Icons:** Font Awesome 6

---

Built with ❤️ for Formula 1 collectors
