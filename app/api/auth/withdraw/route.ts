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

    const user = await prisma.user.findUnique({ where: { id: payload.sub as string } })
    if (!user) return NextResponse.json({ detail: 'User not found' }, { status: 404 })

    // Soft delete / Anonymize
    await prisma.user.update({
      where: { id: user.id },
      data: {
        is_active: false,
        email: `withdrawn_${user.id}@deleted.local`,
      }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error: any) {
    console.error('Withdraw error:', error)
    return NextResponse.json({ detail: 'Internal Server Error' }, { status: 500 })
  }
}
