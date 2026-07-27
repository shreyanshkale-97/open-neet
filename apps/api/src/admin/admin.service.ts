import { Injectable, NotFoundException } from '@nestjs/common';
import { AdminRepository } from './admin.repository';
import { FeatureFlagsService } from '../infrastructure/feature-flags/feature-flags.service';
import { UpdateUserRoleDto, SuspendUserDto, UpdateFeatureFlagDto } from './dto/admin.dto';
import { Role, FeatureFlag } from '@neet-ai/shared/types';

@Injectable()
export class AdminService {
  constructor(
    private adminRepo: AdminRepository,
    private featureFlagsService: FeatureFlagsService
  ) {}

  async getAnalytics() {
    return this.adminRepo.getAnalyticsStats();
  }

  async getUsers(page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;
    const { total, users } = await this.adminRepo.getUsers(skip, limit, search);
    return {
      users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateUserRole(userId: string, dto: UpdateUserRoleDto) {
    return this.adminRepo.updateUserRole(userId, dto.role as unknown as any);
  }

  async suspendUser(userId: string, dto: SuspendUserDto) {
    return this.adminRepo.updateUserSuspension(userId, dto.isSuspended);
  }

  async getFeatureFlags() {
    return this.featureFlagsService.getAllFlags();
  }

  async updateFeatureFlag(flag: FeatureFlag, dto: UpdateFeatureFlagDto, adminId: string) {
    await this.featureFlagsService.setFlag(flag, dto.enabled, adminId);
    return { flag, enabled: dto.enabled };
  }

  async getAuditLogs(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const { total, logs } = await this.adminRepo.getAuditLogs(skip, limit);
    return {
      logs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}