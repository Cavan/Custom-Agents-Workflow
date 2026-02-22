"""
ECDSA signature verification for GitHub Copilot inference requests.

GitHub signs every request with an ECDSA P-256 private key. This module
fetches the current public keys from the GitHub API and verifies the
signature attached to each inbound request.
"""

import hashlib
import base64
import requests as _requests

from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.exceptions import InvalidSignature

GITHUB_PUBLIC_KEYS_URL = "https://api.github.com/meta/public_keys/copilot_api"


def _fetch_public_keys() -> list[dict]:
    """
    Fetches GitHub's current ECDSA public keys.

    In production you should cache this response — it rarely changes
    (GitHub rotates keys infrequently).
    """
    resp = _requests.get(
        GITHUB_PUBLIC_KEYS_URL,
        headers={"User-Agent": "copilot-agent-template"},
        timeout=10,
    )
    resp.raise_for_status()
    return resp.json().get("public_keys", [])


def verify_signature(raw_body: bytes, key_id: str, signature_b64: str) -> None:
    """
    Verifies the ECDSA P-256 signature GitHub sends with every Copilot request.

    Args:
        raw_body:       The raw (unparsed) request body bytes.
        key_id:         Value of the X-GitHub-Public-Key-Identifier header.
        signature_b64:  Value of the X-GitHub-Public-Key-Signature header (base64).

    Raises:
        ValueError:        If the key is not found or the signature is invalid.
        InvalidSignature:  Propagated from the cryptography library.
    """
    keys = _fetch_public_keys()
    matching = next((k for k in keys if k.get("key_identifier") == key_id), None)

    if matching is None:
        raise ValueError(f"No GitHub public key found for key_identifier: {key_id}")

    public_key = serialization.load_pem_public_key(matching["key"].encode())

    if not isinstance(public_key, ec.EllipticCurvePublicKey):
        raise ValueError("Expected an EC public key from GitHub")

    signature_bytes = base64.b64decode(signature_b64)

    # GitHub uses IEEE P1363 encoding; convert to DER for the cryptography lib.
    # P-256 signatures are 64 bytes in P1363 (r || s, each 32 bytes).
    if len(signature_bytes) == 64:
        r = int.from_bytes(signature_bytes[:32], "big")
        s = int.from_bytes(signature_bytes[32:], "big")
        from cryptography.hazmat.primitives.asymmetric.utils import encode_dss_signature
        der_signature = encode_dss_signature(r, s)
    else:
        # Already DER-encoded (fallback)
        der_signature = signature_bytes

    public_key.verify(der_signature, raw_body, ec.ECDSA(hashes.SHA256()))
    # verify() raises InvalidSignature if the check fails; nothing to return.
