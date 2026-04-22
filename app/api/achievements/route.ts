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

    const activities: Record<string, number> = {}
    let totalCompleted = 0
    let totalTasks = tasks.length
    let totalProgressSum = 0

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
    })

    const averageProgress = totalTasks > 0 ? Math.round(totalProgressSum / totalTasks) : 0

    return NextResponse.json({
      activities, // { "2024-05-01": 2, ... }
      metrics: {
        totalCompleted,
        totalTasks,
        averageProgress,
      }
    })
  } catch (error: any) {
    console.error('Achievement GET Error:', error)
    return NextResponse.json({ detail: 'Internal Server Error' }, { status: 500 })
  }
}
