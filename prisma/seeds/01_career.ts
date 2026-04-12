import { PrismaClient } from '@prisma/client'
import bcryptjs from 'bcryptjs'

const SEED_EMAIL = 'career@pathieve.dev'
const SEED_PASSWORD = 'Pathieve123!'

export async function seedCareerUser(prisma: PrismaClient) {
  const existingUser = await prisma.user.findUnique({
    where: { email: SEED_EMAIL },
  })

  if (existingUser) {
    console.log('[Seed] User already seeded:', SEED_EMAIL)
    return
  }

  const hashedPassword = await bcryptjs.hash(SEED_PASSWORD, 10)
  const user = await prisma.user.create({
    data: {
      email: SEED_EMAIL,
      hashed_password: hashedPassword,
      is_active: true,
    },
  })

  console.log('[Seed] Created User:', user.email)

  const g5 = await prisma.goal.create({
    data: {
      user_id: user.id,
      title: 'フルスタックエンジニアとして独立する',
      level: '5year',
    },
  })

  const g1y = await prisma.goal.create({
    data: {
      user_id: user.id,
      title: 'Next.js + FastAPI でプロダクトを一人でリリースする',
      level: '1year',
      parent_id: g5.id,
    },
  })

  await prisma.goal.create({
    data: {
      user_id: user.id,
      title: 'Pathieve MVP をリリースする',
      level: '1month',
      parent_id: g1y.id,
      tasks: {
        create: [
          { title: 'ログイン・認証 API の実装', memo: 'JWT + bcrypt', progress: 90 },
          { title: 'Goal CRUD API の実装', memo: 'SQLAlchemy + FastAPI', progress: 70 },
          { title: 'PathMap UI の実装', memo: 'SVGコネクション線を含む', progress: 40 },
          { title: 'Docker Compose で統合テスト', memo: 'frontend + backend + db', progress: 10 },
        ],
      },
    },
  })

  console.log('[Seed] - Seeded goals/tasks for:', SEED_EMAIL)
}
