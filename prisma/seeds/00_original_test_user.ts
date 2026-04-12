import { PrismaClient } from '@prisma/client'
import bcryptjs from 'bcryptjs'

const SEED_EMAIL = 'seed@pathieve.dev'
const SEED_PASSWORD = 'Pathieve123!'

export async function seedOriginalTestUser(prisma: PrismaClient) {
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

  // ──────────────────────────────────────────────────────
  // Pattern A: キャリア — フルスタックエンジニア
  // ──────────────────────────────────────────────────────
  const g5a = await prisma.goal.create({
    data: {
      user_id: user.id,
      title: 'フルスタックエンジニアとして独立する',
      level: '5year',
    },
  })

  const g1ya = await prisma.goal.create({
    data: {
      user_id: user.id,
      title: 'Next.js + FastAPI でプロダクトを一人でリリースする',
      level: '1year',
      parent_id: g5a.id,
    },
  })

  await prisma.goal.create({
    data: {
      user_id: user.id,
      title: 'Pathieve MVP をリリースする',
      level: '1month',
      parent_id: g1ya.id,
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

  // ──────────────────────────────────────────────────────
  // Pattern B: 副業 — 月50万
  // ──────────────────────────────────────────────────────
  const g5b = await prisma.goal.create({
    data: {
      user_id: user.id,
      title: '副業で月50万円を安定させる',
      level: '5year',
    },
  })

  const g1yb = await prisma.goal.create({
    data: {
      user_id: user.id,
      title: 'Web制作の最初の案件を受注する',
      level: '1year',
      parent_id: g5b.id,
    },
  })

  await prisma.goal.create({
    data: {
      user_id: user.id,
      title: 'ポートフォリオサイトを公開する',
      level: '1month',
      parent_id: g1yb.id,
      tasks: {
        create: [
          { title: 'プロフィール・実績ページ作成', memo: 'Next.js + Vercel', progress: 100 },
          { title: '問い合わせフォーム実装', memo: 'Resend APIを使用', progress: 60 },
          { title: 'SEO メタタグ設定', memo: 'OGP画像も作成', progress: 30 },
          { title: 'クラウドワークスに登録・プロフィール入力', memo: '', progress: 0 },
        ],
      },
    },
  })

  // ──────────────────────────────────────────────────────
  // Pattern C: 学習 — 英語
  // ──────────────────────────────────────────────────────
  const g5c = await prisma.goal.create({
    data: {
      user_id: user.id,
      title: '英語でビジネス会話ができるようになる',
      level: '5year',
    },
  })

  const g1yc = await prisma.goal.create({
    data: {
      user_id: user.id,
      title: 'TOEIC 800点を取得する',
      level: '1year',
      parent_id: g5c.id,
    },
  })

  await prisma.goal.create({
    data: {
      user_id: user.id,
      title: '毎日30分の英語学習習慣を確立する',
      level: '1month',
      parent_id: g1yc.id,
      tasks: {
        create: [
          { title: '英単語アプリで1日100問', memo: 'AnkiまたはDuolingo', progress: 20 },
          { title: 'YouTube英語チャンネルを毎日視聴', memo: 'TED・BBCなど', progress: 50 },
          { title: 'TOEIC 公式問題集パート5を解く', memo: '1週間で30問目標', progress: 0 },
        ],
      },
    },
  })

  console.log('[Seed] ✅ Seeded test user:', SEED_EMAIL)
}
