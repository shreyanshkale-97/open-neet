import { SetMetadata } from '@nestjs/common';

export const AUDIT_LOG_KEY = 'AUDIT_LOG_ACTION';
export const AuditLog = (action: string) => SetMetadata(AUDIT_LOG_KEY, action);