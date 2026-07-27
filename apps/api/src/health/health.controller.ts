import { Controller, Get, Version } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  @Version('1')
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'neet-ai-api',
      version: 'v1',
    };
  }
}