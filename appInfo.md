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
   - Download features:
     - Displays file size in MB
     - Shows recording duration in minutes and seconds
     - Format: Download Recording (1.3MB / 1m 34s)

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

### Component Updates

#### JsonViewer Component
- **Location**: `src/components/JsonViewer.tsx`
- **Purpose**: Renders JSON data with interactive features for better data exploration
- **Dependencies**:
  - Uses `lucide-react` for icons (Copy, Check, ChevronDown, ChevronUp)
  - Integrates with existing Tailwind CSS theme
- **Features**:
  1. Expand/Collapse Controls
     - Starts fully expanded by default
     - Global expand/collapse all buttons
     - Individual toggle buttons for each object/array
     - ChevronUp/Down icons for better visual feedback
     - Collapse shows root level structure
  2. Copy Functionality
     - Copy button appears on hover
     - Copies individual values or entire objects
     - Visual feedback with checkmark icon
     - Supports copying full JSON paths
  
  3. Search and Highlight
     - Case-insensitive search
     - Highlights matching text
     - Auto-expands paths to matches
     - Supports searching in keys and values
  
  4. Lazy Loading
     - Loads large datasets in chunks
     - Configurable items per page (default: 50)
     - "Load more" button with remaining count
     - Separate counters for arrays and objects

- **Props**:
  - `data`: Any JSON-serializable data
  - `level`: Nesting level (default: 0)
  - `initialExpandLevel`: Initial expansion depth (default: 1)
  - `searchTerm`: Text to search and highlight
  - `itemsPerPage`: Number of items to show per page (default: 50)

- **Integration**:
  - Used in Transcripts page for API response visualization
  - Maintains existing special styling for 'title' and 'summary' fields
  - Preserves dark mode compatibility

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

### Deployment Configuration

### Netlify Configuration
- **_redirects**: Added to handle SPA routing
  - Location: `/public/_redirects`
  - Configuration: All routes redirect to index.html with 200 status
  - Purpose: Ensures proper routing for direct URL access and page refreshes

### UI Components{{ ... }}

### Authentication Features (Added 2025-01-16)
1. **User Authentication**
   - Sign In with email/password
   - Registration with email/password
   - Password reset functionality
   - Protected routes for authenticated users
   - Persistent sessions with Supabase

2. **User Profile**
   - Stored in userprofile table
   - Created on registration
   - Fields:
     ```typescript
     - user_id (UUID, primary key)
     - first_name (text)
     - last_name (text)
     - user_email (text)
     - is_active (boolean)
     - last_logged_in (timestamp)
     ```

3. **Password Requirements**
   - Minimum 8 characters
   - Must contain letters and numbers
   - Validated on both client and server side

4. **Navigation**
   - Top-right menu dropdown
   - Contextual menu items based on auth state
   - Protected route wrapper for authenticated routes

5. **UI/UX**
   - Consistent with existing design
   - Responsive layout
   - Form validation feedback
   - Loading states
   - Error handling
   - Success messages

# Database Structure - Do not edit or change anything in this section below

## userprofile

```sql
create table
  public.userprofile (
    user_id uuid not null,
    first_name text null,
    last_name text null,
    coaching_style_preference text null,
    feedback_frequency text null,
    privacy_settings jsonb null,
    is_active boolean null default true,
    last_logged_in timestamp with time zone null,
    nick_name text null,
    user_email text null,
    induction_complete boolean null default false,
    country text null,
    city text null,
    age numeric null,
    gender text null,
    last_donation timestamp with time zone null,
    admin boolean null default false,
    subscription_end_date date null default (now() + '30 days'::interval),
    date_joined timestamp with time zone null default now(),
    timezone text null default 'UTC'::text,
    language text null default 'en-gb'::text,
    constraint userprofile_pkey primary key (user_id),
    constraint userprofile_user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade
  ) tablespace pg_default;
```

## Transcript table

```sql
-- Create Transcripts table
CREATE TABLE transcripts (
    -- Core fields
    id bigint primary key generated always as identity,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    flow_id UUID NOT NULL,
    transcript TEXT NOT NULL,
    response JSONB CHECK (jsonb_typeof(response) = 'object'),
    audio_url TEXT,
    api_forward_result JSONB CHECK (jsonb_typeof(api_forward_result) = 'object'),
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- Constraints
    CONSTRAINT transcript_not_empty CHECK (char_length(transcript) > 0)
);

-- Create indexes
CREATE INDEX idx_transcripts_user_id ON transcripts(user_id);
CREATE INDEX idx_transcripts_flow_id ON transcripts(flow_id);
CREATE INDEX idx_transcripts_timestamp ON transcripts(timestamp);

-- Add RLS policies
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own transcripts
CREATE POLICY "Users can view own transcripts" ON transcripts
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own transcripts
CREATE POLICY "Users can insert own transcripts" ON transcripts
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own transcripts
CREATE POLICY "Users can update own transcripts" ON transcripts
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own transcripts
CREATE POLICY "Users can delete own transcripts" ON transcripts
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_transcripts_updated_at
    BEFORE UPDATE ON transcripts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comment
COMMENT ON TABLE transcripts IS 'Stores user transcripts with their associated flows and responses';