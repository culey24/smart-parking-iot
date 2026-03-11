"""Database connection and session management for SQLModel + SQLite."""

import os
from pathlib import Path
from sqlmodel import Session, create_engine, SQLModel

# Resolve SQLite path: try prisma/prisma/dev.db then prisma/dev.db
_BACKEND_ROOT = Path(__file__).resolve().parent.parent
_CANDIDATES = [
    _BACKEND_ROOT / "prisma" / "prisma" / "dev.db",
    _BACKEND_ROOT / "prisma" / "dev.db",
]
DB_PATH = next((p for p in _CANDIDATES if p.exists()), _CANDIDATES[0])
DATABASE_URL = os.getenv("DATABASE_URL_SQLMODEL", f"sqlite:///{DB_PATH}")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    echo=False,
)


def get_session() -> Session:
    """Dependency that yields a database session."""
    with Session(engine) as session:
        yield session
