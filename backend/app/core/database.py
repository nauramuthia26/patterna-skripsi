from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import get_settings
import os

settings = get_settings()

print("CURRENT DIR:", os.getcwd())
print("DATABASE URL:", settings.DATABASE_URL)
print("ABS DB PATH:", os.path.abspath("patterna.db"))

# SQLite butuh connect_args, PostgreSQL tidak
if settings.DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        settings.DATABASE_URL,
        connect_args={"check_same_thread": False},
    )
else:
    # PostgreSQL — Render kadang kasih URL dengan prefix postgres://
    # SQLAlchemy butuh postgresql:// jadi perlu dikonversi
    db_url = settings.DATABASE_URL
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)
    engine = create_engine(db_url)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()