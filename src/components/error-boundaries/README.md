# Error Handling Strategy

This directory contains error boundary components that enable robust error handling throughout the application. Each component is designed for specific error scenarios, providing specialized handling and user feedback.

## Available Error Boundaries

### 1. RetryableErrorBoundary

A general-purpose error boundary with retry functionality.

```tsx
import RetryableErrorBoundary from "@/components/RetryableErrorBoundary";

<RetryableErrorBoundary
  title="Custom Error Title"
  message="Custom error message"
  onError={(error) => console.error(error)}
>
  <YourComponent />
</RetryableErrorBoundary>
```

### 2. QueryErrorBoundary

Specialized for React Query errors with automatic query invalidation.

```tsx
import QueryErrorBoundary from "@/components/QueryErrorBoundary";
import { queryKeys } from "@/lib/hooks/useDataFetching";

<QueryErrorBoundary
  queryKey={[queryKeys.tuningFiles]}
  title="Data Fetch Error"
>
  {({ reportError }) => (
    <DataComponent reportError={reportError} />
  )}
</QueryErrorBoundary>
```

### 3. NetworkErrorBoundary

Handles network connectivity issues with helpful troubleshooting tips.

```tsx
import NetworkErrorBoundary from "@/components/NetworkErrorBoundary";

<NetworkErrorBoundary>
  <YourNetworkDependentComponent />
</NetworkErrorBoundary>
```

## Implementation Guidelines

1. **Page-Level Boundaries**: Use RetryableErrorBoundary at the page level to catch unhandled errors.

2. **Data Fetching**: Use QueryErrorBoundary around components that fetch data.

3. **Network Operations**: Wrap components making API calls with NetworkErrorBoundary.

4. **Custom Components**: Create specialized boundaries for complex features (see ECUUploadFormWithErrorBoundary).

## Best Practices

1. **Descriptive Messages**: Always provide clear error messages that help users understand the problem.

2. **Recovery Actions**: Ensure every error state includes a way for users to recover.

3. **Error Logging**: Implement error logging in production environments.

4. **Fallback UI**: Design fallback UIs that maintain the overall layout.

5. **Error Propagation**: For nested boundaries, consider which errors should propagate up the tree.

## Example: Complete Implementation

```tsx
<RetryableErrorBoundary>
  <NetworkErrorBoundary>
    <QueryErrorBoundary queryKey={['users']}>
      {({ reportError }) => (
        <UserDashboard reportError={reportError} />
      )}
    </QueryErrorBoundary>
  </NetworkErrorBoundary>
</RetryableErrorBoundary>
```

This hierarchical approach allows different boundary types to handle specific error categories while maintaining a clean fallback strategy. 