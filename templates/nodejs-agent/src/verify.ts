import * as crypto from 'crypto';

const GITHUB_PUBLIC_KEYS_URL =
  'https://api.github.com/meta/public_keys/copilot_api';

interface GitHubPublicKey {
  key_identifier: string;
  key: string;
  is_current: boolean;
}

/**
 * Fetches GitHub's current ECDSA public keys used to sign Copilot requests.
 * In production you should cache this response (it rarely changes).
 */
async function fetchPublicKeys(): Promise<GitHubPublicKey[]> {
  const response = await fetch(GITHUB_PUBLIC_KEYS_URL, {
    headers: { 'User-Agent': 'copilot-agent-template' },
  });
  if (!response.ok) {
    throw new Error(
      `Failed to fetch GitHub public keys: ${response.status} ${response.statusText}`
    );
  }
  const data = (await response.json()) as { public_keys: GitHubPublicKey[] };
  return data.public_keys;
}

/**
 * Verifies the ECDSA P-256 signature that GitHub attaches to every Copilot
 * inference request. Throws an error if verification fails.
 *
 * @param rawBody      - The raw (unparsed) request body as a Buffer or string
 * @param keyId        - The value of the X-GitHub-Public-Key-Identifier header
 * @param signature    - The value of the X-GitHub-Public-Key-Signature header (base64)
 */
export async function verifySignature(
  rawBody: Buffer | string,
  keyId: string,
  signature: string
): Promise<void> {
  const keys = await fetchPublicKeys();
  const matchingKey = keys.find((k) => k.key_identifier === keyId);

  if (!matchingKey) {
    throw new Error(`No GitHub public key found for key_identifier: ${keyId}`);
  }

  const verify = crypto.createVerify('SHA256');
  verify.update(rawBody);

  const isValid = verify.verify(
    { key: matchingKey.key, format: 'pem', type: 'spki', dsaEncoding: 'ieee-p1363' },
    signature,
    'base64'
  );

  if (!isValid) {
    throw new Error('Request signature verification failed');
  }
}
