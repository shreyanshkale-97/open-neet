import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../infrastructure/database/prisma.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private config: ConfigService,
    private prisma: PrismaService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const token = authHeader.split(' ')[1];

    try {
      const base64Url = token.split('.')[1];
      if (!base64Url) {
        throw new UnauthorizedException('Malformed token');
      }
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(jsonPayload);

      const authUserId = payload.sub || payload.id;
      if (!authUserId) {
        throw new UnauthorizedException('Invalid token payload');
      }

      const profile = await this.prisma.profile.findUnique({
        where: { authUserId },
      });

      if (!profile) {
        throw new UnauthorizedException('User profile not found');
      }

      if (profile.isSuspended) {
        throw new UnauthorizedException('Your account has been suspended. Please contact support.');
      }

      request.user = profile;
      return true;
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      throw new UnauthorizedException('Invalid token or user session expired');
    }
  }
}