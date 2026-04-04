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

    return NextResponse.json(goal)
  } catch (error: any) {
    return NextResponse.json({ detail: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const userId = await getUser(request)
    if (!userId) return NextResponse.json({ detail: 'Not authenticated' }, { status: 401 })

    const { id: goalId } = await context.params
    const goal = await prisma.goal.findUnique({ where: { id: goalId } })
    if (!goal || goal.user_id !== userId) {
      return NextResponse.json({ detail: 'Goal not found' }, { status: 404 })
    }

    const { title, parent_id } = await request.json()
    const updated = await prisma.goal.update({
      where: { id: goalId },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(parent_id !== undefined ? { parent_id } : {}),
      }
    })

    return NextResponse.json(updated)
  } catch (error: any) {
    return NextResponse.json({ detail: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const userId = await getUser(request)
    if (!userId) return NextResponse.json({ detail: 'Not authenticated' }, { status: 401 })

    const { id: goalId } = await context.params
    const goal = await prisma.goal.findUnique({ where: { id: goalId } })
    if (!goal || goal.user_id !== userId) {
      return NextResponse.json({ detail: 'Goal not found' }, { status: 404 })
    }

    // Validation
    if (goal.level === '1year') {
      const children = await prisma.goal.findFirst({ where: { parent_id: goalId } })
      if (children) {
        return NextResponse.json({ detail: 'Cannot delete a 1-year goal that has 1-month goals linked to it.' }, { status: 403 })
      }
    }

    if (goal.level === '5year') {
      const children = await prisma.goal.findFirst({ where: { parent_id: goalId } })
      if (children) {
        return NextResponse.json({ detail: 'Cannot delete a 5-year goal that has 1-year goals linked to it.' }, { status: 403 })
      }
    }

    if (goal.level === '1month') {
      const incomplete = await prisma.task.findFirst({
        where: { goal_id: goalId, progress: { lt: 100 } }
      })
      if (incomplete) {
        return NextResponse.json({ detail: 'Cannot delete a 1-month goal that has incomplete tasks.' }, { status: 403 })
      }
    }

    await prisma.goal.delete({ where: { id: goalId } })
    return new NextResponse(null, { status: 204 })
  } catch (error: any) {
    return NextResponse.json({ detail: 'Internal Server Error' }, { status: 500 })
  }
}
