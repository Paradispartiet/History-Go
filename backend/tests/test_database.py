from unittest.mock import MagicMock

import app.core.database as database_module
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


def test_configured_database_ping_and_dispose(monkeypatch) -> None:
    engine = MagicMock()
    connection = engine.connect.return_value.__enter__.return_value
    monkeypatch.setattr(database_module, "create_engine", MagicMock(return_value=engine))
    database = Database(
        Settings(environment="test", database_url="postgresql://user:pass@example.com/db")
    )

    status = database.ping()
    database.dispose()

    assert status.configured is True
    assert status.ok is True
    connection.execute.assert_called_once()
    engine.dispose.assert_called_once()


def test_database_ping_reports_connection_failure(monkeypatch) -> None:
    monkeypatch.setattr(
        database_module,
        "create_engine",
        MagicMock(side_effect=OSError("down")),
    )
    database = Database(
        Settings(environment="test", database_url="postgresql://user:pass@example.com/db")
    )

    status = database.ping()

    assert status.configured is True
    assert status.ok is False
    assert status.detail == "unavailable:OSError"
