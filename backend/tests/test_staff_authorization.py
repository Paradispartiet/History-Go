from __future__ import annotations

from uuid import uuid4

import pytest
from fastapi import HTTPException

from app.auth.authorization import (
    HISTORY_GO_ADMIN_ROLE,
    HISTORY_GO_MODERATOR_ROLE,
    require_admin,
    require_moderator,
)
from app.auth.supabase import AuthPrincipal, SupabaseTokenVerifier, _extract_app_roles


def test_staff_roles_are_read_only_from_app_metadata_values() -> None:
    roles = _extract_app_roles(
        {
            "history_go_roles": [
                " history_go_moderator ",
                "HISTORY_GO_ADMIN",
                "history_go_moderator",
            ]
        }
    )

    assert roles == frozenset({HISTORY_GO_MODERATOR_ROLE, HISTORY_GO_ADMIN_ROLE})


def test_missing_or_invalid_app_metadata_has_no_staff_roles() -> None:
    assert _extract_app_roles(None) == frozenset()
    assert _extract_app_roles({"history_go_roles": 42}) == frozenset()


def test_verified_claims_expose_server_controlled_app_roles() -> None:
    principal = SupabaseTokenVerifier._principal_from_claims(
        {
            "sub": str(uuid4()),
            "role": "authenticated",
            "email": "moderator@example.test",
            "app_metadata": {"history_go_roles": [HISTORY_GO_MODERATOR_ROLE]},
            "user_metadata": {"history_go_roles": [HISTORY_GO_ADMIN_ROLE]},
        }
    )

    assert principal.app_roles == frozenset({HISTORY_GO_MODERATOR_ROLE})


def test_moderator_role_allows_moderator_boundary_but_not_admin_boundary() -> None:
    principal = AuthPrincipal(
        user_id=uuid4(),
        app_roles=frozenset({HISTORY_GO_MODERATOR_ROLE}),
    )

    assert require_moderator(principal) is principal
    with pytest.raises(HTTPException) as error:
        require_admin(principal)

    assert error.value.status_code == 403


def test_admin_role_allows_both_staff_boundaries() -> None:
    principal = AuthPrincipal(
        user_id=uuid4(),
        app_roles=frozenset({HISTORY_GO_ADMIN_ROLE}),
    )

    assert require_moderator(principal) is principal
    assert require_admin(principal) is principal


def test_email_or_generic_supabase_role_never_grants_moderator_access() -> None:
    principal = AuthPrincipal(
        user_id=uuid4(),
        role="authenticated",
        email="admin@example.test",
    )

    with pytest.raises(HTTPException) as error:
        require_moderator(principal)

    assert error.value.status_code == 403
