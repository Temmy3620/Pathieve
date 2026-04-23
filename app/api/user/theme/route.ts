import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken, extractBearerToken } from '@/lib/session'

export async function PATCH(request: Request) {
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

    const body = await request.json()
    const { theme_mode, theme_accent } = body

    if (!theme_mode && !theme_accent) {
      return NextResponse.json({ detail: 'No theme fields provided' }, { status: 400 })
    }

    const updateData: any = {}
    if (theme_mode) updateData.theme_mode = theme_mode
    if (theme_accent) updateData.theme_accent = theme_accent

    const user = await prisma.user.update({
      where: { id: payload.sub as string },
      data: updateData,
      select: {
        id: true,
        theme_mode: true,
        theme_accent: true,
      }
    })

    return NextResponse.json(user)
  } catch (error: any) {
    console.error('Update user theme error:', error)
    return NextResponse.json({ detail: 'Internal Server Error' }, { status: 500 })
  }
}
