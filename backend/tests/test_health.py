from fastapi.testclient import TestClient

from app.core.config import Settings
from app.core.database import DatabaseStatus
from app.main import create_app


def test_liveness_is_independent_of_external_services() -> None:
    client = TestClient(create_app(Settings(environment="test")))

    response = client.get("/api/v1/health/live")

    assert response.status_code == 200
    assert response.json()["status"] == "ok"
    assert response.headers["X-Request-ID"]


def test_readiness_skips_optional_unconfigured_services() -> None:
    client = TestClient(create_app(Settings(environment="test")))

    response = client.get("/api/v1/health/ready")

    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "ok"
    assert payload["checks"]["database"] == {
        "status": "skipped",
        "detail": "not_configured",
    }
    assert payload["checks"]["auth"] == {
        "status": "skipped",
        "detail": "not_configured",
    }


def test_readiness_fails_closed_when_required_database_is_missing() -> None:
    settings = Settings(
        environment="test",
        readiness_require_database=True,
    )
    client = TestClient(create_app(settings))

    response = client.get("/api/v1/health/ready")

    assert response.status_code == 503
    payload = response.json()
    assert payload["status"] == "error"
    assert payload["checks"]["database"] == {
        "status": "error",
        "detail": "required_not_configured",
    }


def test_readiness_fails_when_configured_database_is_unavailable() -> None:
    class UnavailableDatabase:
        configured = True

        @staticmethod
        def ping() -> DatabaseStatus:
            return DatabaseStatus(configured=True, ok=False, detail="unavailable:OSError")

    app = create_app(Settings(environment="test"))
    app.state.database = UnavailableDatabase()
    client = TestClient(app)

    response = client.get("/api/v1/health/ready")

    assert response.status_code == 503
    assert response.json()["checks"]["database"] == {
        "status": "error",
        "detail": "unavailable:OSError",
    }


def test_readiness_fails_closed_when_required_auth_is_missing() -> None:
    client = TestClient(create_app(Settings(environment="test", readiness_require_auth=True)))

    response = client.get("/api/v1/health/ready")

    assert response.status_code == 503
    assert response.json()["checks"]["auth"] == {
        "status": "error",
        "detail": "required_not_configured",
    }


def test_readiness_accepts_configured_auth_boundary() -> None:
    client = TestClient(
        create_app(
            Settings(
                environment="test",
                supabase_url="https://example.supabase.co",
                readiness_require_auth=True,
            )
        )
    )

    response = client.get("/api/v1/health/ready")

    assert response.status_code == 200
    assert response.json()["checks"]["auth"] == {"status": "ok", "detail": "ok"}


def test_openapi_is_disabled_in_production() -> None:
    app = create_app(Settings(environment="production", docs_enabled=True))

    assert app.docs_url is None
    assert app.redoc_url is None
    assert app.openapi_url is None


def test_lifespan_disposes_database_boundary() -> None:
    app = create_app(Settings(environment="test"))

    with TestClient(app) as client:
        assert client.get("/api/v1/health/live").status_code == 200
