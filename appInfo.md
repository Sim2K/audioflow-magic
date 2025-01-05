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
   - Instructions field for user guidance
   - Responsive UI:
     - Mobile-optimized grid layout
     - Adaptive card sizing
     - Touch-friendly controls
     - Text wrapping for long content

3. **Flow Record Structure**
   ```typescript
   interface Flow {
     id: string;           // Unique identifier
     name: string;         // Flow name
     endpoint: string;     // API endpoint
     format: string;       // JSON response format
     prompt: string;       // GPT prompt template
     instructions: string; // User instructions for recording
   }
   ```

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

1. **Flow Dialog** (`/components/flows/FlowDialog.tsx`)
   ```typescript
   Features:
   - Import Flow functionality:
     - Import button in dialog header
     - Separate import dialog with JSON input
     - JSON validation and parsing
     - Auto-fill form fields from imported data
   - Responsive form layout:
     - Mobile: Single column, 95% screen width with padding
     - Desktop: Two columns, 800px max width
   - Field order:
     1. Name (desktop: left column)
     2. Instructions (desktop: right column, spans 2 rows)
     3. Prompt Template (full width)
     4. Format Template (full width)
     5. API Endpoint (full width, disabled)
   - Improved spacing:
     - 1.5rem (24px) gap between form fields
     - Consistent padding and margins
     - Better description text placement
   - Fixed height textareas:
     - min-height: 100px
     - resize disabled for consistent layout
   - Mobile optimizations:
     - Vertical scrolling for overflow
     - Full-width submit button
     - Proper edge spacing
     - Improved form field spacing
   ```

2. **Flow Components**
   - **FlowCard** (`/components/flows/FlowCard.tsx`)
     ```typescript
     Features:
     - Flex column layout
     - Dynamic height adjustment
     - Content overflow handling
     - Mobile-optimized buttons
     - Text wrapping for all content types
     ```

3. **Audio Processing** (`/utils/audioRecorder.ts`)
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

4. **OpenAI Integration** (`/utils/openai.ts`)
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
- Home (`/`) - Main dashboard
- Features (`/features`) - Feature overview
- Record (`/record`) - Audio recording interface
- Flows (`/flows`) - Flow management
- Transcripts (`/transcripts`) - Transcript management
- Flow Help (`https://gpts4u.com/aiaudioflows`) - External help documentation
- Settings (`/settings`) - Application settings

### UI Components{{ ... }}
