"""Authentication boundaries for the History GO backend."""

from app.auth.supabase import AuthPrincipal, SupabaseTokenVerifier

__all__ = ["AuthPrincipal", "SupabaseTokenVerifier"]
