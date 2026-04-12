import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken, extractBearerToken } from '@/lib/session'

async function getUser(request: Request) {
  const token = await extractBearerToken(request.headers.get('authorization'))
  if (!token) return null
  const payload = await verifyToken(token)
  return payload?.sub as string | null
}

export async function PUT(request: Request) {
  try {
    const userId = await getUser(request)
    if (!userId) return NextResponse.json({ detail: 'Not authenticated' }, { status: 401 })

    const tasksToUpdate: { id: string, order: number }[] = await request.json()
    if (!Array.isArray(tasksToUpdate)) {
      return NextResponse.json({ detail: 'Invalid payload' }, { status: 400 })
    }

    // Wrap in a transaction to ensure all updates happen or none
    await prisma.$transaction(
      tasksToUpdate.map((task) =>
        prisma.task.updateMany({
          where: {
            id: task.id,
            goal: { user_id: userId }, // security check
          },
          data: { order: task.order },
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ detail: 'Internal Server Error' }, { status: 500 })
  }
}
