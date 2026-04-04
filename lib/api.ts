// ──────────────────────────────────────────
// Pathieve — FastAPI Client
// ──────────────────────────────────────────
import type {
  Goal, Task, User, AuthToken,
  CreateGoalPayload, UpdateGoalPayload,
  CreateTaskPayload, UpdateTaskPayload,
} from '@/types'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? ''

// ── Helpers ──────────────────────────────

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('pathieve_token')
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail ?? 'API error')
  }
  if (res.status === 204) return undefined as unknown as T
  return res.json()
}

// ── Auth ─────────────────────────────────

export const authApi = {
  register: (email: string, password: string): Promise<User> =>
    request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  login: (email: string, password: string): Promise<AuthToken> =>
    request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  resetPassword: (email: string): Promise<void> =>
    request('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  me: (): Promise<User> =>
    request('/api/auth/me'),

  withdraw: (): Promise<void> =>
    request('/api/auth/withdraw', { method: 'DELETE' }),
}

// ── Goals ────────────────────────────────

export const goalApi = {
  list: (): Promise<Goal[]> =>
    request('/api/goals'),

  get: (id: string): Promise<Goal> =>
    request(`/api/goals/${id}`),

  create: (payload: CreateGoalPayload): Promise<Goal> =>
    request('/api/goals', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  update: (id: string, payload: UpdateGoalPayload): Promise<Goal> =>
    request(`/api/goals/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  delete: (id: string): Promise<void> =>
    request(`/api/goals/${id}`, { method: 'DELETE' }),

  /** Bulk-create goals for wizard completion */
  bulkCreate: (goals: CreateGoalPayload[]): Promise<Goal[]> =>
    request('/api/goals/bulk', {
      method: 'POST',
      body: JSON.stringify(goals),
    }),
}

// ── Tasks ────────────────────────────────

export const taskApi = {
  listByGoal: (goalId: string): Promise<Task[]> =>
    request(`/api/goals/${goalId}/tasks`),

  get: (id: string): Promise<Task> =>
    request(`/api/tasks/${id}`),

  create: (payload: CreateTaskPayload): Promise<Task> =>
    request('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  update: (id: string, payload: UpdateTaskPayload): Promise<Task> =>
    request(`/api/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  delete: (id: string): Promise<void> =>
    request(`/api/tasks/${id}`, { method: 'DELETE' }),

  /** Bulk-create tasks for wizard completion */
  bulkCreate: (tasks: CreateTaskPayload[]): Promise<Task[]> =>
    request('/api/tasks/bulk', {
      method: 'POST',
      body: JSON.stringify(tasks),
    }),
}

// ── User settings ────────────────────────

export const userApi = {
  resetData: (): Promise<void> =>
    request('/api/user/reset', { method: 'DELETE' }),
}
