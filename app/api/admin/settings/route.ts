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

    // Admin check
    const user = await prisma.user.findUnique({
      where: { id: payload.sub as string }
    })

    if (!user || !user.is_admin) {
      return NextResponse.json({ detail: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { home_theme_mode, home_theme_accent } = body

    if (!home_theme_mode && !home_theme_accent) {
      return NextResponse.json({ detail: 'No settings provided' }, { status: 400 })
    }

    const updateData: any = {}
    if (home_theme_mode) updateData.home_theme_mode = home_theme_mode
    if (home_theme_accent) updateData.home_theme_accent = home_theme_accent

    const settings = await prisma.systemSetting.upsert({
      where: { id: 'global' },
      update: updateData,
      create: {
        id: 'global',
        home_theme_mode: home_theme_mode || 'light',
        home_theme_accent: home_theme_accent || 'indigo',
      }
    })

    return NextResponse.json(settings)
  } catch (error: any) {
    console.error('Update global settings error:', error)
    return NextResponse.json({ detail: 'Internal Server Error' }, { status: 500 })
  }
}
