import { SetMetadata } from '@nestjs/common';
import { FeatureFlag } from '@neet-ai/shared/types';

export const FEATURE_FLAG_KEY = 'feature_flag';
export const FeatureEnabled = (flag: FeatureFlag) => SetMetadata(FEATURE_FLAG_KEY, flag);