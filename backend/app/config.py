import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# Detect if running in Vercel serverless environment
IS_VERCEL = os.getenv("VERCEL") == "1"

DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL:
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+pg8000://", 1)
    elif DATABASE_URL.startswith("postgresql://"):
        DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+pg8000://", 1)
    elif DATABASE_URL.startswith("mysql://"):
        DATABASE_URL = DATABASE_URL.replace("mysql://", "mysql+pymysql://", 1)

    # Strip sslmode from pg8000 URLs to prevent driver parameter conflicts
    if "pg8000" in DATABASE_URL and "sslmode" in DATABASE_URL:
        from urllib.parse import urlparse, urlunparse, parse_qs, urlencode
        u = urlparse(DATABASE_URL)
        q = parse_qs(u.query)
        q.pop("sslmode", None)
        DATABASE_URL = urlunparse(u._replace(query=urlencode(q, doseq=True)))

if IS_VERCEL:
    UPLOAD_DIR = Path("/tmp/uploads")
    if not DATABASE_URL:
        DATABASE_URL = "sqlite:////tmp/agrichain.db"
else:
    UPLOAD_DIR = BASE_DIR / "uploads"
    if not DATABASE_URL:
        DATABASE_URL = f"sqlite:///{BASE_DIR}/agrichain.db"

# Ensure upload directory exists
try:
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
except Exception as e:
    print(f"Warning: Could not create upload directory {UPLOAD_DIR}: {e}")

SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    if IS_VERCEL:
        raise RuntimeError("SECRET_KEY must be configured in Vercel environment variables")
    # Development-only fallback; configure SECRET_KEY for stable local sessions.
    SECRET_KEY = "dev-only-change-me-before-deployment-agrichain"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 # 24 hours

WEB3_PROVIDER_URL = os.getenv("WEB3_PROVIDER_URL", "http://127.0.0.1:8545")
CONTRACT_ADDRESS = os.getenv("CONTRACT_ADDRESS", "0x1234567890123456789012345678901234567890")
WEB3_PRIVATE_KEY = os.getenv("WEB3_PRIVATE_KEY", "")
BLOCKCHAIN_MODE = os.getenv("BLOCKCHAIN_MODE", "legacy")
