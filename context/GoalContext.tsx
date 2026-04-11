'use client'
import {
  createContext, useContext, useCallback,
  useState, ReactNode,
} from 'react'
import type { Goal, Task, WizardState } from '@/types'
import { goalApi, taskApi, authApi } from '@/lib/api'

interface GoalContextValue {
  goals: Goal[]
  tasks: Task[]
  isLoading: boolean
  isAuthenticated: boolean
  isInitialized: boolean

  // Auth
  checkAuth: () => Promise<boolean>
  logout: () => void

  // Data ops
  refreshData: () => Promise<void>
  createGoal: (title: string, level: Goal['level'], parentId: string | null) => Promise<Goal>
  updateGoal: (id: string, title: string) => Promise<void>
  deleteGoal: (id: string) => Promise<void>

  createTask: (goalId: string, title: string, memo?: string) => Promise<Task>
  updateTask: (id: string, patch: Partial<Pick<Task, 'title' | 'memo' | 'progress'>>) => Promise<void>
  deleteTask: (id: string) => Promise<void>

  // Wizard
  submitWizard: (wizard: WizardState) => Promise<void>
}

const GoalContext = createContext<GoalContextValue>({} as GoalContextValue)

export function GoalProvider({ children }: { children: ReactNode }) {
  const [goals, setGoals] = useState<Goal[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  const checkAuth = useCallback(async (): Promise<boolean> => {
    const token = localStorage.getItem('pathieve_token')
    if (!token) {
      setIsAuthenticated(false)
      setIsInitialized(true)
      return false
    }
    try {
      await authApi.me()
      setIsAuthenticated(true)
      // Note: isInitialized is set AFTER refreshData in page.tsx or here if we want but 
      // let's be careful. Actually, let's let the caller decide or set it here if simple.
      // Better: let's handle the "full init" in checkAuth for simplicity.
      return true
    } catch {
      localStorage.removeItem('pathieve_token')
      setIsAuthenticated(false)
      setIsInitialized(true)
      return false
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('pathieve_token')
    document.cookie = 'pathieve_token=; path=/; max-age=0'
    setIsAuthenticated(false)
    setGoals([])
    setTasks([])
  }, [])

  const refreshData = useCallback(async () => {
    setIsLoading(true)
    try {
      const fetchedGoals = await goalApi.list()
      const oneMonthGoals = fetchedGoals.filter((g) => g.level === '1month')
      const nested = await Promise.all(
        oneMonthGoals.map((g) => taskApi.listByGoal(g.id)),
      )
      setGoals(fetchedGoals)
      setTasks(nested.flat())
    } catch (e) {
      console.error('refreshData failed', e)
    } finally {
      setIsLoading(false)
      setIsInitialized(true)
    }
  }, [])

  // Goal CRUD
  const createGoal = useCallback(
    async (title: string, level: Goal['level'], parentId: string | null) => {
      const g = await goalApi.create({ title, level, parent_id: parentId })
      setGoals((prev) => [...prev, g])
      return g
    },
    [],
  )

  const updateGoal = useCallback(async (id: string, title: string) => {
    const g = await goalApi.update(id, { title })
    setGoals((prev) => prev.map((x) => (x.id === id ? g : x)))
  }, [])

  const deleteGoal = useCallback(async (id: string) => {
    await goalApi.delete(id)
    setGoals((prev) => prev.filter((x) => x.id !== id))
  }, [])

  // Task CRUD
  const createTask = useCallback(
    async (goalId: string, title: string, memo = '') => {
      const t = await taskApi.create({ goal_id: goalId, title, memo, progress: 0 })
      setTasks((prev) => [...prev, t])
      return t
    },
    [],
  )

  const updateTask = useCallback(
    async (id: string, patch: Partial<Pick<Task, 'title' | 'memo' | 'progress'>>) => {
      const t = await taskApi.update(id, patch)
      setTasks((prev) => prev.map((x) => (x.id === id ? t : x)))
    },
    [],
  )

  const deleteTask = useCallback(async (id: string) => {
    await taskApi.delete(id)
    setTasks((prev) => prev.filter((x) => x.id !== id))
  }, [])

  // Wizard bulk submit
  const submitWizard = useCallback(async (wizard: WizardState) => {
    setIsLoading(true)
    try {
      // 1. Create 5year goals
      const created5year: Record<string, Goal> = {}
      for (const d of wizard.goals5year) {
        const g = await goalApi.create({ title: d.title, level: '5year', parent_id: null })
        created5year[d.tempId] = g
      }

      // 2. Create 1year goals (link parent)
      const created1year: Record<string, Goal> = {}
      for (const d of wizard.goals1year) {
        const parentId = d.parentTempId ? (created5year[d.parentTempId]?.id ?? null) : null
        const g = await goalApi.create({ title: d.title, level: '1year', parent_id: parentId })
        created1year[d.tempId] = g
      }

      // 3. Create 1month goals
      const created1month: Record<string, Goal> = {}
      for (const d of wizard.goals1month) {
        const parentId = d.parentTempId ? (created1year[d.parentTempId]?.id ?? null) : null
        const g = await goalApi.create({ title: d.title, level: '1month', parent_id: parentId })
        created1month[d.tempId] = g
      }

      // 4. Create tasks
      const createdTasks: Task[] = []
      for (const d of wizard.tasks) {
        const goalId = created1month[d.parentTempId]?.id
        if (!goalId) continue
        const t = await taskApi.create({ goal_id: goalId, title: d.title, memo: d.memo, progress: 0 })
        createdTasks.push(t)
      }

      setGoals([
        ...Object.values(created5year),
        ...Object.values(created1year),
        ...Object.values(created1month),
      ])
      setTasks(createdTasks)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return (
    <GoalContext.Provider
      value={{
        goals, tasks, isLoading, isAuthenticated, isInitialized,
        checkAuth, logout, refreshData,
        createGoal, updateGoal, deleteGoal,
        createTask, updateTask, deleteTask,
        submitWizard,
      }}
    >
      {children}
    </GoalContext.Provider>
  )
}

export const useGoals = () => useContext(GoalContext)
