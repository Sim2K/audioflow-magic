# AIAudioFlow Application Reference Guide

This document serves as a comprehensive reference for the AIAudioFlow application architecture, components, and implementation details. It is maintained to provide quick access to important information about the application's structure and functionality.

## Version Control
- **Last Updated**: 2025-01-02
- **Version**: 1.0.0
- **Maintainer**: Cascade AI

## Purpose
- Quick reference for application architecture and implementation details
- Centralized documentation for component configurations
- Easy lookup for file locations and component relationships
- Track important implementation decisions and configurations

## Table of Contents
1. [Audio Recording](#audio-recording)
2. [Components](#components)
3. [State Management](#state-management)
4. [Utils](#utils)
5. [Future Integration Templates](#future-integration-templates)

---

## Audio Recording

### Configuration
1. Audio Settings:
   - Format: WebM container with Opus codec
   - Channels: Mono (channelCount: 1)
   - Sample Rate: 22,050 Hz
   - Bitrate: 56 kbps
   - Features: Echo cancellation, noise suppression

2. Performance Metrics:
   - Target File Size: < 25MB per hour
   - Quality: Optimized for voice recording
   - Data Collection Interval: 1000ms chunks

3. Implementation Location:
   - Primary: `/src/utils/audioRecorder.ts`
   - Interface: `AudioRecorder` class

### Recording Process Flow
1. Initialization:
   - Stream acquisition with optimized constraints
   - MediaRecorder setup with codec and bitrate settings
   - Chunk collection array initialization

2. Recording Lifecycle:
   - Start: Configure and initialize recording
   - During: Collect data in 1-second chunks
   - Stop: Combine chunks and cleanup resources

3. Error Handling:
   - Microphone access failures
   - Recording state conflicts
   - Data collection issues

---

## Components

### Component Architecture
1. **Core Components**
   - Location: `/src/components`
   - Naming Convention: PascalCase
   - Style Integration: Tailwind CSS

2. **UI Components**
   - Base Components: `/components/ui`
   - Custom Components: `/components/custom`
   - Shared Components: `/components/shared`

3. **Component Templates**
```typescript
// Template for functional components
import { FC } from 'react';

interface ComponentProps {
  // Props definition
}

export const Component: FC<ComponentProps> = ({ ...props }) => {
  return (
    // JSX
  );
};
```

---

## State Management

### Local State Patterns
1. **React Hooks**
   - useState for component-level state
   - useEffect for side effects
   - Custom hooks for reusable logic

2. **State Organization**
   ```typescript
   // Template for organizing related state
   const [isProcessing, setIsProcessing] = useState(false);
   const [hasError, setHasError] = useState(false);
   const [data, setData] = useState<DataType | null>(null);
   ```

### Global State Patterns
1. **Context Usage**
   - Create contexts for shared state
   - Provide at appropriate level
   - Consumer component patterns

---

## Utils

### Utility Functions
1. **Audio Processing**
   - Location: `/src/utils/audioRecorder.ts`
   - Purpose: Audio recording and processing
   - Interface: Class-based implementation

2. **Type Definitions**
   - Location: `/src/types`
   - Pattern: Interface-first design
   - Export conventions

3. **Helper Functions**
   - Location: `/src/utils/helpers`
   - Pure functions
   - Error handling patterns

---

## Future Integration Templates

### Authentication Template
```typescript
// Template for auth configuration
interface AuthConfig {
  providers: string[];
  callbacks: {
    signIn: (user: User) => Promise<boolean>;
    redirect: (url: string, baseUrl: string) => Promise<string>;
  };
  pages: {
    signIn: string;
    error: string;
  };
}
```

### Payment Integration Template
1. **Provider Setup**
   - Configuration pattern
   - Environment variables
   - API route structure

2. **Payment Flow Template**
   ```typescript
   interface PaymentConfig {
     currency: string;
     amount: number;
     metadata: Record<string, unknown>;
   }
   ```

3. **Webhook Handler Template**
   - Verification pattern
   - Event processing
   - Error handling

### Database Schema Templates
```sql
-- Template for core tables
CREATE TABLE users (
  id VARCHAR PRIMARY KEY,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE recordings (
  id VARCHAR PRIMARY KEY,
  user_id VARCHAR REFERENCES users(id),
  file_path VARCHAR,
  duration INTEGER,
  created_at TIMESTAMP
);
```

---

## Routing Structure

### Page Routes
- `/`: Main recording interface
- `/transcripts`: Transcript history
- `/settings`: Application settings
- `/flows`: Flow management

### API Routes Template
```typescript
// Template for API route handler
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Implementation
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
```

---

## Error Handling Patterns

### Frontend Error Template
```typescript
interface ErrorState {
  hasError: boolean;
  message: string;
  code?: string;
}

const handleError = (error: unknown) => {
  // Error handling implementation
};
```

### API Error Template
```typescript
interface APIError {
  status: number;
  code: string;
  message: string;
  details?: unknown;
}
```

---

## Testing Patterns

### Unit Test Template
```typescript
describe('Component/Function Name', () => {
  beforeEach(() => {
    // Setup
  });

  it('should behave as expected', () => {
    // Test implementation
  });
});
```

### Integration Test Template
```typescript
describe('Feature Integration', () => {
  beforeAll(() => {
    // Global setup
  });

  afterAll(() => {
    // Cleanup
  });
});
