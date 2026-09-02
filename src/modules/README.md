# Modules Architecture

This directory contains all feature modules organized by domain, with core utilities shared across the application.

## Structure

```
modules/
├── core/              # Shared utilities, security, API client, error handling
│   ├── security/      # Input validation, sanitization, rate limiting
│   ├── api/           # Base API client
│   └── error/         # Error boundaries
├── chat/              # Messaging feature (conversations, messages)
│   ├── components/    # React components
│   ├── hooks/         # Custom hooks (useConversations, useMessages)
│   ├── api/           # Chat-specific API client
│   ├── types/         # TypeScript interfaces & type guards
│   └── utils/         # Utility functions
├── shared/            # Reusable UI components & hooks
│   ├── components/    # Generic UI components
│   ├── hooks/         # Generic hooks (useRateLimit)
│   └── ui/            # Styled UI components (Toast)
```

## Module Dependencies

```
pages/
  └─ imports from ──→ modules/chat
                       ├─ imports from ──→ modules/shared
                       └─ imports from ──→ modules/core

modules/chat
  └─ imports from ──→ modules/core

modules/shared
  └─ imports from ──→ modules/core

modules/core
  └─ no external module imports (foundation layer)
```

## Importing from Modules

**Pages and components should import from module root indexes:**

```typescript
// ✓ Good
import { useConversations, useMessages } from '@/modules/chat'
import { Toast, useRateLimit } from '@/modules/shared'
import { validateMessage, sanitizeInput } from '@/modules/core'

// ✗ Avoid
import { useConversations } from '@/modules/chat/hooks/useConversations'
import Toast from '@/modules/shared/ui/Toast'
```

## Module Responsibilities

### Core
- **security**: Input validation, output sanitization, XSS prevention, rate limiting
- **api**: HTTP client, error handling, request/response normalization
- **error**: Error boundaries for React component error isolation

### Chat
- **types**: Conversation and Message interfaces, type guards
- **api**: Chat-specific API endpoints (conversations, messages)
- **hooks**: Data fetching hooks with loading/error states
- **components**: Conversation list, message list, input, etc.
- **utils**: Date formatting, message grouping, etc.

### Shared
- **ui**: Reusable styled components (Toast, Skeleton, etc.)
- **hooks**: Generic React hooks (useRateLimit, useLocalStorage, etc.)
- **components**: Generic React components (ErrorMessage, etc.)

## Adding New Modules

When adding a feature:

1. Create `modules/[feature]/` folder
2. Add subdirectories: `types/`, `api/`, `hooks/`, `components/`, `utils/`
3. Create `index.ts` barrel export
4. Pages import from the root index only

Example:
```
modules/auth/
├── types/index.ts        # User, LoginRequest, etc.
├── api/auth-client.ts    # Login, logout, refresh endpoints
├── hooks/index.ts        # useAuth, useAuthToken, etc.
├── components/           # LoginForm, etc.
└── index.ts             # Export public API
```

## File Organization Within Modules

- **index.ts**: Barrel export (what's public to other modules)
- **types/**: TypeScript interfaces, type guards, API response types
- **api/**: API client methods for this feature
- **hooks/**: Custom React hooks
- **components/**: React components (organized by responsibility)
- **utils/**: Pure functions, helpers, formatters
- **__tests__/**: Test files (co-located with implementation)

## Type Safety

All API responses are validated using TypeScript type guards:

```typescript
import { isMessage, isConversation } from '@/modules/chat'

const response = await fetch(...)
const data = await response.json()

if (!isMessage(data)) {
  throw new Error('Invalid message format')
}
```

This protects against API schema changes and unexpected data shapes.

## Security Considerations

- **Input validation**: All user input validated before sending to API
- **Output sanitization**: All user-generated content sanitized before rendering
- **Rate limiting**: Client-side rate limiting on message sends (enforced server-side too)
- **Error boundaries**: Component failures isolated and don't crash entire app
- **Type safety**: Runtime type guards prevent type coercion bugs

See `modules/core/security/` for implementation details.
