import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://vsbiqhasauithlqlotec.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzYmlxaGFzYXVpdGhscWxvdGVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NjE3NjQsImV4cCI6MjA2ODMzNzc2NH0.VdDFy6-EgO2_SmFwOCEDb3kwO7g9eI9RWjhT_k7GfUM"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database tables
export interface Course {
  id: string
  name: string
  location?: string
  created_at: string
  updated_at: string
}

export interface CourseHole {
  id: string
  course_id: string
  hole_number: number
  tee_name: string
  par: number
  distance: number
  created_at: string
  updated_at: string
}

export interface Player {
  id: string
  name: string
  email?: string
  rating?: number
  handicap?: number
  city?: string
  created_at: string
  updated_at: string
}

export interface Round {
  id: string
  course_id: string
  name: string
  description?: string
  round_date: string
  start_time?: string
  status: "upcoming" | "in_progress" | "completed" | "cancelled"
  money_per_skin?: number // NEW: Money bet per skin
  created_at: string
  updated_at: string
  course?: Course // Optional joined course data
}

export interface Team {
  id: string
  round_id: string
  name: string
  created_at: string
  updated_at: string
  round?: Round // Optional joined round data
  players?: (Player & { win_share: number })[] // Optional joined player data with win_share
}

export interface TeamPlayer {
  id: string
  team_id: string
  player_id: string
  win_share: number // NEW: Share of winnings
  created_at: string
  team?: Team // Optional joined team data
  player?: Player // Optional joined player data
}

// Helper functions to interact with courses
export const coursesApi = {
  // Get all courses
  async getCourses(): Promise<Course[]> {
    const { data, error } = await supabase.from("courses").select("*").order("name")

    if (error) throw error
    return data || []
  },

  // Get course with holes
  async getCourseWithHoles(courseId: string, teeName = "Blue") {
    const { data: course, error: courseError } = await supabase.from("courses").select("*").eq("id", courseId).single()

    if (courseError) throw courseError

    const { data: holes, error: holesError } = await supabase
      .from("course_holes")
      .select("*")
      .eq("course_id", courseId)
      .eq("tee_name", teeName)
      .order("hole_number")

    if (holesError) throw holesError

    return {
      course,
      holes: holes || [],
    }
  },

  // Create a new course
  async createCourse(name: string, location?: string): Promise<Course> {
    const { data, error } = await supabase.from("courses").insert({ name, location }).select().single()

    if (error) throw error
    return data
  },

  // Update a course
  async updateCourse(id: string, name: string, location?: string): Promise<Course> {
    const { data, error } = await supabase
      .from("courses")
      .update({ name, location, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Delete a course
  async deleteCourse(id: string): Promise<void> {
    const { error } = await supabase.from("courses").delete().eq("id", id)

    if (error) throw error
  },

  // Test connection
  async testConnection() {
    try {
      const { data, error } = await supabase.from("courses").select("count").limit(1)

      if (error) throw error
      return { success: true, message: "Connected to Supabase successfully!" }
    } catch (error) {
      return { success: false, message: `Connection failed: ${error}` }
    }
  },
}

// Helper functions to interact with players
export const playersApi = {
  // Get all players
  async getPlayers(): Promise<Player[]> {
    const { data, error } = await supabase.from("players").select("*").order("name")

    if (error) throw error
    return data || []
  },

  // Get player by ID
  async getPlayer(id: string): Promise<Player> {
    const { data, error } = await supabase.from("players").select("*").eq("id", id).single()

    if (error) throw error
    return data
  },

  // Create a new player
  async createPlayer(player: Omit<Player, "id" | "created_at" | "updated_at">): Promise<Player> {
    const { data, error } = await supabase.from("players").insert(player).select().single()

    if (error) throw error
    return data
  },

  // Update a player
  async updatePlayer(id: string, player: Partial<Omit<Player, "id" | "created_at" | "updated_at">>): Promise<Player> {
    const { data, error } = await supabase
      .from("players")
      .update({ ...player, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Delete a player
  async deletePlayer(id: string): Promise<void> {
    const { error } = await supabase.from("players").delete().eq("id", id)

    if (error) throw error
  },
}

// Helper functions to interact with rounds
export const roundsApi = {
  // Get all rounds with course information
  async getRounds(): Promise<Round[]> {
    const { data, error } = await supabase
      .from("rounds")
      .select(`
      *,
      course:courses(*)
    `)
      .order("round_date", { ascending: false })

    if (error) throw error
    return data || []
  },

  // Get round by ID with course and teams
  async getRound(id: string): Promise<Round & { teams: Team[] }> {
    const { data: round, error: roundError } = await supabase
      .from("rounds")
      .select(`
      *,
      course:courses(*),
      teams(
        *,
        team_players(
          *,
          player:players(*)
        )
      )
    `)
      .eq("id", id)
      .single()

    if (roundError) throw roundError

    // Transform the data to include players in teams
    const transformedRound = {
      ...round,
      teams: round.teams.map((team: any) => ({
        ...team,
        players: team.team_players.map((tp: any) => ({ ...tp.player, win_share: tp.win_share })),
      })),
    }

    return transformedRound
  },

  // Get round with full course hole data
  async getRoundWithCourseHoles(id: string): Promise<Round & { courseHoles: CourseHole[] }> {
    const { data: round, error: roundError } = await supabase
      .from("rounds")
      .select(
        `
      *,
      course:courses(*)
    `,
      )
      .eq("id", id)
      .single()

    if (roundError) throw roundError

    // Get the course holes
    const { data: holes, error: holesError } = await supabase
      .from("course_holes")
      .select("*")
      .eq("course_id", round.course_id)
      // .eq("tee_name", teeName) // Temporarily removed to fetch all tees and debug
      .order("hole_number")

    if (holesError) throw holesError

    return {
      ...round,
      courseHoles: holes || [],
    }
  },

  // Create a new round
  async createRound(round: Omit<Round, "id" | "created_at" | "updated_at">): Promise<Round> {
    const { data, error } = await supabase.from("rounds").insert(round).select().single()

    if (error) throw error
    return data
  },

  // Update a round
  async updateRound(id: string, round: Partial<Omit<Round, "id" | "created_at" | "updated_at">>): Promise<Round> {
    const { data, error } = await supabase
      .from("rounds")
      .update({ ...round, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Delete a round
  async deleteRound(id: string): Promise<void> {
    const { error } = await supabase.from("rounds").delete().eq("id", id)

    if (error) throw error
  },
}

// Helper functions to interact with teams
export const teamsApi = {
  // Get all teams for a round
  async getTeamsByRound(roundId: string): Promise<Team[]> {
    const { data, error } = await supabase
      .from("teams")
      .select(`
      *,
      team_players(
        *,
        player:players(*)
      )
    `)
      .eq("round_id", roundId)
      .order("name")

    if (error) throw error

    // Transform the data to include players in teams
    return (data || []).map((team: any) => ({
      ...team,
      players: team.team_players.map((tp: any) => ({ ...tp.player, win_share: tp.win_share })),
    }))
  },

  // Create a new team
  async createTeam(team: Omit<Team, "id" | "created_at" | "updated_at">): Promise<Team> {
    const { data, error } = await supabase.from("teams").insert(team).select().single()

    if (error) throw error
    return data
  },

  // Update a team
  async updateTeam(id: string, team: Partial<Omit<Team, "id" | "created_at" | "updated_at">>): Promise<Team> {
    const { data, error } = await supabase
      .from("teams")
      .update({ ...team, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Delete a team
  async deleteTeam(id: string): Promise<void> {
    const { error } = await supabase.from("teams").delete().eq("id", id)

    if (error) throw error
  },

  // Add player to team
  async addPlayerToTeam(teamId: string, playerId: string, win_share: number): Promise<TeamPlayer> {
    const { data, error } = await supabase
      .from("team_players")
      .insert({ team_id: teamId, player_id: playerId, win_share })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Remove player from team
  async removePlayerFromTeam(teamId: string, playerId: string): Promise<void> {
    const { error } = await supabase.from("team_players").delete().eq("team_id", teamId).eq("player_id", playerId)

    if (error) throw error
  },

  // Get all team players for a team
  async getTeamPlayers(teamId: string): Promise<TeamPlayer[]> {
    const { data, error } = await supabase
      .from("team_players")
      .select(`
      *,
      win_share,
      player:players(*)
    `)
      .eq("team_id", teamId)

    if (error) throw error
    return data || []
  },
}

// Shot tracking types
export interface Shot {
  id: string
  round_id: string
  team_id: string
  player_id: string
  hole_number: number
  shot_number: number
  shot_type: "Drive" | "Approach" | "Chip" | "Putt" | "Sand" | "Recovery"
  start_distance: number
  end_distance: number
  calculated_distance: number
  made: boolean
  is_nut: boolean
  is_clutch: boolean
  is_gimme: boolean // NEW: Flag to indicate if this is a gimme shot
  created_at: string
  synced_at: string
  updated_at: string
  // Optional joined data
  player?: Player
  team?: Team
  round?: Round
}

export interface TeamHoleCompletion {
  id: string
  round_id: string
  team_id: string
  hole_number: number
  par: number
  total_shots: number
  score_to_par: number
  completed_at: string
  longest_shot_distance?: number
  longest_shot_player_id?: string
  longest_shot_type?: string
  player_sequence?: string  // Add this line
  created_at: string
  updated_at: string
  // Optional joined data
  team?: Team
  round?: Round
  longest_shot_player?: Player
}

// Helper functions to interact with shots
export const shotsApi = {
  // Get all shots for a round
  async getShotsByRound(roundId: string): Promise<Shot[]> {
    const { data, error } = await supabase
      .from("shots")
      .select(`
      *,
      player:players(*),
      team:teams(*),
      round:rounds(*)
    `)
      .eq("round_id", roundId)
      .order("hole_number", { ascending: true })
      .order("shot_number", { ascending: true })

    if (error) throw error
    return data || []
  },

  // Get shots for a specific team and round
  async getShotsByTeamAndRound(teamId: string, roundId: string): Promise<Shot[]> {
    const { data, error } = await supabase
      .from("shots")
      .select(`
      *,
      player:players(*),
      team:teams(*),
      round:rounds(*)
    `)
      .eq("team_id", teamId)
      .eq("round_id", roundId)
      .order("hole_number", { ascending: true })
      .order("shot_number", { ascending: true })

    if (error) throw error
    return data || []
  },

  // Get shots for a specific hole
  async getShotsByHole(roundId: string, teamId: string, holeNumber: number): Promise<Shot[]> {
    const { data, error } = await supabase
      .from("shots")
      .select(`
      *,
      player:players(*),
      team:teams(*),
      round:rounds(*)
    `)
      .eq("round_id", roundId)
      .eq("team_id", teamId)
      .eq("hole_number", holeNumber)
      .order("shot_number", { ascending: true })

    if (error) throw error
    return data || []
  },

  // Create a new shot
  async createShot(shot: Omit<Shot, "id" | "created_at" | "synced_at" | "updated_at">): Promise<Shot> {
    const { data, error } = await supabase
      .from("shots")
      .insert(shot)
      .select(`
      *,
      player:players(*),
      team:teams(*),
      round:rounds(*)
    `)
      .single()

    if (error) throw error
    return data
  },

  // Update a shot
  async updateShot(
    id: string,
    shot: Partial<Omit<Shot, "id" | "created_at" | "synced_at" | "updated_at">>,
  ): Promise<Shot> {
    const { data, error } = await supabase
      .from("shots")
      .update({
        ...shot,
        synced_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select(`
      *,
      player:players(*),
      team:teams(*),
      round:rounds(*)
    `)
      .single()

    if (error) throw error
    return data
  },

  // Delete a shot
  async deleteShot(id: string): Promise<void> {
    const { error } = await supabase.from("shots").delete().eq("id", id)

    if (error) throw error
  },

  // Batch create multiple shots (for offline sync)
  async createShots(shots: Omit<Shot, "id" | "created_at" | "synced_at" | "updated_at">[]): Promise<Shot[]> {
    const { data, error } = await supabase
      .from("shots")
      .insert(shots)
      .select(`
      *,
      player:players(*),
      team:teams(*),
      round:rounds(*)
    `)

    if (error) throw error
    return data || []
  },
}

// Helper functions to interact with team hole completions
export const holeCompletionsApi = {
  // Get all hole completions for a round (for the feed)
  async getCompletionsByRound(roundId: string): Promise<TeamHoleCompletion[]> {
    const { data, error } = await supabase
      .from("team_hole_completions")
      .select(`
      *,
      team:teams(*),
      round:rounds(*),
      longest_shot_player:players!longest_shot_player_id(*)
    `)
      .eq("round_id", roundId)
      .order("completed_at", { ascending: false })

    if (error) throw error
    return data || []
  },

  // Get completions for a specific team
  async getCompletionsByTeam(teamId: string, roundId: string): Promise<TeamHoleCompletion[]> {
    const { data, error } = await supabase
      .from("team_hole_completions")
      .select(`
      *,
      team:teams(*),
      round:rounds(*),
      longest_shot_player:players!longest_shot_player_id(*)
    `)
      .eq("team_id", teamId)
      .eq("round_id", roundId)
      .order("hole_number", { ascending: true })

    if (error) throw error
    return data || []
  },

  // Create or update a hole completion
  async upsertCompletion(
    completion: Omit<TeamHoleCompletion, "id" | "created_at" | "updated_at">,
  ): Promise<TeamHoleCompletion> {
    const { data, error } = await supabase
      .from("team_hole_completions")
      .upsert(
        {
          ...completion,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "round_id,team_id,hole_number",
          ignoreDuplicates: false,
        },
      )
      .select(`
      *,
      team:teams(*),
      round:rounds(*),
      longest_shot_player:players!longest_shot_player_id(*)
    `)
      .single()

    if (error) throw error
    return data
  },

  // Delete a hole completion
  async deleteCompletion(id: string): Promise<void> {
    const { error } = await supabase.from("team_hole_completions").delete().eq("id", id)

    if (error) throw error
  },

  // Get recent completions across all rounds (for global feed)
  async getRecentCompletions(limit = 20): Promise<TeamHoleCompletion[]> {
    const { data, error } = await supabase
      .from("team_hole_completions")
      .select(`
      *,
      team:teams(*),
      round:rounds(*),
      longest_shot_player:players!longest_shot_player_id(*)
    `)
      .order("completed_at", { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  },
}
