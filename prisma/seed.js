const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Zinthiya Trust database...');

  // 1. Create or update Default Admin
  const adminPassword = await bcrypt.hash('AdminPassword123!', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@zinthiyatrust.org' },
    update: {
      password: adminPassword,
      role: 'ADMIN',
      fullName: 'Zinthiya Trust Administrator',
    },
    create: {
      email: 'admin@zinthiyatrust.org',
      password: adminPassword,
      fullName: 'Zinthiya Trust Administrator',
      role: 'ADMIN',
      generalConsent: true,
      donationTier: 'PLATINUM',
    },
  });
  console.log('✔ Admin user ready:', admin.email);

  // 2. Only create initial Casework Staff if no staff exists at all
  const existingStaffCount = await prisma.user.count({ where: { role: 'STAFF' } });
  if (existingStaffCount === 0) {
    const staffPassword = await bcrypt.hash('StaffZinthiya2026!', 10);
    const staff = await prisma.user.create({
      data: {
        email: 'staff@zinthiyatrust.org',
        password: staffPassword,
        fullName: 'Support Staff',
        role: 'STAFF',
        staffRole: 'CASEWORKER',
        jobTitle: 'Crisis Advocate',
        department: 'Crisis & Hardship Support',
        phoneNumber: '0116 254 5168',
        generalConsent: true,
        donationTier: 'SUPPORTER',
      },
    });
    console.log('✔ Initial staff ready:', staff.email);
  }

  // 3. Create Default Support Categories with Funding Targets
  const categories = [
    {
      name: 'Emergency Food & Nutrition',
      description: 'Emergency food parcels, nutritional staples, infant formula, and baby care packs for families in crisis.',
      targetAmount: 15000,
    },
    {
      name: 'Energy & Fuel Poverty Alleviation',
      description: 'Prepayment electricity & gas meter top-ups, winter fuel debt alleviation, and warm home vouchers.',
      targetAmount: 12000,
    },
    {
      name: 'Medical Assistance',
      description: 'Prescription charges, specialist consultations, emergency dental care, and mobility disability aids.',
      targetAmount: 10000,
    },
    {
      name: 'Women & Children Refuge Support',
      description: 'Emergency safe shelter relocation, personal care packs, and trauma counseling for domestic abuse survivors.',
      targetAmount: 20000,
    },
  ];

  for (const cat of categories) {
    const existing = await prisma.supportCategory.findFirst({ where: { name: cat.name } });
    if (!existing) {
      await prisma.supportCategory.create({
        data: {
          name: cat.name,
          description: cat.description,
          targetFundingRequired: cat.targetAmount,
          status: 'ACTIVE',
        },
      });
      console.log(`✔ Created Support Category: ${cat.name}`);
    }
  }

  // 4. Create Default Campaigns
  const campaigns = [
    {
      title: 'Winter Warmth & Fuel Relief Appeal',
      description: 'Direct prepayment fuel vouchers and warm packs to keep vulnerable elderly and struggling families warm this winter.',
      targetAmount: 25000,
      raisedAmount: 4250,
      active: true,
      imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80',
    },
    {
      title: 'Emergency Food Parcels for Struggling Families',
      description: 'Nutritional food parcels, baby staples, and essentials for families affected by the cost-of-living crisis across Leicestershire.',
      targetAmount: 15000,
      raisedAmount: 6180,
      active: true,
      imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80',
    },
  ];

  for (const camp of campaigns) {
    const existing = await prisma.campaign.findFirst({ where: { title: camp.title } });
    if (!existing) {
      await prisma.campaign.create({
        data: camp,
      });
      console.log(`✔ Created Campaign: ${camp.title}`);
    }
  }

  console.log('\nDatabase seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
