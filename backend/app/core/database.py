from __future__ import annotations

from dataclasses import dataclass

from sqlalchemy import Engine, create_engine, text
from sqlalchemy.exc import SQLAlchemyError

from app.core.config import Settings


@dataclass(frozen=True, slots=True)
class DatabaseStatus:
    configured: bool
    ok: bool
    detail: str


def normalize_database_url(raw_url: str) -> str:
    """Use psycopg 3 explicitly for standard PostgreSQL URLs."""

    value = raw_url.strip()
    if value.startswith("postgres://"):
        return "postgresql+psycopg://" + value.removeprefix("postgres://")
    if value.startswith("postgresql://"):
        return "postgresql+psycopg://" + value.removeprefix("postgresql://")
    return value


class Database:
    """Lazy SQLAlchemy engine boundary shared by server-owned domains."""

    def __init__(self, settings: Settings) -> None:
        self._settings = settings
        self._engine: Engine | None = None

    @property
    def configured(self) -> bool:
        return self._settings.database_configured

    @property
    def engine(self) -> Engine:
        if not self.configured:
            raise RuntimeError("Database is not configured")
        if self._engine is None:
            assert self._settings.database_url is not None
            database_url = normalize_database_url(
                self._settings.database_url.get_secret_value()
            )
            self._engine = create_engine(
                database_url,
                pool_pre_ping=True,
                pool_recycle=300,
            )
        return self._engine

    def ping(self) -> DatabaseStatus:
        if not self.configured:
            return DatabaseStatus(
                configured=False,
                ok=False,
                detail="not_configured",
            )

        try:
            with self.engine.connect() as connection:
                connection.execute(text("select 1"))
        except (SQLAlchemyError, OSError) as exc:
            return DatabaseStatus(
                configured=True,
                ok=False,
                detail=f"unavailable:{exc.__class__.__name__}",
            )

        return DatabaseStatus(configured=True, ok=True, detail="ok")

    def dispose(self) -> None:
        if self._engine is not None:
            self._engine.dispose()
            self._engine = None
