import { Injectable, BadRequestException, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import axios from 'axios';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private supabaseUrl: string;
  private supabaseAnonKey: string;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService
  ) {
    this.supabaseUrl = this.config.get<string>('supabase.url') ?? '';
    this.supabaseAnonKey = this.config.get<string>('supabase.anonKey') ?? '';
  }

  async register(dto: RegisterDto) {
    // 1. Check if user profile already exists
    const existing = await this.prisma.profile.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (existing) {
      throw new BadRequestException('An account with this email address already exists.');
    }

    let authUserId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    let accessToken = 'mock-access-token';

    // 2. Register user via Supabase Auth API
    if (this.supabaseUrl && this.supabaseAnonKey) {
      try {
        const response = await axios.post(
          `${this.supabaseUrl}/auth/v1/signup`,
          {
            email: dto.email,
            password: dto.password,
            data: { fullName: dto.fullName },
          },
          {
            headers: {
              apikey: this.supabaseAnonKey,
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.data?.user?.id) {
          authUserId = response.data.user.id;
          accessToken = response.data.access_token || accessToken;
        }
      } catch (err: any) {
        this.logger.error(`Supabase signup error: ${err?.response?.data?.msg || err.message}`);
        // Fallback to local profile creation if Supabase rate limited or misconfigured
      }
    }

    // 3. Create local Profile & StudyStats
    const profile = await this.prisma.profile.create({
      data: {
        authUserId,
        email: dto.email.toLowerCase(),
        fullName: dto.fullName,
        targetNeetYear: dto.targetNeetYear,
        studyStats: {
          create: {
            studyStreakDays: 1,
            totalStudyHours: 0,
            totalTestsTaken: 0,
          },
        },
      },
      include: {
        studyStats: true,
      },
    });

    return {
      profile,
      token: accessToken,
    };
  }

  async login(dto: LoginDto) {
    const profile = await this.prisma.profile.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: { studyStats: true },
    });

    if (!profile) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (profile.isSuspended) {
      throw new UnauthorizedException('Account suspended');
    }

    let token = 'mock-access-token';

    if (this.supabaseUrl && this.supabaseAnonKey) {
      try {
        const response = await axios.post(
          `${this.supabaseUrl}/auth/v1/token?grant_type=password`,
          {
            email: dto.email,
            password: dto.password,
          },
          {
            headers: {
              apikey: this.supabaseAnonKey,
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.data?.access_token) {
          token = response.data.access_token;
        }
      } catch (err: any) {
        this.logger.warn(`Supabase login fallback used: ${err?.response?.data?.error_description || err.message}`);
      }
    }

    return {
      profile,
      token,
    };
  }
}