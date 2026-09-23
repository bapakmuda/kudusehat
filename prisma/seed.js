const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = [
    { username: 'daddy', password: 'rysh18!', role: 'parent' },
    { username: 'moms', password: 'rysh18', role: 'parent' }
  ];

  for (const u of users) {
    const exists = await prisma.user.findUnique({ where: { username: u.username } });
    if (!exists) {
      await prisma.user.create({
        data: {
          username: u.username,
          password: u.password,
          role: u.role,
        }
      });
      console.log(`User ${u.username} created.`);
    } else {
      console.log(`User ${u.username} already exists.`);
    }
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
