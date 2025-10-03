# Autosite – Local Run Instructions

This guide walks someone new through running the complete stack (database, backend API, and frontend) on their own machine.

## 1. Prerequisites

Make sure these are installed:

- **Node.js** 20 or newer (`node -v`)
- **npm** (ships with Node)
- **Docker Desktop** (or Docker Engine + Docker Compose)
- **Python 3** (for a simple static file server)
- **Git** (to clone the repo)

> Tip: macOS users can install Node via `brew install node`, Docker Desktop from docker.com, and Python 3 via `brew install python`.

## 2. Clone the repository

```bash
git clone <YOUR-REPO-URL>
cd autosite
```

Replace `<YOUR-REPO-URL>` with your Git remote (HTTPS or SSH).

## 3. Start the database (PostgreSQL)

The repo ships with a Docker Compose definition. From the project root:

```bash
docker compose up -d db
```

This boots a PostgreSQL instance matching the settings in `backend/.env`. Use `docker compose ps` to confirm `db` is healthy.

## 4. Configure backend environment variables

Copy the sample env file or create one manually:

```bash
cp backend/.env.example backend/.env
```

At minimum, confirm:

```
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=devusr
DB_PASSWORD=devpwd
DB_NAME=autosite
AUTH_JWT_SECRET=change-me
PUBLIC_UPLOAD_BASE_URL=http://localhost:3000/uploads
```

## 5. Install backend dependencies

```bash
cd backend
npm install
```

## 6. Run database migrations (and optional seeds)

```bash
npm run db:migrate   # applies schema + seed migrations
# optionally
npm run db:seed      # loads additional data from collection.csv
```

## 7. Start the NestJS API

```bash
npm run start:dev
```

The API will listen on `http://localhost:3000/api`. Static uploads are served from `http://localhost:3000/uploads`.

### Seeded accounts

| Email              | Password    | Roles          |
|--------------------|-------------|----------------|
| admin@example.com  | Admin1234!  | admin, user    |
| user@example.com   | User1234!   | user           |

## 8. Serve the frontend

Open a second terminal at the project root (not in `backend/`):

```bash
python3 -m http.server 5500
```

Visit `http://localhost:5500` in your browser. The first time you log in, use the "Backend URL" field to point to `http://localhost:3000` and optionally tick "Onthoud URL".

### Docker alternative (one command)

If you prefer to run everything in containers (frontend + API + PostgreSQL):

```bash
docker compose up --build
```

This will expose:

- Frontend at `http://localhost:5500`
- API under `http://localhost:3000/api`
- Database (inside Docker network) reachable via host `db:5432`

The compose file mounts `uploads/` so you keep locally uploaded photos.

### Admin workflow

1. Log in with the admin credentials above.
2. Use the admin panel to create new models or drag-and-drop images onto existing cards.
3. All uploaded images are stored in `uploads/models` and served via `/uploads/...`.

### Regular user workflow

- Register or log in with the seeded user.
- Browse the collection; use the watchlist button on any card to save models to your personal list.

## 9. Stopping services

- Stop the frontend server with `Ctrl+C` in its terminal.
- Stop the NestJS API with `Ctrl+C` in the backend terminal.
- Bring down PostgreSQL when finished:
  ```bash
  docker compose down
  ```

## 10. Troubleshooting quick hits

- **Port already in use?**
  - Kill the process: `lsof -ti:3000 | xargs kill` (adjust port to 5500 for the frontend).
- **Database connection errors?**
  - Ensure Docker is running and `docker compose ps` shows the `db` service as `Up`.
- **Front-end can’t reach API?**
  - Double-check the backend URL stored in localStorage or the login modal input.

You now have the entire Autosite stack running locally. For production deployment steps, refer to the main `README.md`.
