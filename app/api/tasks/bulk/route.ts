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

    const body: { goal_id: string, title: string, memo?: string, progress?: number }[] = await request.json()

    // Validate all goal_ids first. In FastAPI it validated per item.
    const created = []
    for (const item of body) {
      const goal = await prisma.goal.findUnique({ where: { id: item.goal_id } })
      if (!goal || goal.user_id !== userId) {
        return NextResponse.json({ detail: 'Goal not found' }, { status: 404 })
      }
      
      const task = await prisma.task.create({
        data: {
          goal_id: item.goal_id,
          title: item.title,
          memo: item.memo || '',
          progress: item.progress || 0,
        }
      })
      created.push(task)
    }

    return NextResponse.json(created, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ detail: 'Internal Server Error' }, { status: 500 })
  }
}
