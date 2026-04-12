import { PrismaClient } from '@prisma/client'
import bcryptjs from 'bcryptjs'

const SEED_EMAIL = 'sidehustle@pathieve.dev'
const SEED_PASSWORD = 'Pathieve123!'

export async function seedSideHustleUser(prisma: PrismaClient) {
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
      title: '副業で月50万円を安定させる',
      level: '5year',
    },
  })

  const g1y = await prisma.goal.create({
    data: {
      user_id: user.id,
      title: 'Web制作の最初の案件を受注する',
      level: '1year',
      parent_id: g5.id,
    },
  })

  await prisma.goal.create({
    data: {
      user_id: user.id,
      title: 'ポートフォリオサイトを公開する',
      level: '1month',
      parent_id: g1y.id,
      tasks: {
        create: [
          { title: 'プロフィール・実績ページ作成', memo: 'Next.js + Vercel', progress: 100 },
          { title: '問い合わせフォーム実装', memo: 'Resend APIを使用', progress: 60 },
          { title: 'SEO メタタグ設定', memo: 'OGP画像も作成', progress: 30 },
          { title: 'クラウドワークスに登録・プロフィール入力', memo: 'ポートフォリオURLも記載', progress: 0 },
        ],
      },
    },
  })

  console.log('[Seed] - Seeded goals/tasks for:', SEED_EMAIL)
}
