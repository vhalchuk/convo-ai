# Error Handling System

## Overview

This document describes the error handling system used in the Convo AI server application. The system is designed to provide consistent error handling, proper error attribution, and helpful error messages for both developers and end-users.

## Error Hierarchy

The application uses a hierarchical error system:

```
Error (native JavaScript)
├── EnhancedError (base class with blame tracking)
│   └── SSEError (for Server-Sent Events errors)
└── ValidationError (for input validation errors)
```

## Core Components

### EnhancedError

The base error class that extends the native JavaScript `Error` and adds:

- **blameWho**: Identifies the source of the error (client, server, service, etc.)
- **originalError**: Captures the original error for debugging
- Proper stack trace and prototype chain maintenance

```typescript
new EnhancedError({
    message: "Failed to connect to database",
    blameWho: BLAME_WHO.SERVICE,
    originalError: dbError,
});
```

### SSEError

Specialized error for handling failures in Server-Sent Events:

```typescript
new SSEError({
    message: "SSE streaming failure",
    blameWho: BLAME_WHO.SERVICE,
    originalError: streamError,
});
```

### ValidationError

Handles validation failures from user input:

```typescript
// Automatically thrown by the validate utility function
validate(schema, inputData);
```

## Error Attribution (blameWho)

Errors are attributed to a source to help with debugging and proper error handling:

- **CLIENT**: Bad input, missing parameters, etc.
- **SERVER**: Internal bugs, unhandled cases
- **PACKAGE**: Third-party packages throwing errors
- **SERVICE**: External service failures (DB, API, etc.)
- **UNKNOWN**: Origin cannot be determined

## Middleware Error Handler

The `requestErrorHandler` middleware:

1. Catches all errors from route handlers
2. Logs errors with appropriate severity
3. Returns the right HTTP status code
4. Formats the error response appropriately:
    - For SSE errors, sends an SSE-formatted error event
    - For validation errors, returns details about validation failures
    - For other errors, returns a generic error message to avoid leaking internal details

## Error Handling Best Practices

### Using tryCatch

Use the `tryCatch` utility from `@convo-ai/shared` to avoid try/catch blocks:

```typescript
// Without tryCatch
try {
    const result = await someAsyncOperation();
    // Handle success
} catch (error) {
    // Handle error
}

// With tryCatch
const result = await tryCatch(someAsyncOperation);
if (result.isErr()) {
    // Handle error with result.error
} else {
    // Handle success with result.value
}
```

### Creating New Errors

When creating new errors, always:

1. Use the appropriate error type
2. Provide a clear, descriptive message
3. Attribute the error to the correct source
4. Include the original error when available

```typescript
return err(
  new EnhancedError({
    message: "Failed to generate conversation name",
    blameWho: BLAME_WHO.SERVICE,
    originalError: originalError
  })
);
```

### Logging

Errors should be logged with the appropriate severity level:

- **ERROR**: Unexpected errors that need attention but don't crash the system
- **FATAL**: Severe errors that prevent system operation
- **WARN**: Concerning but non-critical issues
- **INFO**: Normal operational information
- **DEBUG**: Detailed information for debugging
