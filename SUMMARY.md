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

\`\`\`
/app                 - Next.js app directory with pages
/components          - UI components
/hooks               - Custom React hooks
/lib                 - Utility functions and API clients
\`\`\`

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

## Directory Structure
❯ tree -I 'node_modules|target|public|scripts'
.
├── app
│   ├── admin
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components
│   ├── admin-dashboard.tsx
│   ├── course-manager.tsx
│   ├── data-conflict-dialog.tsx
│   ├── hole-summary.tsx
│   ├── live-feed.tsx
│   ├── refresh-recovery-screen.tsx
│   ├── settings-page.tsx
│   ├── shot-recording-input.tsx
│   ├── shot-splash-screen.tsx
│   ├── shot-tracker-footer.tsx
│   ├── shot-tracker-header.tsx
│   ├── shot-tracking-interface.tsx
│   ├── startup-screen.tsx
│   ├── summary-page.tsx
│   ├── supabase-connection-test.tsx
│   ├── supabase-test.tsx
│   ├── tee-shot-input.tsx
│   ├── theme-provider.tsx
│   └── ui
│       ├── ...
├── components.json
├── generate-splash-screens.html
├── hooks
│   ├── use-mobile.tsx
│   ├── use-shot-tracking.ts
│   └── use-toast.ts
├── lib
│   ├── supabase.ts
│   └── utils.ts
├── netlify
├── netlify.toml
├── next-env.d.ts
├── next.config.mjs
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── postcss.config.mjs
├── README.md
├── styles
│   └── globals.css
├── SUMMARY.md
├── tailwind.config.ts
└── tsconfig.json

## Recent Changes

### Standardized Distance Handling to Use Feet Internally (2025-07-21)

#### Files Modified
- `/lib/utils.ts`
- `/hooks/use-shot-tracking.ts`
- `/components/shot-recording-input.tsx`
- `/components/tee-shot-input.tsx`
- `/components/shot-splash-screen.tsx`
- `/components/hole-summary.tsx`
- `/components/summary-page.tsx`

#### Purpose
Standardized the app's distance handling to store all measurements in feet internally, while displaying distances in appropriate units (yards for longer shots, feet for shorter shots like putts) in the UI. This resolves the ambiguity where the database didn't distinguish between yards and feet.

#### Key Implementation Details
- Added utility functions in `lib/utils.ts` for unit conversion:
  - `feetToYards(feet: number)`: Converts feet to yards (dividing by 3)
  - `yardsToFeet(yards: number)`: Converts yards to feet (multiplying by 3)
  - `shouldDisplayInFeet(distance: number, shotType?: string)`: Determines if a distance should be displayed in feet
  - `formatDistance(distance: number, shotType?: string)`: Formats a distance with appropriate units

- Modified core shot tracking logic to:
  - Convert input distances to feet before storing in the database
  - Convert from feet to appropriate display units when showing distances
  - Update slider ranges and default values to handle the unit conversions

- Updated display components to use the new utility functions for consistent formatting

#### Design Decisions & Tradeoffs
- **DRY Approach**: Centralized unit conversion in `utils.ts` to avoid duplication
- **Backward Compatibility**: No database schema changes required; existing records are interpreted as being in feet
- **Smart Display Logic**: Uses shot type and distance magnitude to determine appropriate display units
- **User Experience**: Users still input distances in familiar units (yards for long shots, feet for putts)

#### New Dependencies
- No new external dependencies were introduced

#### TODO Items
- Consider adding a database migration to convert existing data if any was recorded in yards
- Add unit tests for the conversion utilities
- Consider adding explicit unit metadata to the database schema for future flexibility

### Updated Distance Slider Range for Feet Units (2025-07-21)

**Files Modified:**
- `hooks/use-shot-tracking.ts`

**Purpose:**
- Improved the user experience when selecting "feet" as the distance unit by capping the maximum range of the distance slider to 50 feet instead of the previous calculation that used `yards*3`.

**Implementation Details:**
- Modified the `getSliderRange` function in the `use-shot-tracking.ts` hook to use a fixed maximum value of 50 when the distance unit is set to "feet".
- Previously, the maximum range was calculated based on the start distance (or 60 feet if none provided) or a minimum reasonable maximum of 15 feet, whichever was larger.
- This change ensures a more appropriate and consistent range for short-distance measurements.

**Code Change:**
\`\`\`typescript
// Before:
if (distanceUnit === "feet") {
  const maxDistance = startDistance || 60
  const minReasonableMax = 15
  const actualMax = Math.max(maxDistance, minReasonableMax)
  // ...
}

// After:
if (distanceUnit === "feet") {
  const maxDistance = 50; // Changed from using startDistance to a fixed 50
  // ...
}
\`\`\`

**Design Decisions:**
- Fixed value of 50 feet was chosen as an appropriate maximum for measurements in feet, as longer distances are better represented in yards.
- Kept the existing default value calculation logic (maxDistance / 3 or maxDistance / 2 for putts) to maintain consistent user experience.
- The rest of the function remains unchanged to preserve behavior for yards and other special cases.

**Dependencies:**
- No new dependencies were introduced.

**Follow-up Work:**
- Consider adding user settings to allow customization of maximum ranges for different units.
- Monitor user feedback to ensure the 50 feet cap is appropriate for all use cases.

### Added PWA Installation Support and Settings Access (2025-07-21)

#### Files Modified/Created
- **Created**: `/hooks/use-pwa-install.ts` - New custom hook to handle PWA installation logic
- **Modified**: `/components/settings-page.tsx` - Implemented PWA installation functionality
- **Modified**: `/components/shot-tracking-interface.tsx` - Added settings page access and navigation
- **Modified**: `/components/shot-tracker-footer.tsx` - Added settings gear icon in footer

#### Purpose of Changes
- Enable users to install the Golf Shot Tracker as a Progressive Web App (PWA)
- Provide easy access to the settings page from the main tracking interface
- Improve the user experience by allowing app installation for offline access

#### Key Implementation Details
1. **PWA Installation Hook**:
   - Created a reusable hook that detects if PWA installation is available
   - Handles different behaviors for iOS vs Android/desktop browsers
   - Manages the installation prompt and tracks installation state

2. **Settings Page Integration**:
   - Connected the "Install as App" button to the PWA installation prompt
   - Added iOS-specific guidance for installation
   - Implemented state management for installation process

3. **Main App Navigation**:
   - Added a settings button to the app footer
   - Implemented navigation between tracking interface and settings
   - Ensured consistent UI across different app views

#### Design Decisions & Tradeoffs
- **Platform-specific UX**: Different approaches for iOS vs Android to account for different installation methods
- **Button state management**: Disabling the install button when installation is not available rather than hiding it
- **Minimal feedback**: Used simple alerts for installation feedback instead of more complex toast notifications to minimize dependencies

#### New Dependencies
- No new external dependencies were added; leveraged existing browser APIs

#### TODO Items
- Consider adding more sophisticated feedback mechanisms (toasts, banners)
- Add analytics to track installation attempts and success rates
- Test installation behavior across a wider range of devices and browsers
- Consider adding offline mode indicators to show when app is running as installed PWA
