import { PrismaClient } from '@prisma/client'
import bcryptjs from 'bcryptjs'

const SEED_EMAIL = 'fitness@pathieve.dev'
const SEED_PASSWORD = 'Pathieve123!'

export async function seedFitnessUser(prisma: PrismaClient) {
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
      title: 'フルマラソンを完走し、健康的な体を維持する',
      level: '5year',
    },
  })

  const g1y = await prisma.goal.create({
    data: {
      user_id: user.id,
      title: '体重を10kg減らし、ハーフマラソンを完走する',
      level: '1year',
      parent_id: g5.id,
    },
  })

  await prisma.goal.create({
    data: {
      user_id: user.id,
      title: '週3回のランニング習慣と食事管理を始める',
      level: '1month',
      parent_id: g1y.id,
      tasks: {
        create: [
          { title: 'ランニングシューズとウェアを購入する', memo: 'スポーツショップへ行く', progress: 100 },
          { title: '毎朝のアラームを30分早くセットする', memo: '朝ランのため', progress: 80 },
          { title: '週末に5kmのランニングに挑戦する', memo: '無理のないペースで', progress: 20 },
          { title: '毎日の食事記録アプリをインストールして記録開始', memo: 'カロリー管理', progress: 60 },
        ],
      },
    },
  })

  console.log('[Seed] - Seeded goals/tasks for:', SEED_EMAIL)
}
