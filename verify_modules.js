const modules = [
  '@nestjs/common',
  '@nestjs/core',
  '@nestjs/platform-express',
  '@nestjs/swagger',
  '@nestjs/passport',
  '@nestjs/jwt',
  '@nestjs/bullmq',
  '@nestjs/cache-manager',
  '@nestjs/config',
  'prisma',
  '@prisma/client',
  'ioredis',
  'bullmq',
  'passport',
  'passport-jwt',
  'passport-local',
  'swagger-ui-express',
  'jest',
  'pino',
  'nestjs-pino',
  'bcryptjs',
  'class-validator',
  'class-transformer',
  'rxjs',
  'reflect-metadata',
  'typescript'
];

console.log('Testing module imports in backend/node_modules:');
let passed = 0;
let failed = [];

for (const m of modules) {
  try {
    require(m);
    passed++;
    console.log(`[OK] ${m}`);
  } catch (err) {
    failed.push({ module: m, error: err.message });
    console.log(`[FAIL] ${m}: ${err.message}`);
  }
}

console.log(`\nResults: ${passed}/${modules.length} passed.`);

