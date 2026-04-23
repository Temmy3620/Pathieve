import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken, extractBearerToken } from '@/lib/session'

async function getAdminUser(request: Request) {
  const token = await extractBearerToken(request.headers.get('authorization'))
  if (!token) return null
  const payload = await verifyToken(token)
  if (!payload || !payload.sub) return null

  const user = await prisma.user.findUnique({
    where: { id: payload.sub as string },
    select: { is_admin: true }
  })
  
  if (!user || !user.is_admin) return null
  return payload.sub as string
}

export async function GET(request: Request) {
  try {
    const adminId = await getAdminUser(request)
    if (!adminId) {
      return NextResponse.json({ detail: 'Forbidden' }, { status: 403 })
    }

    // 全ユーザーの情報を取得（パスワードなどの機密情報は除く）
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        is_active: true,
        is_admin: true,
        created_at: true,
        _count: {
          select: {
            goals: true,
            activities: true,
          }
        }
      },
      orderBy: { created_at: 'desc' }
    })

    return NextResponse.json(users)
  } catch (error: any) {
    console.error('Admin getUsers error:', error)
    return NextResponse.json({ detail: 'Internal Server Error' }, { status: 500 })
  }
}
