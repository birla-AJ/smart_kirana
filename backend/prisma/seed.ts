import { PrismaClient, UserRoleType } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding roles...');

  const [superAdminRole] = await Promise.all([
    prisma.role.upsert({
      where: { name: UserRoleType.SUPER_ADMIN },
      update: {},
      create: { name: UserRoleType.SUPER_ADMIN, description: 'Full system access' },
    }),
    prisma.role.upsert({
      where: { name: UserRoleType.ADMIN },
      update: {},
      create: { name: UserRoleType.ADMIN, description: 'Store operations access' },
    }),
    prisma.role.upsert({
      where: { name: UserRoleType.CUSTOMER },
      update: {},
      create: { name: UserRoleType.CUSTOMER, description: 'Shopping customer' },
    }),
  ]);

  console.log('Seeding default super admin user...');

  const superAdminEmail = process.env.SEED_SUPER_ADMIN_EMAIL ?? 'superadmin@nimadkirana.com';
  const superAdminPassword = process.env.SEED_SUPER_ADMIN_PASSWORD ?? 'SuperAdmin@123';
  const hashedPassword = await bcrypt.hash(superAdminPassword, 10);

  const superAdminUser = await prisma.user.upsert({
    where: { email: superAdminEmail },
    update: {},
    create: {
      firstName: 'Super',
      lastName: 'Admin',
      email: superAdminEmail,
      mobile: process.env.SEED_SUPER_ADMIN_MOBILE ?? '9999999999',
      password: hashedPassword,
      status: 'ACTIVE',
      mobileVerified: true,
      emailVerified: true,
      roleId: superAdminRole.id,
    },
  });

  await prisma.admin.upsert({
    where: { userId: superAdminUser.id },
    update: {},
    create: {
      userId: superAdminUser.id,
      designation: 'Super Administrator',
      employeeCode: 'NK-SA-001',
    },
  });

  console.log('Seed completed.');
  console.log(`Super admin login -> email: ${superAdminEmail} | password: ${superAdminPassword}`);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
