import { Controller, Get, Patch, Param, Query, Body, UseGuards, Version, UseInterceptors } from '@nestjs/common';
import { AdminService } from './admin.service';
import { UpdateUserRoleDto, SuspendUserDto, UpdateFeatureFlagDto } from './dto/admin.dto';
import { JwtAuthGuard } from '../core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../core/auth/guards/roles.guard';
import { Roles } from '../core/auth/decorators/roles.decorator';
import { GetUser } from '../core/auth/decorators/get-user.decorator';
import { AuditInterceptor } from '../infrastructure/audit/audit.interceptor';
import { AuditLog } from '../infrastructure/audit/audit-log.decorator';
import { Role, FeatureFlag } from '@neet-ai/shared/types';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@UseInterceptors(AuditInterceptor)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('analytics')
  @Version('1')
  async getAnalytics() {
    return this.adminService.getAnalytics();
  }

  @Get('users')
  @Version('1')
  async getUsers(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string
  ) {
    return this.adminService.getUsers(
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
      search
    );
  }

  @Patch('users/:id/role')
  @Version('1')
  @AuditLog('ADMIN_USER_ROLE_UPDATE')
  async updateUserRole(@Param('id') id: string, @Body() dto: UpdateUserRoleDto) {
    return this.adminService.updateUserRole(id, dto);
  }

  @Patch('users/:id/suspend')
  @Version('1')
  @AuditLog('ADMIN_USER_SUSPEND')
  async suspendUser(@Param('id') id: string, @Body() dto: SuspendUserDto) {
    return this.adminService.suspendUser(id, dto);
  }

  @Get('feature-flags')
  @Version('1')
  async getFeatureFlags() {
    return this.adminService.getFeatureFlags();
  }

  @Patch('feature-flags/:flag')
  @Version('1')
  @AuditLog('ADMIN_FEATURE_FLAG_UPDATE')
  async updateFeatureFlag(
    @Param('flag') flag: FeatureFlag,
    @Body() dto: UpdateFeatureFlagDto,
    @GetUser('id') adminId: string
  ) {
    return this.adminService.updateFeatureFlag(flag, dto, adminId);
  }

  @Get('audit-logs')
  @Version('1')
  async getAuditLogs(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.adminService.getAuditLogs(
      page ? Number(page) : 1,
      limit ? Number(limit) : 20
    );
  }
}