# Vertex Wallet

A secure, non-custodial Bitcoin payment wallet system with invoice management.

## 🚀 Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - ORM for database operations
- **PostgreSQL** - Production database (Neon)
- **Alembic** - Database migrations
- **JWT** - Authentication
- **BlockCypher API** - Blockchain interactions

### Frontend
- **React** (Vite) - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Three.js** - 3D backgrounds
- **React Query** - Data fetching

## 📋 Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL database (Neon recommended)
- Git

## 🛠️ Setup

### Backend Setup

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Create virtual environment:**
```bash
python -m venv venv
```

3. **Activate virtual environment:**
```bash
# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

4. **Install dependencies:**
```bash
pip install -r requirements.txt
```

5. **Create `.env` file:**
```env
DATABASE_URL=postgresql://user:password@host/database
SECRET_KEY=your-secret-key-here
BLOCKCYPHER_API_KEY=your-api-key
WEBHOOK_SECRET=your-webhook-secret
CORS_ORIGINS=http://localhost:5173
```

6. **Run migrations:**
```bash
alembic upgrade head
```

7. **Seed database (optional):**
```bash
python scripts/seed.py
```

8. **Start backend server:**
```bash
python run.py
```

Backend runs on `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory:**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create `.env` file:**
```env
VITE_API_URL=http://localhost:8000
```

4. **Start development server:**
```bash
npm run dev
```

Frontend runs on `http://localhost:5173`

## 🗄️ Database Management

### Reset Database
```bash
cd backend
python scripts/reset.py
```

### Seed Database
```bash
cd backend
python scripts/seed.py
```

### Reset and Seed
```bash
cd backend
python scripts/reset_and_seed.py
```

## 🔐 Default Test User

After seeding:
- **Email:** `test@example.com`
- **Password:** `test123456`

## 📁 Project Structure

```
vertex-wallet/
├── backend/
│   ├── app/
│   │   ├── api/v1/endpoints/
│   │   ├── core/
│   │   ├── db/
│   │   └── services/
│   ├── alembic/
│   ├── scripts/
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── services/
│   │   └── hooks/
│   └── package.json
└── README.md
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Wallets
- `POST /api/wallets/generate` - Generate BTC address
- `GET /api/wallets/balance` - Get wallet balance

### Invoices
- `POST /api/invoices/create` - Create invoice
- `GET /api/invoices` - List invoices
- `GET /api/invoices/{id}` - Get invoice details

### Transactions
- `GET /api/transactions` - List transactions

## 🚀 Deployment

### Backend (Railway/Render/Heroku)
1. Set environment variables
2. Run migrations: `alembic upgrade head`
3. Start server: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Frontend (Vercel)
1. Connect GitHub repository
2. Set `VITE_API_URL` environment variable
3. Deploy

See `frontend/DEPLOYMENT.md` for detailed Vercel deployment guide.

## 🔒 Security

- Passwords hashed with bcrypt
- JWT tokens for authentication
- CORS configured
- SQL injection protection (SQLAlchemy)
- Environment variables for secrets

## 📝 License

MIT
