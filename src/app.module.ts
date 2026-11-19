import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { DonorsModule } from './donors/donors.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { DonationsModule } from './donations/donations.module';
import { AdminModule } from './admin/admin.module';
import { TranslationModule } from './admin/translation.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    TranslationModule,
    AuthModule,
    DonorsModule,
    CampaignsModule,
    DonationsModule,
    AdminModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
