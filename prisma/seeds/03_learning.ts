import { PrismaClient } from '@prisma/client'
import bcryptjs from 'bcryptjs'

const SEED_EMAIL = 'learning@pathieve.dev'
const SEED_PASSWORD = 'Pathieve123!'

export async function seedLearningUser(prisma: PrismaClient) {
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
      title: '英語でビジネス会話ができるようになる',
      level: '5year',
    },
  })

  const g1y = await prisma.goal.create({
    data: {
      user_id: user.id,
      title: 'TOEIC 800点を取得する',
      level: '1year',
      parent_id: g5.id,
    },
  })

  await prisma.goal.create({
    data: {
      user_id: user.id,
      title: '毎日30分の英語学習習慣を確立する',
      level: '1month',
      parent_id: g1y.id,
      tasks: {
        create: [
          { title: '英単語アプリで1日100問', memo: 'AnkiまたはDuolingo', progress: 20 },
          { title: 'YouTube英語チャンネルを毎日視聴', memo: 'TED・BBCなど', progress: 50 },
          { title: 'TOEIC 公式問題集パート5を解く', memo: '1週間で30問目標', progress: 0 },
        ],
      },
    },
  })

  console.log('[Seed] - Seeded goals/tasks for:', SEED_EMAIL)
}
