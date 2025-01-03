# AIAudioFlow Application Reference Guide

This document serves as a comprehensive reference for the AIAudioFlow application architecture, components, and implementation details.

## Version Control
- **Last Updated**: 2025-01-03
- **Version**: 1.0.1
- **Environment**: Vite + React + TypeScript
- **UI Framework**: Tailwind CSS + shadcn/ui

## Core Architecture

### Application Structure
```
src/
├── components/
│   ├── ui/          # Base UI components
│   ├── layout/      # Layout components
│   └── flows/       # Flow-specific components
├── hooks/           # Custom React hooks
├── lib/            # Utility libraries
├── pages/          # Route pages
└── utils/          # Utility functions
```

### Key Features

1. **Audio Recording**
   - WebM format with Opus codec
   - Optimized for long recordings (up to 60 minutes)
   - Audio Settings:
     - Mono channel (channelCount: 1)
     - 8000Hz sample rate (optimized for voice)
     - 12kbps bitrate
     - Enhanced compression for long recordings
     - Auto gain control enabled
     - Echo cancellation and noise suppression
   - File size management:
     - Target size: < 25MB for 60-minute recordings
     - Size warning at 80% of limit
     - Automatic file size validation

2. **Flow Management**
   - Custom flow creation and editing
   - JSON response format configuration
   - Dynamic prompt templates
   - API endpoint configuration
   - Responsive UI:
     - Mobile-optimized grid layout
     - Adaptive card sizing
     - Touch-friendly controls
     - Text wrapping for long content

3. **Transcript Management**
   - Local storage of transcripts
   - Detailed view with tabs
   - JSON response visualization
   - Transcript deletion capability

4. **Mobile Responsiveness**
   - Adaptive grid layout:
     - Single column on small screens
     - Two columns on medium screens
     - Three columns on large screens
   - Responsive card design:
     - Full-height flex layout
     - Proper text wrapping
     - Optimized button sizes
     - Overflow handling
   - Touch-optimized interface

### Component Details

1. **Flow Components**
   - **FlowCard** (`/components/flows/FlowCard.tsx`)
     ```typescript
     Features:
     - Flex column layout
     - Dynamic height adjustment
     - Content overflow handling
     - Mobile-optimized buttons
     - Text wrapping for all content types
     ```

2. **Audio Processing** (`/utils/audioRecorder.ts`)
   ```typescript
   Settings:
   - Sample Rate: 8000Hz
   - Bitrate: 12kbps
   - Format: audio/webm;codecs=opus
   - Chunk Interval: 250ms
   Features:
   - Optimized for voice clarity
   - Minimal file size
   - Automatic cleanup
   ```

3. **OpenAI Integration** (`/utils/openai.ts`)
   ```typescript
   Features:
   - File size validation
   - Size limit warnings
   - Error handling with size information
   - MP3 conversion optimization
   ```

### State Management
1. **Local Storage**
   ```typescript
   interface StorageStructure {
     transcripts: {
       id: string;
       text: string;
       timestamp: number;
       audioUrl?: string;
       response: {
         details: {
           title: string;
           summary: string;
           valid_points: string[];
         }
       }
     }[]
   }
   ```

### Performance Optimizations
1. **Audio Processing**
   - Optimized compression for long recordings
   - Voice-focused audio settings
   - Efficient memory usage
   - Automatic resource cleanup

2. **UI Responsiveness**
   - Lazy loading of components
   - Efficient grid layouts
   - Optimized touch targets
   - Adaptive content display

### Security Considerations
1. **API Security**
   - Request validation
   - CORS configuration
   - Rate limiting
   - API key management in .env

### Known Limitations
1. **Audio Recording**
   - Maximum file size: 25MB
   - Optimized for voice (not music)
   - Single channel audio only

### Layout Components

1. **MainLayout** (`/components/layout/MainLayout.tsx`)
   - Root layout wrapper
   - Manages sidebar state
   - Handles responsive behavior

2. **AppSidebar** (`/components/layout/AppSidebar.tsx`)
   ```typescript
   Features:
   - Gradient title header
   - Mobile-friendly navigation
   - Auto-closing mobile menu
   - White background for readability
   ```

### UI Components

1. **Buttons, Inputs, Dialogs** from shadcn/ui
2. **Custom styled components** with Tailwind
3. **Responsive design patterns**

### State Management

1. **React Context**
   - SidebarContext for navigation state
   - AudioContext for recording state
   - FlowContext for flow management

### API Integration

1. **OpenAI Integration**
   ```typescript
   interface AIResponse {
     details: {
       title: string;
       summary: string;
       valid_points: string[];
     }
   }
   ```

2. **Audio Processing**
   - WebM recording
   - MP3 conversion
   - Blob URL generation

### Mobile Optimization

1. **Responsive Design**
   ```css
   /* Breakpoint Strategy */
   sm: 640px   // Mobile landscape
   md: 768px   // Tablets
   lg: 1024px  // Desktop
   xl: 1280px  // Large screens
   ```

2. **Mobile Features**
   - Hamburger menu navigation
   - Touch-friendly controls
   - Adaptive layouts
   - Performance optimizations

### Navigation Structure

1. **Routes**
   ```typescript
   routes: [
     { path: "/", component: Index },        // Recording
     { path: "/flows", component: Flows },   // Flow management
     { path: "/transcripts", component: Transcripts },
     { path: "/settings", component: Settings }
   ]
   ```

2. **Navigation Features**
   - Client-side routing
   - Route protection
   - Navigation state management

### Styling Architecture

1. **Tailwind Configuration**
   ```javascript
   theme: {
     extend: {
       colors: {
         accent: {...},
         foreground: {...}
       }
     }
   }
   ```

2. **Component Styling**
   - Utility-first approach
   - Consistent spacing system
   - Responsive classes
   - Dark mode support

### Error Handling

1. **Error Boundaries**
   - Component-level error catching
   - Fallback UI components
   - Error reporting

2. **Form Validation**
   - Input validation
   - Error messages
   - User feedback

### Performance Optimization

1. **Code Splitting**
   - Route-based splitting
   - Component lazy loading
   - Dynamic imports

2. **Resource Management**
   - Audio buffer cleanup
   - Memory leak prevention
   - Event listener cleanup

### Security Considerations

1. **Data Storage**
   - Local storage encryption
   - Sensitive data handling
   - XSS prevention

2. **API Security**
   - Request validation
   - CORS configuration
   - Rate limiting

### Future Enhancements

1. **Planned Features**
   - Cloud storage integration
   - User authentication
   - Advanced audio processing
   - Real-time collaboration

2. **Technical Debt**
   - Component optimization
   - Test coverage
   - Documentation updates

## Development Guidelines

1. **Code Style**
   - Functional components
   - TypeScript strict mode
   - ESLint configuration
   - Prettier formatting

2. **Best Practices**
   - Component composition
   - Hook patterns
   - Performance considerations
   - Accessibility standards
