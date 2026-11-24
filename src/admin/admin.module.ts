import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { CommunicationsController } from './communications.controller';
import { NewsletterController } from './newsletter.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AdminController, CommunicationsController, NewsletterController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}


