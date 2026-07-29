import { Controller, Get, Patch, Body, UseGuards, Version } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Profile } from '@prisma/client';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @Version('1')
  async getMe(@GetUser() user: Profile) {
    return this.usersService.getProfile(user.id, user);
  }

  @Patch('me')
  @Version('1')
  async updateMe(@GetUser('id') userId: string, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(userId, dto);
  }

  @Get('me/dashboard')
  @Version('1')
  async getDashboard(@GetUser('id') userId: string) {
    return this.usersService.getDashboard(userId);
  }

  @Get('me/history')
  @Version('1')
  async getHistory(@GetUser('id') userId: string) {
    return this.usersService.getHistory(userId);
  }
}