import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken, extractBearerToken } from '@/lib/session'

async function getUser(request: Request) {
  const token = await extractBearerToken(request.headers.get('authorization'))
  if (!token) return null
  const payload = await verifyToken(token)
  return payload?.sub as string | null
}

export async function POST(request: Request) {
  try {
    const userId = await getUser(request)
    if (!userId) return NextResponse.json({ detail: 'Not authenticated' }, { status: 401 })

    const body: { title: string, level: string, parent_id: string | null }[] = await request.json()
    
    // Create sequentially so that parent IDs can be referenced if needed
    // The bulk request might not depend on each other within the same batch,
    // but the frontend wizard replaces tempIds with real IDs before sending them sequentially.
    // Wait, the frontend might send goals that are meant to be children of earlier items? 
    // In FastAPI it did sequential inserts and commit. Let's do a transaction.
    
    const created = []
    for (const item of body) {
      const goal = await prisma.goal.create({
        data: {
          user_id: userId,
          title: item.title,
          level: item.level,
          parent_id: item.parent_id,
        }
      })
      created.push(goal)
    }

    return NextResponse.json(created, { status: 201 })
  } catch (error: any) {
    console.error('Bulk create error', error)
    return NextResponse.json({ detail: 'Internal Server Error' }, { status: 500 })
  }
}
