import { Controller, Post, Get, Param, UseGuards, Version, HttpCode, HttpStatus } from '@nestjs/common';
import { StorageService } from './storage.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('storage')
@UseGuards(JwtAuthGuard)
export class StorageController {
  constructor(private storageService: StorageService) {}

  @Get('signed-url/:key')
  @Version('1')
  async getSignedUrl(@Param('key') key: string) {
    return this.storageService.getSignedUrl(key);
  }
}