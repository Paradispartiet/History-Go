from __future__ import annotations

from fastapi import HTTPException, status

from app.auth.supabase import AuthPrincipal

HISTORY_GO_MODERATOR_ROLE = "history_go_moderator"
HISTORY_GO_ADMIN_ROLE = "history_go_admin"


def require_moderator(principal: AuthPrincipal) -> AuthPrincipal:
    if principal.app_roles.isdisjoint({HISTORY_GO_MODERATOR_ROLE, HISTORY_GO_ADMIN_ROLE}):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "code": "moderator_access_required",
                "message": "History GO moderator access is required",
            },
        )
    return principal


def require_admin(principal: AuthPrincipal) -> AuthPrincipal:
    if HISTORY_GO_ADMIN_ROLE not in principal.app_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "code": "admin_access_required",
                "message": "History GO admin access is required",
            },
        )
    return principal
