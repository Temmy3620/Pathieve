import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken, extractBearerToken } from '@/lib/session'

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = await extractBearerToken(authHeader)

    if (!token) {
      return NextResponse.json({ detail: 'Not authenticated' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || !payload.sub) {
      return NextResponse.json({ detail: 'Could not validate credentials' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub as string },
      select: {
        id: true,
        email: true,
        is_active: true,
        created_at: true,
      }
    })

    if (!user || !user.is_active) {
      return NextResponse.json({ detail: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error: any) {
    console.error('Me error:', error)
    return NextResponse.json({ detail: 'Internal Server Error' }, { status: 500 })
  }
}
