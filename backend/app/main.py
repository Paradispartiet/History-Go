from __future__ import annotations

from collections.abc import AsyncIterator, Awaitable, Callable
from contextlib import asynccontextmanager
from uuid import uuid4

from fastapi import FastAPI, Request, Response

from app.api.routes.health import router as health_router
from app.api.routes.social_meet import router as social_meet_router
from app.auth.supabase import SupabaseTokenVerifier
from app.core.config import Settings, get_settings
from app.core.database import Database


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    yield
    database = getattr(app.state, "database", None)
    if isinstance(database, Database):
        database.dispose()


def create_app(settings: Settings | None = None) -> FastAPI:
    """Create the History GO API with explicit infrastructure boundaries."""

    runtime_settings = settings or get_settings()
    app = FastAPI(
        title=runtime_settings.app_name,
        version=runtime_settings.app_version,
        docs_url="/docs" if runtime_settings.openapi_enabled else None,
        redoc_url="/redoc" if runtime_settings.openapi_enabled else None,
        openapi_url="/openapi.json" if runtime_settings.openapi_enabled else None,
        lifespan=lifespan,
    )

    app.state.settings = runtime_settings
    app.state.database = Database(runtime_settings)
    app.state.token_verifier = SupabaseTokenVerifier(runtime_settings)

    @app.middleware("http")
    async def request_id_middleware(
        request: Request,
        call_next: Callable[[Request], Awaitable[Response]],
    ) -> Response:
        request_id = str(uuid4())
        request.state.request_id = request_id
        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        return response

    app.include_router(health_router, prefix=runtime_settings.api_prefix)
    app.include_router(social_meet_router, prefix=runtime_settings.api_prefix)
    return app


app = create_app()
