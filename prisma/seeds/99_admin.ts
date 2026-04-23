import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

export async function seedAdminUser(prisma: PrismaClient) {
  console.log('Seeding admin user...')

  const adminEmail = 'admin@example.com'
  const hashedPassword = await bcrypt.hash('password', 10)

  // すでに存在するかチェック
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  })

  if (!existingAdmin) {
    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        hashed_password: hashedPassword,
        is_active: true,
        is_admin: true,
      }
    })
    console.log(`✅ Created Admin User: ${adminUser.email}`)
  } else {
    // 既存のユーザーがいれば管理者フラグをtrueに更新
    if (!existingAdmin.is_admin) {
      await prisma.user.update({
        where: { id: existingAdmin.id },
        data: { is_admin: true }
      })
      console.log(`✅ Updated existing Admin User: ${adminEmail} to have admin privileges`)
    } else {
      console.log(`✅ Admin User already exists: ${adminEmail}`)
    }
  }
}
