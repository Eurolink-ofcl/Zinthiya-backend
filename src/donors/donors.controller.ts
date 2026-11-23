import { Controller, Get, Put, Body, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DonorsService } from './donors.service';
import { UpdateDonorDto } from './dto/update-donor.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Donor Portal')
@Controller('donors')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DonorsController {
  constructor(private readonly donorsService: DonorsService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get donor profile with consent and metrics' })
  async getProfile(@Request() req: any) {
    return this.donorsService.getProfile(req.user.id);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update donor contact details & communication preferences' })
  async updateProfile(@Request() req: any, @Body() dto: UpdateDonorDto) {
    return this.donorsService.updateProfile(req.user.id, dto);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get donor tier and giving summary' })
  async getStats(@Request() req: any) {
    return this.donorsService.getStats(req.user.id);
  }

  @Get('giving-tiers')
  @ApiOperation({ summary: 'Get current admin-configured giving tiers and thresholds' })
  async getGivingTiers() {
    return this.donorsService.getConfiguredTiers();
  }

  @Get('newsletters')
  @ApiOperation({ summary: 'Get published community announcements and newsletters for donor with optional pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (1-based)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page' })
  async getNewsletters(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page !== undefined ? parseInt(page, 10) : undefined;
    const limitNum = limit !== undefined ? parseInt(limit, 10) : undefined;
    return this.donorsService.getNewsletters(req.user.id, pageNum, limitNum);
  }
}
