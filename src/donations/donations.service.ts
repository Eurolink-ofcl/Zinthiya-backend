import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDonationDto } from './dto/create-donation.dto';
import { DonationTier } from '@prisma/client';

@Injectable()
export class DonationsService {
  constructor(private readonly prisma: PrismaService) {}

  private async calculateTier(total: number): Promise<DonationTier> {
    try {
      const rows: any[] = await this.prisma.$queryRawUnsafe(`
        SELECT value FROM system_settings WHERE key = 'main_config' LIMIT 1;
      `);
      if (rows && rows.length > 0 && rows[0].value) {
        const val = typeof rows[0].value === 'string' ? JSON.parse(rows[0].value) : rows[0].value;
        const tiers = Array.isArray(val?.donationTiers) ? val.donationTiers : [];
        if (tiers.length > 0) {
          const sorted = [...tiers].sort((a: any, b: any) => Number(b.minAmount) - Number(a.minAmount));
          const matched = sorted.find((t: any) => total >= Number(t.minAmount));
          if (matched) {
            const upper = (matched.id || matched.name || '').toUpperCase();
            if (upper in DonationTier) {
              return upper as DonationTier;
            }
            return DonationTier.SUPPORTER;
          }
          const lowest = sorted[sorted.length - 1];
          const lowestUpper = (lowest?.id || lowest?.name || '').toUpperCase();
          if (lowestUpper in DonationTier) return lowestUpper as DonationTier;
          return DonationTier.SUPPORTER;
        }
      }
    } catch (e: any) {
      console.warn('calculateTier db query warning:', e?.message || e);
    }

    return DonationTier.SUPPORTER;
  }

  async create(dto: CreateDonationDto, userId?: string) {
    if (!dto.amount || dto.amount <= 0) {
      throw new BadRequestException('Donation amount must be greater than zero.');
    }

    let donorName = dto.donorName;
    let donorEmail = dto.donorEmail;

    if (userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      if (user) {
        if (!donorName) donorName = user.fullName;
        if (!donorEmail) donorEmail = user.email;
      }
    }

    const ref = dto.reference || `ZT-${Date.now().toString(36).toUpperCase()}`;
    const donationNotes = dto.notes || (dto.frequency ? `Recurring frequency: ${dto.frequency}` : null);

    const donation = await this.prisma.donation.create({
      data: {
        amount: dto.amount,
        type: dto.type || 'ONE_OFF',
        giftAid: false,
        paymentMethod: dto.paymentMethod || 'Debit/Credit Card',
        userId: userId || null,
        campaignId: dto.campaignId || null,
        donorName: donorName || null,
        donorEmail: donorEmail || null,
        status: 'COMPLETED',
        reference: ref,
        notes: donationNotes,
      },
      include: {
        campaign: {
          select: {
            id: true,
            title: true,
            targetAmount: true,
            raisedAmount: true,
          },
        },
      },
    });

    // Update campaign raisedAmount
    if (dto.campaignId) {
      await this.prisma.campaign.update({
        where: { id: dto.campaignId },
        data: {
          raisedAmount: {
            increment: dto.amount,
          },
        },
      });
    }

    // If made by a registered donor, update their CRM stats (totalDonated & donationTier)
    if (userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (user) {
        const newTotal = Number(user.totalDonated) + Number(dto.amount);
        const newTier = await this.calculateTier(newTotal);

        await this.prisma.user.update({
          where: { id: userId },
          data: {
            totalDonated: newTotal,
            donationTier: newTier,
            lastDonationDate: new Date(),
          },
        });
      }
    }

    return {
      message: 'Donation received successfully. Thank you for supporting The Zinthiya Trust!',
      donation,
    };
  }

  async getMyDonations(userId: string) {
    return this.prisma.donation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        campaign: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }

  async getRecentDonations() {
    return this.prisma.donation.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        amount: true,
        type: true,
        giftAid: true,
        reference: true,
        createdAt: true,
        campaign: {
          select: {
            title: true,
          },
        },
      },
    });
  }
}
