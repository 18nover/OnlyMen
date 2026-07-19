# Authentication Patterns

## Overview

The authentication system is built on AT Protocol OAuth, providing decentralized identity with standard OAuth 2.0 flows. It handles token lifecycle, secure storage, session management, and multi-device support across iOS, Android, and web.

## The four server-side auth surfaces (where they live in our fork)

1. **Session JWTs** — `com.atproto.server.createSession` issues a
   short-lived access token + rotating refresh token; verified by
   `atproto/packages/pds/src/auth-verifier.ts`. This is what the app uses
   today (`app/src/state/session/`).
2. **App passwords** — scoped credentials for third-party clients; scope
   enforcement in `pds/src/auth-scope.ts`.
3. **Service auth** — short-lived JWTs signed with the *user's repo key*,
   audience-bound, used for PDS→AppView proxied reads (`pipethrough.ts`);
   verified by `atproto/packages/bsky/src/auth-verifier.ts`. The AppView
   has no sessions of its own — this is the only identity it trusts.
4. **OAuth (DPoP + PAR)** — the PDS is an OAuth authorization server
   (`pds/src/account-manager/oauth-store.ts`, `pds/src/auth-routes.ts`,
   built on `atproto/packages/oauth*`). The client flow below rides on
   this. Protocol details: Sentinel's `oauth.md`.

Role auth exists per-method for system endpoints (e.g.
`app.bsky.contact.sendNotification`) — auth is chosen per XRPC method,
never per namespace (see `xrpc.md`).

---

## AT Protocol OAuth Flow

### High-Level Flow

```
┌─────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Client  │────>│ Auth      │────>│ Identity │────>│ PLC      │
│  App     │     │ Server   │     │ Provider │     │ Directory│
└─────────┘     └──────────┘     └──────────┘     └──────────┘
     │               │                │                 │
     │  1. Discover  │                │                 │
     │──────────────>│                │                 │
     │               │                │                 │
     │  2. Register  │                │                 │
     │──────────────>│                │                 │
     │               │                │                 │
     │  3. Auth Request               │                 │
     │──────────────>│                │                 │
     │               │                │                 │
     │  4. User Auth │                │                 │
     │               │───────────────>│                 │
     │               │                │  5. Resolve     │
     │               │                │────────────────>│
     │               │                │                 │
     │  6. Token Exchange             │                 │
     │──────────────>│                │                 │
     │               │                │                 │
     │  7. Access + Refresh Tokens   │                 │
     │<──────────────│                │                 │
```

### Step-by-Step

1. **Discover**: Resolve the user's handle to an identity provider via PLC directory
2. **Register**: Register a client with the auth server (PKCE required)
3. **Auth Request**: Redirect user to identity provider with authorization request
4. **User Auth**: User authenticates (credentials, MFA, etc.)
5. **Resolve**: Identity provider resolves DID document for signing keys
6. **Token Exchange**: Exchange authorization code for tokens (with PKCE verifier)
7. **Tokens**: Receive access token + refresh token

### Implementation

```ts
import { Auth } from '@atproto/oauth-client';

const client = new Auth({
  clientMetadata: {
    client_id: 'https://your-app.example.com/oauth-client-metadata.json',
    client_name: 'OnlyMen',
    redirect_uris: ['onlymen://oauth/callback'],
    scope: 'atproto transition:generic',
    grant_types: ['authorization_code', 'refresh_token'],
    response_types: ['code'],
    token_endpoint_auth_method: 'none', // PKCE only
  },
});

// Start auth flow
async function login(handle: string) {
  const { url, codeVerifier, state } = await client.authorize(handle, {
    scope: 'atproto transition:generic',
    prompt: 'login',
  });

  // Store codeVerifier securely for token exchange
  await SecureStore.setAsync('oauth_code_verifier', codeVerifier);
  await SecureStore.setAsync('oauth_state', state);

  // Redirect to auth URL
  await WebBrowser.openAuthSessionAsync(url, 'onlymen://oauth/callback');
}
```

---

## Token Lifecycle

### Access Token

| Property      | Value                                    |
|---------------|------------------------------------------|
| Purpose       | Authenticate API requests                |
| Lifetime      | Short-lived (typically 1–2 hours)        |
| Transmission  | `Authorization: Bearer <token>` header   |
| Scope         | Limited to granted permissions           |

### Refresh Token

| Property      | Value                                    |
|---------------|------------------------------------------|
| Purpose       | Obtain new access tokens                 |
| Lifetime      | Long-lived (days to weeks)               |
| Storage       | Secure enclave / keychain only           |
| Rotation      | Rotated on each use (refresh token rotation) |
| Scope         | Same as original grant                   |

### Token Lifecycle Diagram

```
Login → Access Token (short) → API Requests
                ↓ (expires)
         Refresh Token → New Access Token
                ↓ (rotated)
         New Refresh Token → Store Securely
                ↓ (max age reached)
         Re-Login Required
```

---

## Token Storage

### iOS — Keychain

```ts
import * as Keychain from 'react-native-keychain';

// Store tokens
await Keychain.setGenericPassword('auth', JSON.stringify({
  accessToken,
  refreshToken,
  expiresAt,
  handle,
  did,
}), {
  service: 'com.onlymen.auth',
  accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  securityLevel: Keychain.SECURITY.SECURE_HARDWARE,
});

// Retrieve tokens
const credentials = await Keychain.getGenericPassword({
  service: 'com.onlymen.auth',
});

if (credentials) {
  const tokens = JSON.parse(credentials.password);
  return tokens;
}

// Delete tokens (logout)
await Keychain.resetGenericPassword({
  service: 'com.onlymen.auth',
});
```

### Android — Keystore

```ts
import * as Keychain from 'react-native-keychain';

// Same API — react-native-keychain uses Android Keystore internally
await Keychain.setGenericPassword('auth', JSON.stringify(tokens), {
  service: 'com.onlymen.auth',
  accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  securityLevel: Keychain.SECURITY.SECURE_HARDWARE,
});
```

### Web — HttpOnly Cookies + Memory

```ts
// Access token: memory only (cleared on page close)
let accessToken: string | null = null;

// Refresh token: httpOnly cookie managed by server
// No client-side access needed

// Store access token in memory on login
function onTokenReceived(token: string, expiresAt: number) {
  accessToken = token;
  scheduleRefresh(expiresAt);
}

// Clear on logout
function clearAuth() {
  accessToken = null;
}
```

---

## Token Rotation

Refresh tokens are rotated on each use to detect token theft.

```ts
async function refreshTokens(currentRefreshToken: string): Promise<Tokens> {
  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'refresh_token',
      refresh_token: currentRefreshToken,
      client_id: CLIENT_ID,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    // Refresh token invalid — force re-login
    throw new AuthError('Token refresh failed', data);
  }

  // Store new tokens, discard old refresh token
  await storeTokens({
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  });

  return data;
}
```

### Rotation Strategy

```
Token A (issued) → Used → Token B (issued, A invalidated)
Token B (issued) → Used → Token C (issued, B invalidated)
Token B (stolen) → Used → ERROR (B already invalidated by legitimate use)
                         → Force all sessions to re-authenticate
```

---

## Session Management

### Session State

```ts
interface Session {
  handle: string;
  did: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  createdAt: number;
  deviceName: string;
  lastActiveAt: number;
  isActive: boolean;
}
```

### Session Lifecycle

```ts
class SessionManager {
  private refreshTimer: ReturnType<typeof setTimeout> | null = null;

  async initialize(): Promise<boolean> {
    const tokens = await loadStoredTokens();
    if (!tokens) return false;

    // Check if access token is still valid
    if (Date.now() < tokens.expiresAt) {
      this.scheduleRefresh(tokens.expiresAt);
      return true;
    }

    // Access token expired — try refresh
    try {
      await refreshTokens(tokens.refreshToken);
      return true;
    } catch {
      // Refresh failed — need re-login
      return false;
    }
  }

  scheduleRefresh(expiresAt: number) {
    if (this.refreshTimer) clearTimeout(this.refreshTimer);

    // Refresh 5 minutes before expiry
    const refreshAt = expiresAt - 5 * 60 * 1000;
    const delay = Math.max(0, refreshAt - Date.now());

    this.refreshTimer = setTimeout(() => this.refresh(), delay);
  }

  async refresh() {
    const tokens = await loadStoredTokens();
    if (!tokens) return this.logout();

    try {
      await refreshTokens(tokens.refreshToken);
      this.scheduleRefresh(Date.now() + TOKEN_LIFETIME);
    } catch {
      this.logout();
    }
  }

  async logout() {
    if (this.refreshTimer) clearTimeout(this.refreshTimer);

    // Revoke refresh token on server
    const tokens = await loadStoredTokens();
    if (tokens) {
      await revokeToken(tokens.refreshToken).catch(() => {});
    }

    // Clear local storage
    await clearStoredTokens();
  }
}
```

---

## Logout Flow

### Client-Side Logout

```ts
async function logout() {
  // 1. Clear session timers
  sessionManager.cancelTimers();

  // 2. Revoke refresh token on server
  const tokens = await loadStoredTokens();
  if (tokens?.refreshToken) {
    await fetch(REVOKE_ENDPOINT, {
      method: 'POST',
      body: JSON.stringify({ token: tokens.refreshToken }),
    }).catch(() => {});
  }

  // 3. Clear secure storage
  await Keychain.resetGenericPassword({ service: 'com.onlymen.auth' });

  // 4. Clear in-memory state
  clearAuthState();
  clearUserProfile();
  clearCachedData();

  // 5. Navigate to login screen
  navigation.reset({
    index: 0,
    routes: [{ name: 'Auth' }],
  });
}
```

### Server-Side Revocation

```ts
// Server-side: revoke all tokens for a DID
async function revokeAllSessions(did: string) {
  await db.sessions.updateMany({
    where: { did },
    data: { isActive: false, revokedAt: new Date() },
  });

  // Optionally notify other devices via push
  await notifySessionsRevoked(did);
}
```

---

## Multi-Device Support

### Device Registration

```ts
interface DeviceSession {
  id: string;
  did: string;
  deviceName: string;
  deviceType: 'ios' | 'android' | 'web';
  pushToken?: string;
  lastActiveAt: Date;
  createdAt: Date;
  isActive: boolean;
}

// Register device on login
async function registerDevice(did: string, pushToken?: string) {
  await api.registerDevice({
    did,
    deviceName: await getDeviceName(),
    deviceType: Platform.OS,
    pushToken,
  });
}
```

### Session Listing

```ts
// Show all active sessions for a user
async function listSessions(did: string): Promise<DeviceSession[]> {
  const sessions = await api.getSessions(did);
  return sessions.filter(s => s.isActive);
}
```

### Remote Logout

```ts
// Logout a specific device
async function remoteLogout(sessionId: string) {
  await api.revokeSession(sessionId);
}

// Logout all devices except current
async function logoutAllOtherDevices(currentSessionId: string) {
  const sessions = await listSessions(currentDid);
  for (const session of sessions) {
    if (session.id !== currentSessionId) {
      await api.revokeSession(session.id);
    }
  }
}
```

---

## Error Handling

### Auth Error Types

```ts
enum AuthErrorType {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_REFRESH_FAILED = 'TOKEN_REFRESH_FAILED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  RATE_LIMITED = 'RATE_LIMITED',
  ACCOUNT_SUSPENDED = 'ACCOUNT_SUSPENDED',
  MFA_REQUIRED = 'MFA_REQUIRED',
}
```

### Error Recovery

```ts
async function handleAuthError(error: AuthError) {
  switch (error.type) {
    case AuthErrorType.TOKEN_EXPIRED:
      // Try refresh
      return await sessionManager.refresh();

    case AuthErrorType.TOKEN_REFRESH_FAILED:
      // Force re-login
      return await sessionManager.logout();

    case AuthErrorType.NETWORK_ERROR:
      // Queue retry
      return await retryWithBackoff(() => sessionManager.refresh());

    case AuthErrorType.RATE_LIMITED:
      // Wait and retry
      await delay(error.retryAfter || 60000);
      return await sessionManager.refresh();

    default:
      // Show error to user
      showError(error.message);
  }
}
```

---

## Security Best Practices

1. **Never store tokens in AsyncStorage** — always use secure storage (Keychain/Keystore)
2. **Use PKCE** for all OAuth flows — never use implicit grant
3. **Rotate refresh tokens** on every use
4. **Set short access token lifetimes** (1–2 hours maximum)
5. **Bind tokens to device** — use device-specific storage
6. **Clear all state on logout** — tokens, cached data, navigation state
7. **Validate tokens server-side** — never trust client-provided user identity
8. **Use HTTPS only** for all auth endpoints
9. **Implement token revocation** — support remote logout
10. **Audit sessions** — allow users to view and revoke active sessions
