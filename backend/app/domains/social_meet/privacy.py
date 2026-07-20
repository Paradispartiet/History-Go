from __future__ import annotations

from collections.abc import Mapping, Sequence
from dataclasses import dataclass

FORBIDDEN_PROFILE_FIELDS = frozenset(
    {
        "accountid",
        "authsubject",
        "birthdate",
        "chat",
        "checkins",
        "coords",
        "deviceid",
        "distance",
        "distancetoperson",
        "email",
        "feed",
        "followers",
        "following",
        "freetext",
        "gps",
        "ipaddress",
        "lastseen",
        "latitude",
        "legalname",
        "livelocation",
        "longitude",
        "message",
        "messagetext",
        "moderationnotes",
        "nearby",
        "online",
        "paymentdata",
        "phone",
        "presence",
        "publicvisithistory",
        "visitedplaces",
    }
)


@dataclass(frozen=True, slots=True)
class ForbiddenField:
    field: str
    path: str


def find_forbidden_fields(value: object) -> tuple[ForbiddenField, ...]:
    found: list[ForbiddenField] = []
    _scan(value, path="", found=found)
    return tuple(found)


def _scan(value: object, *, path: str, found: list[ForbiddenField]) -> None:
    if isinstance(value, Mapping):
        for raw_key, nested in value.items():
            key = str(raw_key)
            nested_path = f"{path}.{key}" if path else key
            if key.replace("_", "").replace("-", "").lower() in FORBIDDEN_PROFILE_FIELDS:
                found.append(ForbiddenField(field=key, path=nested_path))
            _scan(nested, path=nested_path, found=found)
        return

    if isinstance(value, Sequence) and not isinstance(value, str | bytes | bytearray):
        for index, nested in enumerate(value):
            nested_path = f"{path}[{index}]" if path else f"[{index}]"
            _scan(nested, path=nested_path, found=found)
