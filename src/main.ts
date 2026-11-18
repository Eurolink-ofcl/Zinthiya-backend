import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Increase payload limit to support direct high-res device image uploads
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ limit: '50mb', extended: true }));

  // Enable CORS for frontend clients (supports Vercel, localhost, and custom domains)
  app.enableCors({
    origin: (requestOrigin, callback) => {
      // Allow any origin dynamically (reflects incoming origin to support credentials: true)
      callback(null, requestOrigin || true);
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type,Accept,Authorization,X-Requested-With',
  });

  // Global Input Validation & Transformation for all API endpoints
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // Global API Prefix
  app.setGlobalPrefix('api');

  // Swagger Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('The Zinthiya Trust API')
    .setDescription('Official Backend REST API for The Zinthiya Trust Platform (Web & Mobile Apps: Donor Portal, CRM & Campaigns)')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 5000;
  await app.listen(port);

  console.log(`=======================================================`);
  console.log(`  ZINTHIYA TRUST BACKEND API READY & OPERATIONAL!`);
  console.log(`  Local URL:    http://localhost:${port}/api`);
  console.log(`  Swagger Docs: http://localhost:${port}/api/docs`);
  console.log(`  Health Check: http://localhost:${port}/api/health`);
  console.log(`=======================================================`);
}

bootstrap();
