from app.core.config import Settings
from app.core.database import Database, normalize_database_url


def test_normalize_database_url_uses_psycopg3() -> None:
    assert (
        normalize_database_url("postgresql://user:pass@example.com/db")
        == "postgresql+psycopg://user:pass@example.com/db"
    )
    assert (
        normalize_database_url("postgres://user:pass@example.com/db")
        == "postgresql+psycopg://user:pass@example.com/db"
    )


def test_normalize_database_url_preserves_explicit_driver() -> None:
    value = "postgresql+psycopg://user:pass@example.com/db"
    assert normalize_database_url(value) == value


def test_unconfigured_database_does_not_create_engine() -> None:
    database = Database(Settings(environment="test"))

    status = database.ping()

    assert status.configured is False
    assert status.ok is False
    assert status.detail == "not_configured"
