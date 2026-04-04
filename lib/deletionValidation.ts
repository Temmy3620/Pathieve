// ──────────────────────────────────────────
// Pathieve — Deletion Validation Logic
// Applied on the frontend before API calls
// ──────────────────────────────────────────
import type { Goal, Task } from '@/types'

/** 5年後の目標はいつでも削除できる */
export function can5YearGoalBeDeleted(/* _goal: Goal */): true {
  return true
}

/**
 * 1年後の目標は、5年後 または 1ヶ月後の目標と
 * 連結がある場合は削除できない
 */
export function can1YearGoalBeDeleted(
  goal: Goal,
  allGoals: Goal[],
): boolean {
  // Has a parent (linked to 5year)
  if (goal.parent_id !== null) return false

  // Has children (linked to 1month)
  const hasChildren = allGoals.some(
    (g) => g.parent_id === goal.id && g.level === '1month',
  )
  if (hasChildren) return false

  return true
}

/**
 * 1ヶ月後の目標は、未完了タスクがある場合は削除できない
 * （全タスクが progress === 100 なら削除可）
 */
export function can1MonthGoalBeDeleted(
  goal: Goal,
  tasks: Task[],
): boolean {
  const myTasks = tasks.filter((t) => t.goal_id === goal.id)
  if (myTasks.length === 0) return true
  return myTasks.every((t) => t.progress === 100)
}

/**
 * Unified helper — returns whether a goal can be deleted,
 * and a human-readable reason if it cannot.
 */
export function getDeletionStatus(
  goal: Goal,
  allGoals: Goal[],
  allTasks: Task[],
): { canDelete: boolean; reason?: string } {
  if (goal.level === '5year') {
    return { canDelete: true }
  }

  if (goal.level === '1year') {
    const ok = can1YearGoalBeDeleted(goal, allGoals)
    return ok
      ? { canDelete: true }
      : { canDelete: false, reason: '5年後または1ヶ月後の目標と連結されているため削除できません' }
  }

  if (goal.level === '1month') {
    const ok = can1MonthGoalBeDeleted(goal, allTasks)
    return ok
      ? { canDelete: true }
      : { canDelete: false, reason: '未完了のタスクがあるため削除できません（全タスクを完了してください）' }
  }

  return { canDelete: false, reason: '不明なエラー' }
}
