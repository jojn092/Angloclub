const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const email = 'sultanalmatuly69@gmail.com';
    const password = 'fR9$kT2!Zq7#nV8@Lp4?xW3';

    console.log(`Hashing password for ${email}...`);
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('Upserting user...');
    const user = await prisma.user.upsert({
        where: { email },
        update: {
            role: 'SUPER_ADMIN',
            password: hashedPassword,
            isActive: true
        },
        create: {
            email,
            name: 'Главный Администратор',
            password: hashedPassword,
            role: 'SUPER_ADMIN',
            isActive: true,
            hourlyRate: 0
        }
    });
    console.log('Success! Super Admin User:', user.email, user.role);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => await prisma.$disconnect());
