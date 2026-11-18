import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DonationsService } from './donations.service';
import { CreateDonationDto } from './dto/create-donation.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Donations')
@Controller('donations')
export class DonationsController {
  constructor(private readonly donationsService: DonationsService) {}

  @Post()
  @ApiOperation({ summary: 'Process a donation (guest or registered)' })
  @ApiResponse({ status: 201, description: 'Donation recorded' })
  async create(@Body() dto: CreateDonationDto) {
    return this.donationsService.create(dto);
  }

  @Post('donor')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Make a donation as logged-in donor (updates donor tier)' })
  async createAsDonor(@Body() dto: CreateDonationDto, @Request() req: any) {
    return this.donationsService.create(dto, req.user.id);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get donation history for logged-in donor' })
  async getMyDonations(@Request() req: any) {
    return this.donationsService.getMyDonations(req.user.id);
  }

  @Get('recent')
  @ApiOperation({ summary: 'Get recent public donations ticker' })
  async getRecent() {
    return this.donationsService.getRecentDonations();
  }
}
