## SpendWise Monorepo

This repo now contains:

- `server/`: FastAPI backend with MySQL and SQLAlchemy
- `client/`: React (Vite) frontend
- `assets/`, `css/`, `js/`, and legacy `.html` remain for reference during migration

### Backend (FastAPI)

Prereqs: Python 3.10+, MySQL running with a database created (e.g., `spendwise`).

1) Configure environment variables (or create `server/.env`):

```
MYSQL_USER=your_user
MYSQL_PASSWORD=your_password
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_DB=spendwise
```

2) Create venv and install dependencies:

```
cd server
python -m venv .venv
.venv/Scripts/activate  # Windows PowerShell: .venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

3) Start API (port 8000):

```
uvicorn server.main:app --reload --host 0.0.0.0 --port 8000
```

Open Swagger UI: http://localhost:8000/docs

### Frontend (React + Vite)

Prereqs: Node 18+ and npm.

1) Create the app (already scaffolded if `client/` exists):

```
cd client
npm install
npm run dev
```

The app expects the API at `http://localhost:8000`. Adjust `VITE_API_URL` in `client/.env` if needed.

### Data Model mapping

- Expenses: id (string), name, category, amount, date (ISO)
- Settings: income, budget (single row)
- Profile: full_name, email, phone_number, date_of_birth, gender, profile_picture (base64)

### Migration status

- Legacy pages (`dashboard.html`, `history.html`, `profile.html`) are being migrated into React routes.
- CSS will be ported progressively into the React app.

