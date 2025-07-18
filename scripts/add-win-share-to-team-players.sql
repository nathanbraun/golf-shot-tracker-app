-- Add win_share column to team_players table
-- This represents the share of winnings a player is entitled to on their team.
-- It defaults to 1.0, representing a full/equal share.
ALTER TABLE public.team_players
ADD COLUMN win_share REAL NOT NULL DEFAULT 1.0;

-- Add a comment to the new column for clarity
COMMENT ON COLUMN public.team_players.win_share IS 'Represents the share of winnings for this player on this team (e.g., 0.5 for half share, 1.0 for full share).';
