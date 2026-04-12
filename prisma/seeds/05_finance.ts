import { PrismaClient } from '@prisma/client'
import bcryptjs from 'bcryptjs'

const SEED_EMAIL = 'finance@pathieve.dev'
const SEED_PASSWORD = 'Pathieve123!'

export async function seedFinanceUser(prisma: PrismaClient) {
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
      title: '資産1000万円を構築し、投資運用を本格化する',
      level: '5year',
    },
  })

  const g1y = await prisma.goal.create({
    data: {
      user_id: user.id,
      title: '新NISAで年間120万円の枠を埋める',
      level: '1year',
      parent_id: g5.id,
    },
  })

  await prisma.goal.create({
    data: {
      user_id: user.id,
      title: '家計の支出を見直し、月4万円の余剰資金を作る',
      level: '1month',
      parent_id: g1y.id,
      tasks: {
        create: [
          { title: 'サブスクリプションサービスの解約・整理', memo: '使っていない動画配信など', progress: 100 },
          { title: 'ネット証券の口座開設手続き', memo: 'SBIか楽天', progress: 90 },
          { title: 'つみたて投資枠の銘柄選定', memo: 'オールカントリーかS&P500', progress: 40 },
          { title: '最初の引き落とし設定を完了する', memo: 'クレカ積立設定', progress: 10 },
        ],
      },
    },
  })

  console.log('[Seed] - Seeded goals/tasks for:', SEED_EMAIL)
}
