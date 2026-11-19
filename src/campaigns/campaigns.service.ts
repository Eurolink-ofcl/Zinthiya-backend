import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CampaignsService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    // Only seed default charity campaigns on initial clean database boot.
    // If campaigns have ever been initialized, skip seeding to preserve all admin deletions and customizations.
    try {
      await this.prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS system_settings (
          key VARCHAR(64) PRIMARY KEY,
          value JSONB NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `).catch(() => {});

      const seedRecord: any = await this.prisma.$queryRawUnsafe(`
        SELECT value FROM system_settings WHERE key = 'campaigns_seeded' LIMIT 1;
      `).catch(() => []);

      if (seedRecord && seedRecord.length > 0) {
        // Campaigns have already been initialized previously. Respect admin deletions.
        return;
      }

      const count = await this.prisma.campaign.count();
      if (count === 0) {
        await this.prisma.campaign.createMany({
          data: [
            {
              title: 'Leicester Winter Warmth Relief 2026',
              description: 'Providing emergency warm packs, fuel vouchers, and heated blankets to vulnerable families across Leicestershire facing severe energy poverty during freezing winter months.\n\nKey Objectives:\n• Distribute 350 emergency winter thermal packs containing heavy-grade blankets, thermal flasks, and insulated clothing to elderly and low-income residents.\n• Provide emergency £50 energy top-up vouchers to prevent cold-weather utility disconnection for vulnerable households.\n• Deliver home heat retention assessments and free draft-proofing kits to families with young children in Leicester.\n• Operate emergency cold-weather response hotlines and community check-ins.',
              imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80',
              targetAmount: 25000,
              raisedAmount: 14850,
              active: true,
            },
            {
              title: 'Chapel Cafe Community Kitchen',
              description: 'Subsidised wholesome hot meals, tea, and warm companionship for isolated residents, low-income seniors, and individuals experiencing acute financial hardship.\n\nKey Objectives:\n• Prepare and serve 500+ nutritious, freshly cooked hot meals weekly at our Leicester community cafe.\n• Provide a safe, heated social space to combat social isolation and winter loneliness among vulnerable residents.\n• Distribute emergency take-home pantry food parcels and essential hygiene supplies to families in distress.\n• Offer direct access to welfare rights advisors, energy debt counseling, and volunteer befriending services.',
              imageUrl: 'https://images.unsplash.com/photo-1593113646773-028c64a8f1b8?auto=format&fit=crop&w=1200&q=80',
              targetAmount: 15000,
              raisedAmount: 9200,
              active: true,
            },
            {
              title: 'Women & Families Safety Sanctuary',
              description: 'Emergency refuge support, trauma-informed legal advocacy, translation, and crisis response for domestic abuse survivors and children fleeing violence in Leicester.\n\nKey Objectives:\n• Fund immediate secure refuge accommodation and emergency relocation for women and children escaping domestic abuse.\n• Provide specialist multilingual crisis casework and confidential court advocacy for survivors.\n• Distribute emergency start-up packs with essential toiletries, children\'s clothing, school supplies, and baby essentials.\n• Provide psychological wellbeing sessions and peer support groups to help survivors rebuild independent, safe lives.',
              imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=80',
              targetAmount: 40000,
              raisedAmount: 31400,
              active: true,
            },
          ],
        });
      }

      await this.prisma.$executeRawUnsafe(`
        INSERT INTO system_settings (key, value)
        VALUES ('campaigns_seeded', '{"seeded": true}'::jsonb)
        ON CONFLICT (key) DO UPDATE SET value = '{"seeded": true}'::jsonb;
      `).catch(() => {});
    } catch (e: any) {
      console.warn('CampaignsService onModuleInit warning:', e?.message || e);
    }
  }

  async findAll() {
    return this.prisma.campaign.findMany({
      where: { active: true, archived: false, status: { not: 'ARCHIVED' } },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { donations: true },
        },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.campaign.findUnique({
      where: { id },
      include: {
        donations: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            amount: true,
            createdAt: true,
          },
        },
      },
    });
  }
}
