import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken, extractBearerToken } from '@/lib/session'

async function getUser(request: Request) {
  const token = await extractBearerToken(request.headers.get('authorization'))
  if (!token) return null
  const payload = await verifyToken(token)
  return payload?.sub as string | null
}

export async function POST(request: Request) {
  try {
    const userId = await getUser(request)
    if (!userId) return NextResponse.json({ detail: 'Not authenticated' }, { status: 401 })

    const body = await request.json()
    const action = body.action || 'login'

    // 日本時間(JST)での「今日」の境界を計算
    const now = new Date()
    const todayStr = new Date(now.getTime() + 9 * 60 * 60 * 1000).toISOString().split('T')[0]
    
    // DB内の created_at は UTC なので、UTCに戻して境界範囲を作成する
    // todayStr(YYYY-MM-DD) に対応するJSTの0:00と24:00をUTCで表現
    const jstOffset = 9 * 60 * 60 * 1000
    const startOfTodayJST = new Date(`${todayStr}T00:00:00Z`)
    const startOfTodayUTC = new Date(startOfTodayJST.getTime() - jstOffset)
    
    const startOfTomorrowUTC = new Date(startOfTodayUTC.getTime() + 24 * 60 * 60 * 1000)

    // 今日すでに同じアクション（login）が記録されているかチェック
    const existing = await prisma.activity.findFirst({
      where: {
        user_id: userId,
        action: action,
        created_at: {
          gte: startOfTodayUTC,
          lt: startOfTomorrowUTC
        }
      }
    })

    if (existing) {
      return NextResponse.json({ detail: 'Already recorded today', id: existing.id })
    }

    const activity = await prisma.activity.create({
      data: {
        user_id: userId,
        action: action
      }
    })

    return NextResponse.json(activity)
  } catch (error: any) {
    console.error('Activity POST Error:', error)
    return NextResponse.json({ detail: 'Internal Server Error' }, { status: 500 })
  }
}
