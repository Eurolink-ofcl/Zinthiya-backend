import { Controller, Post, Get, Body, Ip } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AdminService } from './admin.service';

@ApiTags('Public Contact Form')
@Controller('contact')
export class ContactController {
  constructor(private readonly adminService: AdminService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a message from the public Contact Us page' })
  async submitContact(
    @Body() body: { fullName: string; phoneNumber?: string; email: string; message: string },
    @Ip() ip: string,
  ) {
    return this.adminService.createContactMessage(body, ip);
  }

  @Post('submit')
  @ApiOperation({ summary: 'Alternative alias for submitting contact message' })
  async submitContactAlias(
    @Body() body: { fullName: string; phoneNumber?: string; email: string; message: string },
    @Ip() ip: string,
  ) {
    return this.adminService.createContactMessage(body, ip);
  }

  @Get('messages')
  @ApiOperation({ summary: 'Get all contact messages' })
  async getMessages() {
    return this.adminService.getContactMessages();
  }
}
