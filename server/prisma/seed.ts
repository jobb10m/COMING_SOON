import { PrismaClient, Role, PlanDuration } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // --- Admin ---
  const admin = await prisma.user.upsert({
    where: { email: 'admin@gym.com' },
    update: {},
    create: {
      email: 'admin@gym.com',
      password: passwordHash,
      role: Role.ADMIN,
    },
  });

  // --- Receptionist ---
  await prisma.user.upsert({
    where: { email: 'reception@gym.com' },
    update: {},
    create: {
      email: 'reception@gym.com',
      password: passwordHash,
      role: Role.RECEPTIONIST,
    },
  });

  // --- Trainer ---
  const trainerUser = await prisma.user.upsert({
    where: { email: 'trainer@gym.com' },
    update: {},
    create: {
      email: 'trainer@gym.com',
      password: passwordHash,
      role: Role.TRAINER,
    },
  });

  const trainer = await prisma.trainer.upsert({
    where: { userId: trainerUser.id },
    update: {},
    create: {
      userId: trainerUser.id,
      firstName: 'Abel',
      lastName: 'Tesfaye',
      phone: '+251911000000',
      experienceYears: 5,
      certifications: 'NASM-CPT',
    },
  });

  // --- Member ---
  const memberUser = await prisma.user.upsert({
    where: { email: 'member@gym.com' },
    update: {},
    create: {
      email: 'member@gym.com',
      password: passwordHash,
      role: Role.MEMBER,
    },
  });

  const member = await prisma.member.upsert({
    where: { userId: memberUser.id },
    update: {},
    create: {
      userId: memberUser.id,
      firstName: 'Sara',
      lastName: 'Bekele',
      phone: '+251922000000',
      trainerId: trainer.id,
    },
  });

  // --- Membership Plans ---
  const plans = [
    { name: 'Daily Pass', duration: PlanDuration.DAILY, durationDays: 1, price: 100 },
    { name: 'Weekly', duration: PlanDuration.WEEKLY, durationDays: 7, price: 500 },
    { name: 'Monthly', duration: PlanDuration.MONTHLY, durationDays: 30, price: 1500 },
    { name: 'Quarterly', duration: PlanDuration.QUARTERLY, durationDays: 90, price: 4000 },
    { name: 'Six Months', duration: PlanDuration.SIX_MONTHS, durationDays: 180, price: 7500 },
    { name: 'Annual', duration: PlanDuration.ANNUAL, durationDays: 365, price: 14000 },
  ];

  for (const p of plans) {
    const existing = await prisma.membershipPlan.findFirst({ where: { name: p.name } });
    if (!existing) {
      await prisma.membershipPlan.create({ data: p });
    }
  }

  const monthlyPlan = await prisma.membershipPlan.findFirst({ where: { name: 'Monthly' } });

  if (monthlyPlan) {
    const existingMembership = await prisma.membership.findFirst({ where: { memberId: member.id } });
    if (!existingMembership) {
      await prisma.membership.create({
        data: {
          memberId: member.id,
          planId: monthlyPlan.id,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });
    }
  }

  // --- Settings ---
  const settingsCount = await prisma.settings.count();
  if (settingsCount === 0) {
    await prisma.settings.create({
      data: { gymName: 'Prime Fitness Gym', currency: 'ETB' },
    });
  }

  console.log('Seed complete.');
  console.log('Login with: admin@gym.com / reception@gym.com / trainer@gym.com / member@gym.com');
  console.log('Password: Password123!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
