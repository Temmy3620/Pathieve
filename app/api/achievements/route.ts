import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken, extractBearerToken } from '@/lib/session'

async function getUser(request: Request) {
  const token = await extractBearerToken(request.headers.get('authorization'))
  if (!token) return null
  const payload = await verifyToken(token)
  return payload?.sub as string | null
}

export async function GET(request: Request) {
  try {
    const userId = await getUser(request)
    if (!userId) return NextResponse.json({ detail: 'Not authenticated' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const months = parseInt(searchParams.get('months') || '3', 10)

    // JSTでの期間計算
    const now = new Date()
    const startDate = new Date(now.getFullYear(), now.getMonth() - months, now.getDate())

    // ユーザーに紐づく全てのタスクを取得（テンプレートは除く、または含む？）
    // 実績としては、実体タスク（is_template = false）のみを対象とする
    const tasks = await prisma.task.findMany({
      where: {
        goal: { user_id: userId },
        is_template: false,
        OR: [
          { created_at: { gte: startDate } },
          { updated_at: { gte: startDate } }
        ]
      },
      select: {
        id: true,
        progress: true,
        created_at: true,
        updated_at: true,
      }
    })

    // Activity テーブル（ログイン履歴など）も取得
    const activityLogs = await prisma.activity.findMany({
      where: {
        user_id: userId,
        created_at: { gte: startDate }
      },
      select: {
        action: true,
        created_at: true
      }
    })

    const activities: Record<string, number> = {}
    let totalCompleted = 0
    let totalTasks = tasks.length
    let totalProgressSum = 0

    // 月別集計用のデータ構造を初期化 (過去 months ヶ月分)
    const monthlyData: Record<string, { total: number, completed: number, progressSum: number }> = {}
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getMonth() + 1}月`
      monthlyData[key] = { total: 0, completed: 0, progressSum: 0 }
    }

    // 日付をYYYY-MM-DD (JST) で取得するヘルパー
    const toJSTDateString = (d: Date) => {
      const jstDate = new Date(d.getTime() + 9 * 60 * 60 * 1000)
      return jstDate.toISOString().split('T')[0]
    }

    tasks.forEach(task => {
      const createdDate = toJSTDateString(task.created_at)
      const updatedDate = toJSTDateString(task.updated_at)

      // 活動の記録（葉っぱ用）: 作成日と更新日をアクティビティとしてカウント
      activities[createdDate] = (activities[createdDate] || 0) + 1
      if (updatedDate !== createdDate) {
        activities[updatedDate] = (activities[updatedDate] || 0) + 1
      }

      // メトリクス集計
      totalProgressSum += task.progress
      if (task.progress === 100) {
        totalCompleted++
      }
      // 月別集計 (作成日を基準とする)
      const taskDate = new Date(task.created_at.getTime() + 9 * 60 * 60 * 1000)
      const monthKey = `${taskDate.getUTCMonth() + 1}月`

      if (monthlyData[monthKey]) {
        monthlyData[monthKey].total += 1
        monthlyData[monthKey].progressSum += task.progress
        if (task.progress === 100) {
          monthlyData[monthKey].completed += 1
        }
      }
    })

    // Activityログ（ログイン等）の加算
    activityLogs.forEach(log => {
      const logDate = toJSTDateString(log.created_at)
      activities[logDate] = (activities[logDate] || 0) + 1
    })

    const averageProgress = totalTasks > 0 ? Math.round(totalProgressSum / totalTasks) : 0

    const monthlyTrends = Object.keys(monthlyData).map(month => {
      const d = monthlyData[month]
      return {
        month,
        completed: d.completed,
        progress: d.total > 0 ? Math.round(d.progressSum / d.total) : 0
      }
    })

    return NextResponse.json({
      activities, // { "2024-05-01": 2, ... }
      metrics: {
        totalCompleted,
        totalTasks,
        averageProgress,
      },
      monthlyTrends
    })
  } catch (error: any) {
    console.error('Achievement GET Error:', error)
    return NextResponse.json({ detail: 'Internal Server Error' }, { status: 500 })
  }
}
