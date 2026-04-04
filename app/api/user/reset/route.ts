import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken, extractBearerToken } from '@/lib/session'

export async function DELETE(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = await extractBearerToken(authHeader)

    if (!token) return NextResponse.json({ detail: 'Not authenticated' }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload || !payload.sub) return NextResponse.json({ detail: 'Could not validate credentials' }, { status: 401 })

    const userId = payload.sub as string
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return NextResponse.json({ detail: 'User not found' }, { status: 404 })

    // Delete all goals (and cascade: tasks) for the current user
    await prisma.goal.deleteMany({
        where: { user_id: userId }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error: any) {
    console.error('Reset User Data error:', error)
    return NextResponse.json({ detail: 'Internal Server Error' }, { status: 500 })
  }
}
