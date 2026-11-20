import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateDonorDto } from './dto/update-donor.dto';
import { Role } from '@prisma/client';

@Injectable()
export class DonorsService {
  constructor(private readonly prisma: PrismaService) {}

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

    return user;
  }

  async updateProfile(userId: string, dto: UpdateDonorDto) {
    const existing = await this.prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
    if (!existing || existing.role !== Role.DONOR) {
      throw new UnauthorizedException('Access denied: User is not a registered donor.');
    }

    return this.prisma.user.update({
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

    return {
      totalDonated: user?.totalDonated || 0,
      donationTier: user?.donationTier || 'SUPPORTER',
      totalDonations: donationCount,
      lastDonationDate: user?.lastDonationDate,
    };
  }

  /**
   * Published community announcements and newsletters for registered donor dashboard
   */
  async getNewsletters(userId: string) {
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

    let broadcasts: any[] = [];
    try {
      broadcasts = await this.prisma.$queryRawUnsafe(`
        SELECT * FROM newsletter_broadcasts ORDER BY created_at DESC;
      `);
    } catch (e) {
      broadcasts = [];
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

    return {
      newsletters,
      donorConsent: {
        emailNewsletter: user?.emailNewsletter ?? true,
        email: user?.email,
        fullName: user?.fullName,
        donationTier: user?.donationTier ?? 'SUPPORTER',
      },
    };
  }
}
