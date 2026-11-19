import { Controller, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
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

  @Get('newsletters')
  @ApiOperation({ summary: 'Get published community announcements and newsletters for donor' })
  async getNewsletters(@Request() req: any) {
    return this.donorsService.getNewsletters(req.user.id);
  }
}
