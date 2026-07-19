# API Documentation Standards

## Overview

**In this stack the API contract is lexicons, not OpenAPI.** Every backend
endpoint is defined by a lexicon JSON in `atproto/lexicons/` — the schema
(with its `description` fields) is the primary API documentation, and
`lex-cli gen-md` generates Markdown reference docs straight from it.
Scribe's job for XRPC surfaces: get the `description` fields right in the
lexicon (with Lexi), generate, then write the *narrative* layer (flows,
auth requirements, examples) that schemas can't express — e.g. the
age-assurance begin→getState flow or the phone-verify→import contact flow.
Never hand-write a second source of truth for request/response shapes.

The OpenAPI material below applies only to auxiliary non-XRPC services
(internal dashboards, webhooks), and as general documentation craft.

## OpenAPI/Swagger Format

### Base Specification

```yaml
openapi: 3.1.0
info:
  title: My API
  description: |
    Comprehensive API for managing users, posts, and notifications.
    All endpoints require authentication unless noted otherwise.
  version: 1.2.0
  contact:
    name: API Support
    email: api-support@example.com
  license:
    name: MIT
    url: https://opensource.org/licenses/MIT

servers:
  - url: https://api.example.com/v1
    description: Production
  - url: https://api-staging.example.com/v1
    description: Staging
  - url: http://localhost:3000/v1
    description: Development
```

### Security Scheme

```yaml
components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: |
        JWT token obtained from /auth/login endpoint.
        Include in Authorization header: `Bearer <token>`

    ApiKeyAuth:
      type: apiKey
      in: header
      name: X-API-Key
      description: API key for server-to-server communication

security:
  - BearerAuth: []
```

## Endpoint Documentation

### Complete Endpoint Example

```yaml
paths:
  /users:
    get:
      operationId: listUsers
      summary: List all users
      description: |
        Returns a paginated list of users.
        Supports filtering by role, status, and search query.
        Results are sorted by creation date (newest first).
      tags:
        - Users
      parameters:
        - name: page
          in: query
          description: Page number (1-indexed)
          required: false
          schema:
            type: integer
            default: 1
            minimum: 1
            example: 1
        - name: limit
          in: query
          description: Number of items per page
          required: false
          schema:
            type: integer
            default: 20
            minimum: 1
            maximum: 100
            example: 20
        - name: role
          in: query
          description: Filter by user role
          required: false
          schema:
            type: string
            enum: [admin, member, viewer]
        - name: search
          in: query
          description: Search by name or email
          required: false
          schema:
            type: string
            minLength: 2
            maxLength: 100
            example: "alice"
      responses:
        "200":
          description: Successful response
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/UserListResponse"
              example:
                data:
                  - id: "usr_123"
                    name: "Alice Johnson"
                    email: "alice@example.com"
                    role: "admin"
                    created_at: "2025-01-15T10:30:00Z"
                pagination:
                  page: 1
                  limit: 20
                  total: 150
        "401":
          $ref: "#/components/responses/Unauthorized"
        "429":
          $ref: "#/components/responses/RateLimited"
        "500":
          $ref: "#/components/responses/InternalError"

    post:
      operationId: createUser
      summary: Create a new user
      description: Creates a new user account. Requires admin privileges.
      tags:
        - Users
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/CreateUserRequest"
            example:
              name: "Bob Smith"
              email: "bob@example.com"
              role: "member"
      responses:
        "201":
          description: User created successfully
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/UserResponse"
        "400":
          $ref: "#/components/responses/BadRequest"
        "401":
          $ref: "#/components/responses/Unauthorized"
        "409":
          description: Email already exists
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ErrorResponse"
              example:
                error:
                  code: "EMAIL_EXISTS"
                  message: "A user with this email already exists"
        "422":
          $ref: "#/components/responses/ValidationError"
```

## Request/Response Schemas

### Schema Definitions

```yaml
components:
  schemas:
    User:
      type: object
      required:
        - id
        - name
        - email
        - created_at
      properties:
        id:
          type: string
          description: Unique user identifier
          example: "usr_123"
          readOnly: true
        name:
          type: string
          description: User's full name
          minLength: 1
          maxLength: 100
          example: "Alice Johnson"
        email:
          type: string
          format: email
          description: User's email address (unique)
          example: "alice@example.com"
        role:
          type: string
          enum: [admin, member, viewer]
          description: User's role in the organization
          default: "member"
        avatar_url:
          type: string
          format: uri
          nullable: true
          description: URL to user's profile picture
        created_at:
          type: string
          format: date-time
          description: Account creation timestamp (ISO 8601)
          example: "2025-01-15T10:30:00Z"
          readOnly: true
        updated_at:
          type: string
          format: date-time
          description: Last update timestamp
          example: "2025-01-20T14:45:00Z"
          readOnly: true

    CreateUserRequest:
      type: object
      required:
        - name
        - email
      properties:
        name:
          type: string
          minLength: 1
          maxLength: 100
          description: User's full name
        email:
          type: string
          format: email
          description: User's email address
        role:
          type: string
          enum: [admin, member, viewer]
          default: "member"
        password:
          type: string
          format: password
          minLength: 8
          description: Initial password (min 8 characters)

    UserListResponse:
      type: object
      properties:
        data:
          type: array
          items:
            $ref: "#/components/schemas/User"
        pagination:
          $ref: "#/components/schemas/Pagination"

    Pagination:
      type: object
      properties:
        page:
          type: integer
          description: Current page number
        limit:
          type: integer
          description: Items per page
        total:
          type: integer
          description: Total number of items
        total_pages:
          type: integer
          description: Total number of pages

    ErrorResponse:
      type: object
      required:
        - error
      properties:
        error:
          type: object
          required:
            - code
            - message
          properties:
            code:
              type: string
              description: Machine-readable error code
              example: "VALIDATION_ERROR"
            message:
              type: string
              description: Human-readable error message
              example: "Invalid input data"
            details:
              type: array
              items:
                type: object
                properties:
                  field:
                    type: string
                    description: Field that caused the error
                  message:
                    type: string
                    description: Specific error message for this field
            request_id:
              type: string
              description: Unique request identifier for support
              example: "req_abc123"
```

## Error Codes

### Error Code Reference

```yaml
components:
  schemas:
    ErrorCode:
      type: string
      enum:
        # Authentication & Authorization (1xxx)
        - AUTH_TOKEN_EXPIRED        # 1001
        - AUTH_TOKEN_INVALID        # 1002
        - AUTH_REQUIRED             # 1003
        - AUTH_INSUFFICIENT_SCOPE   # 1004
        - AUTH_ACCOUNT_LOCKED       # 1005
        - AUTH_INVALID_CREDENTIALS  # 1006

        # Validation (2xxx)
        - VALIDATION_ERROR          # 2001
        - VALIDATION_REQUIRED_FIELD # 2002
        - VALIDATION_INVALID_FORMAT # 2003
        - VALIDATION_TOO_SHORT      # 2004
        - VALIDATION_TOO_LONG       # 2005
        - VALIDATION_INVALID_ENUM   # 2006

        # Resource (3xxx)
        - RESOURCE_NOT_FOUND        # 3001
        - RESOURCE_ALREADY_EXISTS   # 3002
        - RESOURCE_CONFLICT         # 3003
        - RESOURCE_LOCKED           # 3004

        # Rate Limiting (4xxx)
        - RATE_LIMITED              # 4001
        - RATE_LIMITED_RETRY_AFTER  # 4002

        # Server (5xxx)
        - INTERNAL_ERROR            # 5001
        - SERVICE_UNAVAILABLE       # 5002
        - DATABASE_ERROR            # 5003
        - EXTERNAL_SERVICE_ERROR    # 5004
```

### HTTP Status Code Mapping

| Status | Error Code               | Description                    |
|--------|--------------------------|--------------------------------|
| 400    | VALIDATION_ERROR         | Request validation failed      |
| 401    | AUTH_TOKEN_EXPIRED       | Authentication required        |
| 403    | AUTH_INSUFFICIENT_SCOPE  | Insufficient permissions       |
| 404    | RESOURCE_NOT_FOUND       | Resource doesn't exist         |
| 409    | RESOURCE_CONFLICT        | Conflict with existing data    |
| 422    | VALIDATION_ERROR         | Semantic validation failed     |
| 429    | RATE_LIMITED             | Too many requests              |
| 500    | INTERNAL_ERROR           | Unexpected server error        |
| 503    | SERVICE_UNAVAILABLE      | Service temporarily down       |

### Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      },
      {
        "field": "name",
        "message": "Name is required"
      }
    ],
    "request_id": "req_abc123"
  }
}
```

## Authentication Documentation

### Authentication Flow

```yaml
paths:
  /auth/login:
    post:
      operationId: login
      summary: Authenticate user
      description: |
        Returns a JWT access token and refresh token.
        Access tokens expire in 1 hour.
        Refresh tokens expire in 30 days.
      tags:
        - Authentication
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - email
                - password
              properties:
                email:
                  type: string
                  format: email
                password:
                  type: string
                  format: password
      responses:
        "200":
          description: Authentication successful
          content:
            application/json:
              schema:
                type: object
                properties:
                  access_token:
                    type: string
                    description: JWT access token (1 hour expiry)
                  refresh_token:
                    type: string
                    description: Refresh token (30 day expiry)
                  expires_in:
                    type: integer
                    description: Access token expiry in seconds
                    example: 3600
                  token_type:
                    type: string
                    example: "Bearer"

  /auth/refresh:
    post:
      operationId: refreshToken
      summary: Refresh access token
      description: |
        Exchange a refresh token for a new access token.
        The refresh token is rotated on each use.
      tags:
        - Authentication
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - refresh_token
              properties:
                refresh_token:
                  type: string
      responses:
        "200":
          description: Token refreshed
        "401":
          description: Invalid or expired refresh token
```

## Rate Limit Documentation

### Rate Limit Headers

```yaml
components:
  headers:
    X-RateLimit-Limit:
      description: Maximum requests per window
      schema:
        type: integer
        example: 100
    X-RateLimit-Remaining:
      description: Requests remaining in current window
      schema:
        type: integer
        example: 85
    X-RateLimit-Reset:
      description: Unix timestamp when window resets
      schema:
        type: integer
        example: 1706140800
    Retry-After:
      description: Seconds until rate limit resets (on 429)
      schema:
        type: integer
        example: 30
```

### Rate Limit Tiers

| Tier           | Requests/min | Burst    | Applies To              |
|----------------|-------------|----------|-------------------------|
| Anonymous      | 10          | 5        | Unauthenticated         |
| Basic          | 100         | 20       | Regular users           |
| Premium        | 1000        | 100      | Premium subscribers     |
| Internal       | 10000       | 500      | Server-to-server        |

### Rate Limit Response

```json
{
  "error": {
    "code": "RATE_LIMITED",
    "message": "Rate limit exceeded",
    "details": {
      "limit": 100,
      "remaining": 0,
      "reset_at": "2025-01-15T10:30:00Z",
      "retry_after": 30
    }
  }
}
```

## Documentation Checklist

- [ ] All endpoints documented with summary and description
- [ ] Request/response schemas defined
- [ ] All parameters documented with types and descriptions
- [ ] Error codes and responses documented
- [ ] Authentication flow documented
- [ ] Rate limits documented with headers
- [ ] Examples provided for all endpoints
- [ ] Breaking changes noted in version history
- [ ] Testing instructions provided
- [ ] SDK/client code examples available
