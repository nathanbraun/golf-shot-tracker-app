# SUMMARY.md

## Project Overview

The Golf Shot Tracker App is a React-based web application designed to track and analyze golf shots during scramble tournaments. It allows players to record shot details, view statistics, track team performance, and analyze round data. The app supports multiple players, teams, rounds, and courses, with both online (Supabase) and offline capabilities.

## Architecture and Technology Stack

- **Framework**: Next.js (React)
- **UI Components**: Custom components with Shadcn UI design system
- **Database**: Supabase (PostgreSQL)
- **State Management**: React hooks and context
- **Styling**: Tailwind CSS
- **Authentication**: None implemented (currently public access)

## File Structure

```
/app                 - Next.js app directory with pages
/components          - UI components
/hooks               - Custom React hooks
/lib                 - Utility functions and API clients
```

## Key Components

### Pages

- `/app/page.tsx` - Main application entry point
- `/app/admin/page.tsx` - Admin dashboard for managing courses, players, rounds, and teams
- `/app/layout.tsx` - Root layout component

### UI Components

- `shot-tracking-interface.tsx` - Main interface for tracking shots
- `startup-screen.tsx` - Initial screen for selecting round, team, and player
- `admin-dashboard.tsx` - Administrative interface for data management
- `summary-page.tsx` - Statistics and analysis of round data
- `live-feed.tsx` - Real-time updates of other teams' performances
- `data-conflict-dialog.tsx` - Dialog for resolving conflicts with existing data
- `course-manager.tsx` - Interface for managing golf courses

### Hooks

- `use-shot-tracking.ts` - Core hook that manages shot tracking state and logic
- `use-mobile.ts` - Detects mobile devices for responsive design
- `use-toast.ts` - Toast notification system

### API and Data Layer

- `lib/supabase.ts` - Supabase client and API functions for data operations

## Core Functionality

### Shot Tracking Process

1. User selects a round, team, and player on the startup screen
2. The app loads course data and any existing shots
3. For each hole, users can:
   - Record shot distances and types
   - Mark special shots (e.g., "nut shots", "clutch shots")
   - Track player performance
   - Complete holes and view summaries

### Data Management

The app uses Supabase as its backend with the following tables:
- `courses` - Golf course information
- `course_holes` - Individual hole data for each course
- `players` - Player profiles
- `rounds` - Tournament/round information
- `teams` - Teams participating in rounds
- `team_players` - Many-to-many relationship between teams and players
- `shots` - Individual shot records
- `team_hole_completions` - Summary of team performance on each hole

### Admin Features

- Create/edit/delete courses, players, rounds, and teams
- Configure hole details (par, distance)
- Manage team compositions and player assignments

## Key Design Patterns

1. **Custom Hook Pattern**: The `useShotTracking` hook encapsulates all shot tracking logic
2. **Component Composition**: UI is built from smaller, reusable components
3. **Conditional Rendering**: Different views based on application state
4. **Data Synchronization**: Online/offline capability with data syncing
5. **Progressive Disclosure**: Complex features are shown only when needed

## Notable Features

- **Live Scoreboard**: Real-time tracking of team performance
- **Statistics and Analysis**: Detailed breakdowns of player and shot performance
- **Offline Support**: Local storage for shots when offline
- **Data Conflict Resolution**: Handles cases where data exists on server and local device
- **Skins Game Tracking**: Supports golf skins game format
- **Multi-player Support**: Tracks contributions from all team members

## Integration Points

- **Supabase API**: Primary backend integration for data storage and retrieval
- **Local Storage**: Fallback for offline operation

## Configuration

- `next.config.mjs` - Next.js configuration
- Supabase connection details in `lib/supabase.ts`

## Workflows

### Shot Recording Workflow

1. Select player, shot type, and distance
2. Record shot details (made/missed, distance)
3. Optionally tag special shots
4. Continue to next shot or hole

### Round Setup Workflow

1. Select or create round
2. Select or create team
3. Select player
4. Begin tracking shots

### Data Synchronization Workflow

1. App attempts to save shots to Supabase in real-time
2. If offline, shots are stored locally
3. When connection is restored, pending shots are synced

## Conclusion

The Golf Shot Tracker App is a comprehensive tool for tracking and analyzing golf scramble tournaments. It provides detailed shot tracking, team management, and statistical analysis features with both online and offline capabilities. The codebase is organized around React components and hooks, with Supabase providing the backend data storage and API.

