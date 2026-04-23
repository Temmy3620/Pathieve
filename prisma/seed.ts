import { PrismaClient } from '@prisma/client'
import { seedOriginalTestUser } from './seeds/00_original_test_user'
import { seedCareerUser } from './seeds/01_career'
import { seedSideHustleUser } from './seeds/02_side_hustle'
import { seedLearningUser } from './seeds/03_learning'
import { seedFitnessUser } from './seeds/04_fitness'
import { seedFinanceUser } from './seeds/05_finance'
import { seedAdminUser } from './seeds/99_admin'

const prisma = new PrismaClient()

async function main() {
  console.log('[Seed] Start seeding...')

  await seedOriginalTestUser(prisma)
  await seedCareerUser(prisma)
  await seedSideHustleUser(prisma)
  await seedLearningUser(prisma)
  await seedFitnessUser(prisma)
  await seedFinanceUser(prisma)
  await seedAdminUser(prisma)

  console.log('[Seed] ✅ All seeds finished successfully.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
