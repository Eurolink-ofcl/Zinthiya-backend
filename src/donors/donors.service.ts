import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateDonorDto } from './dto/update-donor.dto';
import { Role, DonationTier } from '@prisma/client';

@Injectable()
export class DonorsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Retrieves the admin-configured giving tiers from system settings.
   */
  async getConfiguredTiers(): Promise<any[]> {
    try {
      const rows: any[] = await this.prisma.$queryRawUnsafe(`
        SELECT value FROM system_settings WHERE key = 'main_config' LIMIT 1;
      `);
      if (rows && rows.length > 0 && rows[0].value) {
        const val = typeof rows[0].value === 'string' ? JSON.parse(rows[0].value) : rows[0].value;
        if (Array.isArray(val?.donationTiers) && val.donationTiers.length > 0) {
          return val.donationTiers;
        }
      }
    } catch (e: any) {
      console.warn('getConfiguredTiers db error:', e?.message || e);
    }
    return [
      { id: 'SUPPORTER', name: 'Supporter', minAmount: 0, color: 'slate', description: 'General supporters' },
    ];
  }

  /**
   * Evaluates the donor's giving tier dynamically based on their total donated amount
   * and the admin-configured tier thresholds.
   */
  async resolveTierForTotal(totalAmount: number, userTier?: string) {
    const tiers = await this.getConfiguredTiers();
    const sorted = [...tiers].sort((a: any, b: any) => Number(b.minAmount) - Number(a.minAmount));
    const matched = sorted.find((t: any) => Number(totalAmount) >= Number(t.minAmount));

    let tierName = 'Supporter';
    let tierColor = 'slate';
    let tierId = 'SUPPORTER';

    if (matched) {
      tierName = matched.name;
      tierColor = matched.color || 'slate';
      tierId = matched.id || matched.name;
    } else if (sorted.length > 0) {
      const lowest = sorted[sorted.length - 1];
      tierName = lowest.name;
      tierColor = lowest.color || 'slate';
      tierId = lowest.id || lowest.name;
    }

    return {
      tierId,
      tierName,
      tierColor,
      configuredTiers: sorted,
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        phoneNumber: true,
        address: true,
        townCity: true,
        postcode: true,
        country: true,
        role: true,
        generalConsent: true,
        emailNewsletter: true,
        smsAlerts: true,
        postalUpdates: true,
        totalDonated: true,
        donationTier: true,
        lastDonationDate: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Donor not found');
    }

    if (user.role !== Role.DONOR) {
      throw new UnauthorizedException('Access denied: User is not a registered donor.');
    }

    const tierInfo = await this.resolveTierForTotal(Number(user.totalDonated || 0), user.donationTier);

    return {
      ...user,
      donationTier: tierInfo.tierName,
      tierName: tierInfo.tierName,
      tierColor: tierInfo.tierColor,
      configuredTiers: tierInfo.configuredTiers,
    };
  }

  async updateProfile(userId: string, dto: UpdateDonorDto) {
    const existing = await this.prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
    if (!existing || existing.role !== Role.DONOR) {
      throw new UnauthorizedException('Access denied: User is not a registered donor.');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: {
        id: true,
        email: true,
        fullName: true,
        phoneNumber: true,
        address: true,
        townCity: true,
        postcode: true,
        country: true,
        generalConsent: true,
        emailNewsletter: true,
        smsAlerts: true,
        postalUpdates: true,
        totalDonated: true,
        donationTier: true,
      },
    });

    const tierInfo = await this.resolveTierForTotal(Number(updated.totalDonated || 0), updated.donationTier);

    return {
      ...updated,
      donationTier: tierInfo.tierName,
      tierName: tierInfo.tierName,
      tierColor: tierInfo.tierColor,
      configuredTiers: tierInfo.configuredTiers,
    };
  }

  async getStats(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true,
        totalDonated: true,
        donationTier: true,
        lastDonationDate: true,
      },
    });

    if (!user || user.role !== Role.DONOR) {
      throw new UnauthorizedException('Access denied: User is not a registered donor.');
    }

    const donationCount = await this.prisma.donation.count({
      where: { userId },
    });

    const tierInfo = await this.resolveTierForTotal(Number(user?.totalDonated || 0), user?.donationTier);

    // If the database has an outdated enum like GOLD, heal it in the background if it matches a valid enum
    if (tierInfo.tierId in DonationTier || tierInfo.tierName.toUpperCase() in DonationTier) {
      const enumVal = ((tierInfo.tierId in DonationTier ? tierInfo.tierId : tierInfo.tierName.toUpperCase())) as DonationTier;
      if (user.donationTier !== enumVal) {
        await this.prisma.user.update({
          where: { id: userId },
          data: { donationTier: enumVal },
        }).catch(() => {});
      }
    }

    return {
      totalDonated: user?.totalDonated || 0,
      donationTier: tierInfo.tierName,
      tierName: tierInfo.tierName,
      tierColor: tierInfo.tierColor,
      configuredTiers: tierInfo.configuredTiers,
      totalDonations: donationCount,
      lastDonationDate: user?.lastDonationDate,
    };
  }

  /**
   * Published community announcements and newsletters for registered donor dashboard
   */
  async getNewsletters(userId: string, page?: number, limit?: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        emailNewsletter: true,
        donationTier: true,
        role: true,
      },
    });

    if (!user || user.role !== Role.DONOR) {
      throw new UnauthorizedException('Access denied: User is not a registered donor.');
    }

    const isPaginated = page !== undefined || limit !== undefined;
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Math.min(100, Number(limit) || 10));
    const offset = (pageNum - 1) * limitNum;

    let broadcasts: any[] = [];
    let totalCount = 0;

    try {
      if (isPaginated) {
        const [rows, countRes] = (await Promise.all([
          this.prisma.$queryRawUnsafe<any[]>(`
            SELECT * FROM newsletter_broadcasts ORDER BY created_at DESC LIMIT ${limitNum} OFFSET ${offset};
          `),
          this.prisma.$queryRawUnsafe<any[]>(`
            SELECT COUNT(*)::int as count FROM newsletter_broadcasts;
          `),
        ])) as [any[], any[]];
        broadcasts = rows || [];
        totalCount = countRes && countRes[0] ? Number(countRes[0].count) : 0;
      } else {
        broadcasts = (await this.prisma.$queryRawUnsafe<any[]>(`
          SELECT * FROM newsletter_broadcasts ORDER BY created_at DESC;
        `)) || [];
        totalCount = broadcasts ? broadcasts.length : 0;
      }
    } catch (e) {
      broadcasts = [];
      totalCount = 0;
    }

    const newsletters = (broadcasts || []).map((b) => ({
      id: b.id,
      subject: b.subject,
      content: b.content,
      channel: b.channel || 'EMAIL',
      targetType: b.target_type || b.targetType || 'GROUPS',
      targetGroups: b.target_groups || b.targetGroups,
      targetTiers: b.target_tiers || b.targetTiers,
      authorName: b.author_name || b.authorName || 'Zinthiya Trust Executive Office',
      createdAt: b.created_at || b.createdAt,
      recipientsCount: Number(b.recipients_count ?? b.eligible_count ?? 0),
    }));

    const totalPages = Math.ceil(totalCount / limitNum) || 1;

    return {
      newsletters,
      data: newsletters,
      donorConsent: {
        emailNewsletter: user?.emailNewsletter ?? true,
        email: user?.email,
        fullName: user?.fullName,
        donationTier: user?.donationTier ?? 'SUPPORTER',
      },
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPreviousPage: pageNum > 1,
      },
    };
  }
}
