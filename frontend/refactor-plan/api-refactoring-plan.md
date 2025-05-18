# API Service Refactoring Plan

## Current Issues

Based on analysis of the codebase, we've identified the following issues:

1. **Duplicate API Services**: Multiple service files with overlapping functionality:
   - `apiService.ts` and `apiService.tsx` (duplicate files)
   - `stockApiService.js` (JavaScript version)
   - `indianApiService.ts` (separate service for Indian API)
   - `api.ts` and `api.js` (additional API files)
   - Modular API files in `services/api/` directory

2. **Inconsistent Import Patterns**:
   - Some components use named imports: `import { getStockDetails } from '@/services/stockService'`
   - Others use default imports: `import indianApiService from '../../services/indianApiService'`
   - Different import paths for the same functionality

3. **Mixed TypeScript and JavaScript**:
   - Some services are in TypeScript (`apiService.ts`)
   - Others are in JavaScript (`stockApiService.js`)

4. **Inconsistent API Response Handling**:
   - Different error handling approaches
   - Inconsistent data normalization

5. **Duplicated Logic**:
   - API key rotation logic duplicated
   - Caching mechanisms implemented multiple ways
   - Endpoint pattern discovery duplicated

## Refactoring Goals

1. **Unified API Architecture**:
   - Single entry point for all API services
   - Consistent patterns for imports and usage
   - Type safety throughout

2. **Clear Separation of Concerns**:
   - Core API client for HTTP requests
   - Domain-specific services (stocks, news, IPO, etc.)
   - Configuration management
   - Type definitions

3. **Improved Maintainability**:
   - Centralized error handling
   - Consistent caching strategy
   - Better documentation

4. **Backward Compatibility**:
   - Ensure existing components continue to work
   - Provide migration path for components

## Implementation Plan

### 1. Create New API Structure

```
services/
  api/
    client.ts           # Core API client (HTTP requests, caching, error handling)
    config.ts           # API configuration (endpoints, keys, timeouts)
    index.ts            # Main entry point, exports all services
    types.ts            # Shared type definitions
    services/
      stocks.ts         # Stock-related API functions
      news.ts           # News-related API functions
      ipo.ts            # IPO-related API functions
      market.ts         # Market data API functions
      portfolio.ts      # Portfolio management API functions
    utils/
      cache.ts          # Caching utilities
      error-handler.ts  # Error handling utilities
      key-rotation.ts   # API key rotation logic
```

### 2. Implementation Steps

1. **Core API Client**:
   - Enhance the existing `client.ts` with improved error handling and caching
   - Add support for different API providers (standard API, Indian API)
   - Implement API key rotation strategy

2. **Configuration Management**:
   - Move all API configuration to `config.ts`
   - Support environment variables and runtime configuration
   - Implement API key pool management

3. **Service Modules**:
   - Implement domain-specific service modules
   - Ensure consistent function signatures and return types
   - Add proper error handling and data normalization

4. **Type Definitions**:
   - Consolidate all types in `types.ts`
   - Ensure comprehensive type coverage
   - Add JSDoc comments for better IDE support

5. **Main Entry Point**:
   - Create a unified entry point in `index.ts`
   - Export all services and utilities
   - Provide factory functions for API clients

### 3. Migration Strategy

1. **Phase 1: Build New API Layer**
   - Implement the new API structure without modifying existing code
   - Ensure all functionality is covered
   - Add comprehensive tests

2. **Phase 2: Create Compatibility Layer**
   - Implement adapter functions that map old API calls to new ones
   - Ensure backward compatibility with existing components

3. **Phase 3: Migrate Components**
   - Update import statements in components to use new API
   - Update function calls if necessary
   - Test thoroughly after each component migration

4. **Phase 4: Remove Legacy Code**
   - Once all components are migrated, remove old API service files
   - Update documentation

## Implementation Details

### API Client Implementation

The core API client will:
- Handle HTTP requests with axios
- Implement caching with TTL
- Handle errors consistently
- Support different API providers
- Manage API keys and rotation

### Service Modules

Each service module will:
- Export functions for specific domain operations
- Handle data normalization
- Implement retry logic for failed requests
- Support fallback between different API providers

### Type Safety

- All API functions will have proper TypeScript types
- Response types will be comprehensive
- Error types will be defined

## Testing Strategy

1. **Unit Tests**:
   - Test each API function in isolation
   - Mock HTTP responses
   - Test error handling

2. **Integration Tests**:
   - Test API client with mock server
   - Test service modules with mock client

3. **Component Tests**:
   - Test components with the new API services
   - Ensure backward compatibility

## Timeline

1. **Week 1**: Core API client and configuration
2. **Week 2**: Service modules implementation
3. **Week 3**: Compatibility layer and initial component migration
4. **Week 4**: Complete component migration and testing
5. **Week 5**: Documentation and cleanup

## Risks and Mitigations

1. **Risk**: Breaking changes affecting components
   **Mitigation**: Comprehensive testing and compatibility layer

2. **Risk**: Performance regression
   **Mitigation**: Performance testing before and after

3. **Risk**: Increased complexity
   **Mitigation**: Clear documentation and code organization

4. **Risk**: API changes during refactoring
   **Mitigation**: Feature freeze during refactoring period 