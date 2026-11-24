import { Controller, Post, Get, Body, Req, Ip } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { Request } from 'express';

@ApiTags('Newsletter & Community Updates')
@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly adminService: AdminService) {}

  @Post('subscribe')
  @ApiOperation({ summary: 'Public newsletter subscription (Landing page banner / footer)' })
  async subscribe(
    @Body() body: { email: string; fullName?: string; source?: string },
    @Ip() ip: string,
  ) {
    return this.adminService.subscribeNewsletter(body, ip);
  }

  @Post('unsubscribe')
  @ApiOperation({ summary: 'Public 1-click newsletter unsubscription' })
  async unsubscribe(@Body() body: { email: string }) {
    return this.adminService.unsubscribeNewsletter(body?.email);
  }

  @Get('subscribers')
  @ApiOperation({ summary: 'Get combined newsletter subscriber metrics and list' })
  async getSubscribers() {
    return this.adminService.getNewsletterMetrics();
  }
}
