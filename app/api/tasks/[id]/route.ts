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

    const { id: taskId } = await context.params
    const task = await prisma.task.findUnique({ where: { id: taskId }, include: { goal: true } })
    if (!task || task.goal.user_id !== userId) {
      return NextResponse.json({ detail: 'Task not found' }, { status: 404 })
    }

    return NextResponse.json({
        id: task.id,
        goal_id: task.goal_id,
        title: task.title,
        memo: task.memo,
        progress: task.progress,
        created_at: task.created_at,
        updated_at: task.updated_at,
    })
  } catch (error: any) {
    return NextResponse.json({ detail: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const userId = await getUser(request)
    if (!userId) return NextResponse.json({ detail: 'Not authenticated' }, { status: 401 })

    const { id: taskId } = await context.params
    const task = await prisma.task.findUnique({ where: { id: taskId }, include: { goal: true } })
    if (!task || task.goal.user_id !== userId) {
      return NextResponse.json({ detail: 'Task not found' }, { status: 404 })
    }

    const { title, memo, progress, notification_time, notification_days } = await request.json()
    
    if (progress !== undefined && (progress < 0 || progress > 100)) {
        return NextResponse.json({ detail: 'progress must be 0–100' }, { status: 422 })
    }

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(memo !== undefined ? { memo } : {}),
        ...(progress !== undefined ? { progress } : {}),
        ...(notification_time !== undefined ? { notification_time } : {}),
        ...(notification_days !== undefined ? { notification_days } : {}),
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

    const { id: taskId } = await context.params
    const task = await prisma.task.findUnique({ where: { id: taskId }, include: { goal: true } })
    if (!task || task.goal.user_id !== userId) {
      return NextResponse.json({ detail: 'Task not found' }, { status: 404 })
    }

    await prisma.task.delete({ where: { id: taskId } })
    return new NextResponse(null, { status: 204 })
  } catch (error: any) {
    return NextResponse.json({ detail: 'Internal Server Error' }, { status: 500 })
  }
}
