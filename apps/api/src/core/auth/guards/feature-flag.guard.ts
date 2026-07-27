import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FeatureFlag } from '@neet-ai/shared/types';
import { FeatureFlagsService } from '../../../infrastructure/feature-flags/feature-flags.service';
import { FEATURE_FLAG_KEY } from '../decorators/feature-enabled.decorator';

@Injectable()
export class FeatureFlagGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private featureFlagsService: FeatureFlagsService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredFlag = this.reflector.getAllAndOverride<FeatureFlag>(FEATURE_FLAG_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredFlag) {
      return true;
    }

    const enabled = await this.featureFlagsService.isEnabled(requiredFlag);
    if (!enabled) {
      throw new ForbiddenException(`Feature '${requiredFlag}' is currently disabled.`);
    }

    return true;
  }
}