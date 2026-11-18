const testModules = [
  // Core
  '@nestjs/common', '@nestjs/core', '@nestjs/platform-express', '@nestjs/config',
  'reflect-metadata', 'rxjs',
  // Database
  '@prisma/client',
  // Performance
  'ioredis', '@nestjs/cache-manager', 'cache-manager',
  // Background processing
  'bullmq', '@nestjs/bullmq',
  // Authentication
  'passport', '@nestjs/passport', 'passport-jwt', 'passport-local', '@nestjs/jwt', 'bcryptjs',
  // Documentation
  '@nestjs/swagger', 'swagger-ui-express',
  // Quality
  '@nestjs/testing', 'pino', 'nestjs-pino', 'pino-http', 'pino-pretty'
];

let passCount = 0;
for (const mod of testModules) {
  try {
    require(mod);
    console.log('[PASS]', mod);
    passCount++;
  } catch (e) {
    console.error('[FAIL]', mod, '->', e.message);
  }
}

console.log('\nResult: ' + passCount + ' / ' + testModules.length + ' passed.');
if (passCount === testModules.length) {
  console.log('SUCCESS: All backend dependencies are 100% installed and operational!');
}

