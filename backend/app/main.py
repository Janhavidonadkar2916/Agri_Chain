from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.database import engine, Base
from app.config import UPLOAD_DIR
from app.routers import (
    auth_router,
    farmer_router,
    transport_router,
    warehouse_router,
    retailer_router,
    consumer_router,
    admin_router,
    blockchain_router,
)

# Create database tables automatically on startup
Base.metadata.create_all(bind=engine)

# Auto-seed database if empty (useful for Vercel/ephemeral envs)
try:
    from seed_data import seed
    seed()
except Exception as e:
    import logging
    logging.warning(f"Database auto-seeding skipped or failed: {e}")

app = FastAPI(
    title="AgriChain API",
    description="Blockchain-Based Agricultural Supply Chain Transparency System",
    version="1.0.0"
)

# Enable CORS for frontend Vite React app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded crop images
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Include Routers
app.include_router(auth_router.router)
app.include_router(farmer_router.router)
app.include_router(transport_router.router)
app.include_router(warehouse_router.router)
app.include_router(retailer_router.router)
app.include_router(consumer_router.router)
app.include_router(admin_router.router)
app.include_router(blockchain_router.router)

@app.get("/")
def root():
    return {
        "status": "online",
        "app": "AgriChain Backend API",
        "version": "1.0.0",
        "docs": "/docs"
    }
