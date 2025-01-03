# AIAudioFlow Application Reference Guide

This document serves as a comprehensive reference for the AIAudioFlow application architecture, components, and implementation details.

## Version Control
- **Last Updated**: 2025-01-03
- **Version**: 1.0.0
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
   - Real-time audio visualization
   - Download capability in MP3 format
   - Configurable recording settings

2. **Flow Management**
   - Custom flow creation and editing
   - JSON response format configuration
   - Dynamic prompt templates
   - API endpoint configuration

3. **Transcript Management**
   - Local storage of transcripts
   - Detailed view with tabs
   - JSON response visualization
   - Transcript deletion capability

4. **Mobile Responsiveness**
   - Adaptive sidebar navigation
   - Touch-friendly interface
   - Responsive layout adjustments
   - Mobile-optimized controls

### Component Details

1. **Layout Components**
   - **MainLayout** (`/components/layout/MainLayout.tsx`)
     - Root layout wrapper
     - Manages sidebar state
     - Handles responsive behavior

   - **AppSidebar** (`/components/layout/AppSidebar.tsx`)
     ```typescript
     Features:
     - Gradient title header
     - Mobile-friendly navigation
     - Auto-closing mobile menu
     - White background for readability
     ```

2. **Flow Components**
   - **FlowDialog** (`/components/flows/FlowDialog.tsx`)
     ```typescript
     Interface:
     {
       name: string;
       endpoint: string;
       format: string;  // JSON template
       prompt: string;  // AI prompt template
     }
     ```

3. **UI Components**
   - Buttons, Inputs, Dialogs from shadcn/ui
   - Custom styled components with Tailwind
   - Responsive design patterns

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
     }[];
     flows: {
       id: string;
       name: string;
       endpoint: string;
       format: string;
       prompt: string;
     }[];
   }
   ```

2. **React Context**
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
