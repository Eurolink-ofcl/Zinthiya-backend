import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { CommunicationsController } from './communications.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AdminController, CommunicationsController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}


