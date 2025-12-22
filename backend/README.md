# Bitcoin Wallet Backend API

FastAPI backend for non-custodial Bitcoin payment wallet.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Set up PostgreSQL database:
```bash
createdb bitcoin_wallet
```

4. Run migrations (tables are auto-created on startup):
```bash
# Tables are created automatically via SQLAlchemy
```

5. Start the server:
```bash
python run.py
# Or: uvicorn app.main:app --reload
```

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Environment Variables

See `.env.example` for required variables.

## Testing

Get a BlockCypher API key from https://www.blockcypher.com/dev/

For testnet, use network `test3` in your `.env` file.

