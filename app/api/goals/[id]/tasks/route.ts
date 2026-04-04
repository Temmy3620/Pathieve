import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken, extractBearerToken } from '@/lib/session'

async function getUser(request: Request) {
  const token = await extractBearerToken(request.headers.get('authorization'))
  if (!token) return null
  const payload = await verifyToken(token)
  return payload?.sub as string | null
}

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const userId = await getUser(request)
    if (!userId) return NextResponse.json({ detail: 'Not authenticated' }, { status: 401 })

    const { id: goalId } = await context.params
    const goal = await prisma.goal.findUnique({ where: { id: goalId } })
    if (!goal || goal.user_id !== userId) {
      return NextResponse.json({ detail: 'Goal not found' }, { status: 404 })
    }

    const tasks = await prisma.task.findMany({
      where: { goal_id: goalId },
      orderBy: { created_at: 'asc' },
    })

    return NextResponse.json(tasks)
  } catch (error: any) {
    return NextResponse.json({ detail: 'Internal Server Error' }, { status: 500 })
  }
}
