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

    const { goal_id, title, memo, progress } = await request.json()

    const goal = await prisma.goal.findUnique({ where: { id: goal_id } })
    if (!goal || goal.user_id !== userId) {
      return NextResponse.json({ detail: 'Goal not found' }, { status: 404 })
    }

    const task = await prisma.task.create({
      data: {
        goal_id,
        title,
        memo: memo || '',
        progress: progress || 0,
      }
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ detail: 'Internal Server Error' }, { status: 500 })
  }
}
