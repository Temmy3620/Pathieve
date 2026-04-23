import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    let settings = await prisma.systemSetting.findUnique({
      where: { id: 'global' },
    })

    if (!settings) {
      settings = await prisma.systemSetting.create({
        data: {
          id: 'global',
          home_theme_mode: 'light',
          home_theme_accent: 'indigo',
        }
      })
    }

    return NextResponse.json(settings)
  } catch (error: any) {
    console.error('Get global settings error:', error)
    return NextResponse.json({ detail: 'Internal Server Error' }, { status: 500 })
  }
}
