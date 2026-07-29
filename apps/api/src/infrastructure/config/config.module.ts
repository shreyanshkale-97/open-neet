import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import {
  appConfig,
  supabaseConfig,
  redisConfig,
  aiConfig,
  ollamaConfig,
  jwtConfig,
  storageConfig,
  throttleConfig,
  featureFlagsConfig,
} from './configuration';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      load: [
        appConfig,
        supabaseConfig,
        redisConfig,
        aiConfig,
        ollamaConfig,
        jwtConfig,
        storageConfig,
        throttleConfig,
        featureFlagsConfig,
      ],
    }),
  ],
})
export class AppConfigModule {}