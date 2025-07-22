import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Convert feet to yards
 */
export function feetToYards(feet: number): number {
  return Math.round(feet / 3)
}

/**
 * Convert yards to feet
 */
export function yardsToFeet(yards: number): number {
  return Math.round(yards * 3)
}

/**
 * Determine if a distance should be displayed in feet based on shot type or distance
 */
export function shouldDisplayInFeet(distance: number, shotType?: string): boolean {
  // Always show putts in feet
  if (shotType === "Putt") return true
  
  // Show short distances in feet
  if (distance < 30) return true
  
  // Otherwise show in yards
  return false
}

/**
 * Format a distance with the appropriate unit
 * @param distance Distance in feet (internal storage unit)
 * @param shotType Optional shot type to help determine display unit
 * @returns Formatted distance string with appropriate unit
 */
export function formatDistance(distance: number, shotType?: string): string {
  if (shouldDisplayInFeet(distance, shotType)) {
    return `${distance} ft`
  } else {
    return `${feetToYards(distance)} yards`
  }
}

// Types needed for the skins calculation
export interface SkinResult {
  holeNumber: number;
  winningTeam: {
    id: string;
    name: string;
    score: number;
    scoreToPar: number;
  };
  skinsWon: number;
  totalTeams: number;
  carryoverHoles: number[];
}

export interface TeamSkinsSummary {
  teamId: string;
  teamName: string;
  totalSkins: number;
  skinsWon: SkinResult[];
}

/**
 * Calculate skins results from hole completions
 */
export function calculateSkins(completions: any[]): { 
  skinResults: SkinResult[]; 
  teamSkinsSummary: TeamSkinsSummary[] 
} {
  // Group completions by hole
  const holeCompletionsMap = completions.reduce(
    (acc, completion) => {
      if (!acc[completion.hole_number]) {
        acc[completion.hole_number] = [];
      }
      acc[completion.hole_number].push(completion);
      return acc;
    },
    {} as Record<number, any[]>
  );

  // Get all unique teams in the round
  const allTeams = [...new Set(completions.map((c) => c.team_id))];
  const totalTeams = allTeams.length;

  if (totalTeams === 0) {
    return { skinResults: [], teamSkinsSummary: [] };
  }

  const skinResults: SkinResult[] = [];
  let carryoverSkins = 0; // Track skins that carry over from tied holes
  const carryoverHoles: number[] = []; // Track which holes contributed to carryover

  // Get all hole numbers that have been completed and sort them
  const completedHoles = Object.keys(holeCompletionsMap)
    .map(Number)
    .filter((holeNumber) => holeCompletionsMap[holeNumber].length === totalTeams)
    .sort((a, b) => a - b);

  // Process holes in order
  for (const holeNumber of completedHoles) {
    const holeCompletions = holeCompletionsMap[holeNumber];

    // Find the best score (lowest total shots)
    const bestScore = Math.min(...holeCompletions.map((c) => c.total_shots));
    const winners = holeCompletions.filter((c) => c.total_shots === bestScore);

    if (winners.length === 1) {
      // Clear winner - they get this hole's skins plus any carryover
      const winner = winners[0];
      const baseSkinsForHole = totalTeams - 1; // Base skins for this hole
      const totalSkinsWon = baseSkinsForHole + carryoverSkins;

      skinResults.push({
        holeNumber,
        winningTeam: {
          id: winner.team_id,
          name: winner.team?.name || "Unknown Team",
          score: winner.total_shots,
          scoreToPar: winner.score_to_par,
        },
        skinsWon: totalSkinsWon,
        totalTeams,
        carryoverHoles: [...carryoverHoles], // Include holes that contributed to carryover
      });

      // Reset carryover tracking
      carryoverSkins = 0;
      carryoverHoles.length = 0;
    } else {
      // Tie - skins carry over to next hole
      carryoverSkins += totalTeams - 1;
      carryoverHoles.push(holeNumber);
    }
  }

  // Calculate team skins summary
  const teamSkinsSummary: TeamSkinsSummary[] = allTeams
    .map((teamId) => {
      const team = completions.find((c) => c.team_id === teamId)?.team;
      const teamSkins = skinResults.filter((skin) => skin.winningTeam.id === teamId);

      return {
        teamId,
        teamName: team?.name || "Unknown Team",
        totalSkins: teamSkins.reduce((sum, skin) => sum + skin.skinsWon, 0),
        skinsWon: teamSkins,
      };
    })
    .sort((a, b) => b.totalSkins - a.totalSkins);

  return { skinResults, teamSkinsSummary };
}
