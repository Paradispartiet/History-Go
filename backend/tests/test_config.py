from app.core.config import Settings


def test_supabase_urls_are_derived_from_project_url() -> None:
    settings = Settings(
        environment="test",
        supabase_url="https://example.supabase.co",
    )

    assert settings.auth_configured is True
    assert settings.supabase_issuer == "https://example.supabase.co/auth/v1"
    assert settings.supabase_jwks_url == (
        "https://example.supabase.co/auth/v1/.well-known/jwks.json"
    )


def test_database_configuration_does_not_expose_secret_value() -> None:
    settings = Settings(
        environment="test",
        database_url="postgresql://user:secret@example.com/db",
    )

    assert settings.database_configured is True
    assert "secret" not in repr(settings.database_url)
