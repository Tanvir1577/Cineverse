import { db } from './src/lib/db'

async function main() {
  console.log('Starting seed...')

  // Check if admin already exists
  const existingAdmin = await db.admin.findUnique({
    where: { username: 'admin' },
  })

  if (existingAdmin) {
    console.log('Admin user already exists')
  } else {
    // Create admin user
    const admin = await db.admin.create({
      data: {
        username: 'admin',
        password: '@Creativehelp2580',
      },
    })
    console.log('Admin user created:', admin)
  }

  console.log('Seed completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
