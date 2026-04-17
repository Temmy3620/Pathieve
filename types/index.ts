// ──────────────────────────────────────────
// Pathieve — Core Type Definitions
// Shared with FastAPI backend schemas
// ──────────────────────────────────────────

/** Goal hierarchy level */
export type GoalLevel = '5year' | '1year' | '1month'

/** Goal entity — mirrors backend Goal schema */
export interface Goal {
  id: string
  user_id: string
  title: string
  level: GoalLevel
  /** Parent goal ID for hierarchy linkage (null = top-level) */
  parent_id: string | null
  /** Populated by frontend when building the tree */
  children?: Goal[]
  tasks?: Task[]
  created_at: string
  updated_at: string
}

/** Task entity — mirrors backend Task schema */
export interface Task {
  id: string
  goal_id: string   // belongs to a 1month goal
  title: string
  memo: string
  /** Progress 0–100 */
  progress: number
  order: number
  created_at: string
  updated_at: string
}

/** Authenticated user */
export interface User {
  id: string
  email: string
  is_active: boolean
  created_at: string
}

/** Auth token response from FastAPI */
export interface AuthToken {
  access_token: string
  token_type: 'bearer'
}

// ── Wizard temp state ────────────────────

/** Wizard session (in-memory until Step 4 completes) */
export interface WizardState {
  goals5year: WizardGoalDraft[]
  goals1year: WizardGoalDraft[]
  goals1month: WizardGoalDraft[]
  tasks: WizardTaskDraft[]
}

export interface WizardGoalDraft {
  tempId: string
  title: string
  level: GoalLevel
  parentTempId: string | null
}

export interface WizardTaskDraft {
  tempId: string
  title: string
  memo: string
  parentTempId: string  // 1month goal tempId
}

// ── API request / response shapes ────────

export interface CreateGoalPayload {
  title: string
  level: GoalLevel
  parent_id: string | null
}

export interface CreateTaskPayload {
  goal_id: string
  title: string
  memo?: string
  progress?: number
}

export interface UpdateTaskPayload {
  title?: string
  memo?: string
  progress?: number
  order?: number
}

export interface UpdateGoalPayload {
  title?: string
  parent_id?: string | null
}

// ── Settings / Theme ─────────────────────

export type ThemeMode = 'light' | 'dark'
export type AccentColor = 'indigo' | 'purple' | 'teal' | 'rose' | 'sky' | 'zinc'

export interface AppSettings {
  mode: ThemeMode
  accent: AccentColor
}
