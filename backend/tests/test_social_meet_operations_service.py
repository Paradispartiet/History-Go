from __future__ import annotations

from datetime import UTC, datetime, timedelta
from unittest.mock import MagicMock
from uuid import uuid4

import pytest

from app.auth.authorization import HISTORY_GO_ADMIN_ROLE
from app.auth.supabase import AuthPrincipal
from app.core.config import Settings
from app.domains.social_meet.operations_models import (
    RETENTION_POLICY_VERSION,
    AggregateStatusCounts,
    ApplyRetentionRequest,
    CreateRetentionHoldRequest,
    RetentionCounts,
    RetentionEntityType,
    RetentionHoldReason,
    RetentionHoldStatus,
    RetentionHoldView,
    RetentionRunResult,
    SocialMeetOperationalMetrics,
)
from app.domains.social_meet.operations_repository import (
    PostgresSocialMeetOperationsRepository,
)
from app.domains.social_meet.operations_service import SocialMeetOperationsService
from app.domains.social_meet.service import SocialMeetDomainError

NOW = datetime(2026, 7, 20, 19, 0, tzinfo=UTC)


def test_policy_is_built_from_validated_settings() -> None:
    repository = _repository()
    service = SocialMeetOperationsService(
        Settings(
            environment="test",
            social_meet_retention_terminal_invite_days=200,
            social_meet_retention_closed_report_days=800,
        ),
        repository,
    )

    policy = service.retention_policy()

    assert policy.terminal_invite_days == 200
    assert policy.closed_report_days == 800
    assert policy.safety_audit_days == 1095


def test_preview_is_read_only_and_returns_active_hold_count() -> None:
    repository = _repository()
    repository.preview_retention.return_value = RetentionCounts(terminal_invites=3)
    repository.active_hold_count.return_value = 2
    service = SocialMeetOperationsService(Settings(environment="test"), repository)

    preview = service.preview_retention(now=NOW)

    assert preview.policy_version == RETENTION_POLICY_VERSION
    assert preview.candidate_counts.terminal_invites == 3
    assert preview.active_holds == 2
    repository.preview_retention.assert_called_once()
    repository.apply_retention.assert_not_called()


def test_apply_requires_exact_policy_confirmation() -> None:
    service = SocialMeetOperationsService(Settings(environment="test"), _repository())

    with pytest.raises(SocialMeetDomainError) as error:
        service.apply_retention(
            _admin(),
            ApplyRetentionRequest(confirm_policy_version="stale-policy"),
            now=NOW,
        )

    assert error.value.code == "retention_policy_confirmation_required"


def test_production_apply_fails_closed_until_enabled() -> None:
    repository = _repository()
    service = SocialMeetOperationsService(Settings(environment="production"), repository)

    with pytest.raises(SocialMeetDomainError) as error:
        service.apply_retention(
            _admin(),
            ApplyRetentionRequest(confirm_policy_version=RETENTION_POLICY_VERSION),
            now=NOW,
        )

    assert error.value.code == "backend_not_enabled"
    repository.apply_retention.assert_not_called()


def test_enabled_production_apply_delegates_with_admin_identity() -> None:
    repository = _repository()
    run = _run_result()
    repository.apply_retention.return_value = run
    service = SocialMeetOperationsService(
        Settings(environment="production", social_meet_retention_apply_enabled=True),
        repository,
    )
    admin = _admin()

    result = service.apply_retention(
        admin,
        ApplyRetentionRequest(confirm_policy_version=RETENTION_POLICY_VERSION),
        now=NOW,
    )

    assert result == run
    kwargs = repository.apply_retention.call_args.kwargs
    assert kwargs["policy_version"] == RETENTION_POLICY_VERSION
    assert kwargs["admin_user_id"] == admin.user_id
    assert kwargs["now"] == NOW


def test_timed_hold_must_expire_in_future() -> None:
    repository = _repository()
    service = SocialMeetOperationsService(Settings(environment="test"), repository)

    with pytest.raises(SocialMeetDomainError) as error:
        service.create_retention_hold(
            _admin(),
            _hold_request(hold_until=NOW),
            now=NOW,
        )

    assert error.value.code == "invalid_retention_hold"
    repository.entity_exists.assert_not_called()


def test_hold_requires_existing_entity_and_returns_structured_hold() -> None:
    repository = _repository()
    request = _hold_request(hold_until=NOW + timedelta(days=30))
    repository.entity_exists.return_value = False
    service = SocialMeetOperationsService(Settings(environment="test"), repository)

    with pytest.raises(SocialMeetDomainError) as error:
        service.create_retention_hold(_admin(), request, now=NOW)
    assert error.value.code == "retention_entity_not_found"

    hold = _hold_view(request)
    repository.entity_exists.return_value = True
    repository.create_hold.return_value = hold
    result = service.create_retention_hold(_admin(), request, now=NOW)

    assert result == hold
    repository.create_hold.assert_called_once()


def test_release_hold_is_idempotent_for_existing_hold_and_fails_for_unknown() -> None:
    repository = _repository()
    hold = _hold_view(_hold_request(), status=RetentionHoldStatus.RELEASED)
    repository.release_hold.return_value = hold
    service = SocialMeetOperationsService(Settings(environment="test"), repository)

    assert service.release_retention_hold(_admin(), hold.hold_id, now=NOW) == hold

    repository.release_hold.return_value = None
    with pytest.raises(SocialMeetDomainError) as error:
        service.release_retention_hold(_admin(), uuid4(), now=NOW)
    assert error.value.code == "retention_hold_not_found"


def test_list_holds_and_metrics_are_admin_read_models_without_mutation() -> None:
    repository = _repository()
    hold = _hold_view(_hold_request())
    repository.list_holds.return_value = [hold]
    repository.operational_metrics.return_value = _metrics()
    service = SocialMeetOperationsService(Settings(environment="test"), repository)

    assert service.list_retention_holds(include_released=False, limit=10) == [hold]
    metrics = service.operational_metrics(now=NOW)

    assert metrics.active_blocks == 2
    assert metrics.invite_states.values == {"pending": 4}
    repository.apply_retention.assert_not_called()


def _repository() -> MagicMock:
    return MagicMock(spec=PostgresSocialMeetOperationsRepository)


def _admin() -> AuthPrincipal:
    return AuthPrincipal(user_id=uuid4(), app_roles=frozenset({HISTORY_GO_ADMIN_ROLE}))


def _hold_request(*, hold_until: datetime | None = None) -> CreateRetentionHoldRequest:
    return CreateRetentionHoldRequest(
        entity_type=RetentionEntityType.REPORT,
        entity_id=uuid4(),
        reason_code=RetentionHoldReason.SAFETY_REVIEW,
        hold_until=hold_until,
    )


def _hold_view(
    request: CreateRetentionHoldRequest,
    *,
    status: RetentionHoldStatus = RetentionHoldStatus.ACTIVE,
) -> RetentionHoldView:
    return RetentionHoldView(
        hold_id=uuid4(),
        entity_type=request.entity_type,
        entity_id=request.entity_id,
        reason_code=request.reason_code,
        status=status,
        hold_until=request.hold_until,
        created_at=NOW,
        released_at=NOW if status is RetentionHoldStatus.RELEASED else None,
    )


def _run_result() -> RetentionRunResult:
    return RetentionRunResult(
        run_id=uuid4(),
        mode="apply",
        policy_version=RETENTION_POLICY_VERSION,
        started_at=NOW,
        completed_at=NOW,
        candidate_counts=RetentionCounts(terminal_invites=2),
        deleted_counts=RetentionCounts(terminal_invites=2),
    )


def _metrics() -> SocialMeetOperationalMetrics:
    return SocialMeetOperationalMetrics(
        generated_at=NOW,
        profile_visibility=AggregateStatusCounts(values={"discoverable": 3}),
        invite_states=AggregateStatusCounts(values={"pending": 4}),
        report_states=AggregateStatusCounts(values={"submitted": 1}),
        moderation_queue_states=AggregateStatusCounts(values={"open": 1}),
        active_blocks=2,
        active_restrictions=1,
        open_appeals=1,
        active_retention_holds=1,
        retention_candidates=RetentionCounts(terminal_invites=2),
        last_retention_run=None,
    )
