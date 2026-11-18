import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateDonorDto } from './dto/update-donor.dto';

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

    return user;
  }

  async updateProfile(userId: string, dto: UpdateDonorDto) {
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
        totalDonated: true,
        donationTier: true,
        lastDonationDate: true,
      },
    });

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
}
