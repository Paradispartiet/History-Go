from fastapi.testclient import TestClient

from app.core.config import Settings
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


def test_openapi_is_disabled_in_production() -> None:
    app = create_app(Settings(environment="production", docs_enabled=True))

    assert app.docs_url is None
    assert app.redoc_url is None
    assert app.openapi_url is None
