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

    const goals = await prisma.goal.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'asc' },
    })
    return NextResponse.json(goals)
  } catch (error: any) {
    return NextResponse.json({ detail: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUser(request)
    if (!userId) return NextResponse.json({ detail: 'Not authenticated' }, { status: 401 })

    const body = await request.json()
    const { title, level, parent_id } = body

    if (parent_id) {
      const parent = await prisma.goal.findUnique({ where: { id: parent_id } })
      if (!parent || parent.user_id !== userId) {
        return NextResponse.json({ detail: 'Invalid parent_id' }, { status: 400 })
      }
    }

    const goal = await prisma.goal.create({
      data: {
        user_id: userId,
        title,
        level,
        parent_id,
      }
    })
    return NextResponse.json(goal, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ detail: 'Internal Server Error' }, { status: 500 })
  }
}
