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

### Updated Hole Summary to Show Skins Leaderboard (2025-07-22)

#### Files Modified
- `/components/hole-summary.tsx`
- `/lib/utils.ts`

#### Purpose of Changes
Modified the hole summary component to remove unused sections and add a skins leaderboard. This change provides users with more relevant information about skins won throughout the tournament while streamlining the UI.

#### Key Implementation Details
1. **Removed sections from hole-summary.tsx:**
   - "Player Contributions" section
   - "Hole n - Other Teams" section
   - "Tournament Leaderboard" section

2. **Added new Skins Leaderboard section:**
   - Shows all teams and their total skins
   - Displays which specific holes each team won skins on
   - Indicates carryover holes with special formatting
   - Shows the highest hole number each team has completed

3. **Extracted utility function to utils.ts:**
   - Added `calculateSkins()` function to compute skin results from hole completions
   - Created reusable interfaces `SkinResult` and `TeamSkinsSummary`
   - Implemented algorithm to handle carryover skins when holes are tied

#### Design Decisions
- Maintained consistent styling with the rest of the hole-summary component
- Added a refresh button to allow users to update skins data on demand
- Highlighted the current team with special styling for better visibility
- Added "Through hole X" information to provide context about each team's progress
- Preserved detailed information about carryover holes for transparency

#### New Dependencies
- No new external dependencies were introduced
- Internal dependency on the hole completions API for data retrieval

#### TODO Items
- Consider adding animations when new skins are won
- Potentially add a more detailed view of skins history
- Optimize data fetching to reduce redundant API calls between components
- Add unit tests for the `calculateSkins()` utility function

### Added Player Sequence to Recent Activity (2025-07-22)

#### Files Modified
- `/lib/supabase.ts`
- `/hooks/use-shot-tracking.ts`
- `/components/live-feed.tsx`
- Database schema: `team_hole_completions` table

#### Purpose
Enhanced the Recent Activity card in the Live Feed to show the sequence of players who took shots on each hole (e.g., "Nate → Mikey → Pdizz → Nate") instead of only showing the longest shot information. This provides a more complete picture of how each hole was played.

#### Implementation Details
1. **Database Schema Change**:
   - Added a `player_sequence` TEXT column to the `team_hole_completions` table to store the sequence of players
   - Added appropriate TypeScript type definition in `supabase.ts`

2. **Shot Tracking Logic**:
   - Modified the `createHoleCompletion` function in `use-shot-tracking.ts` to:
     - Sort shots by shot number
     - Generate a player sequence string with arrow separators
     - Store this string in the new `player_sequence` field

3. **UI Updates**:
   - Updated the Recent Activity card in `live-feed.tsx` to display the player sequence
   - Added a fallback to the original longest shot display for backward compatibility with existing data
   - Used the `Users` icon instead of `Target` icon for the player sequence to visually distinguish it

#### Design Decisions
- **Storage vs. Computation**: Chose to store the player sequence as a pre-computed string in the database rather than calculating it on-demand. This improves performance by avoiding multiple API calls and ensures consistency across all clients.
- **Backward Compatibility**: Maintained support for displaying longest shot information when the player sequence is not available, ensuring a smooth transition for existing data.
- **Format**: Used the "→" arrow character as a separator to clearly indicate the sequence of play.

#### Dependencies
- No new dependencies were introduced.

#### TODO/Follow-up
- Consider adding a migration script to populate the `player_sequence` field for existing hole completions
- Evaluate adding player statistics based on the sequence data (e.g., which player most frequently completes holes)
- Consider adding visual styling to highlight different players in the sequence

### Improved Hole Navigation with Previous Hole Summaries (2025-07-22)

#### Files Modified
- `/hooks/use-shot-tracking.ts`
- `/components/hole-summary.tsx`
- `/components/shot-tracking-interface.tsx`

#### Purpose of the Changes
Enhanced the "Previous Hole" navigation feature to display the hole summary view when visiting previously completed holes, rather than showing the default shot tracking interface. This provides users with a more contextually appropriate view when reviewing completed holes.

#### Key Implementation Details
1. Added a new state variable `isReviewingPreviousHole` to track when a user is reviewing a previously completed hole
2. Modified the `handlePreviousHole()` function to check if the previous hole has shots recorded:
   - If shots exist, it shows the hole summary view
   - If no shots exist, it shows the regular shot tracking interface
3. Enhanced `HoleSummary` component with navigation controls:
   - Added "Previous Hole" and "Next Hole" buttons to navigate between completed holes
   - Added "Return to Current" button to return to the active hole
4. Positioned navigation buttons under the "Round Status" section for better visibility
5. Added a `handleNavigateToHole()` function to facilitate navigation between completed holes
6. Added a `handleReturnToCurrentHole()` function to return to the current active hole

#### Design Decisions
- Placed navigation controls at the top of the summary view for better discoverability
- Used smaller buttons with consistent styling to maintain UI cohesion
- Disabled navigation buttons when they would lead to holes with no recorded shots
- Maintained the original "Tee Off Next Hole" button at the bottom when not in review mode
- Used consistent visual language with the rest of the application

#### New Dependencies
- No new dependencies were introduced

#### TODO Items
- Consider adding a visual indicator in the hole list to show which holes have been completed
- Evaluate adding a quick-jump selector to navigate directly to any completed hole
- Consider caching hole summary data to improve performance when navigating between holes
