import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface UploadFileOptions {
  bucket?: string;
  folder?: string;
  filename?: string;
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private supabaseUrl: string;
  private serviceRoleKey: string;
  private defaultBucket: string;
  private maxSizeBytes: number;

  constructor(private config: ConfigService) {
    this.supabaseUrl = this.config.get<string>('supabase.url') ?? '';
    this.serviceRoleKey = this.config.get<string>('supabase.serviceRoleKey') ?? '';
    this.defaultBucket = this.config.get<string>('storage.bucket') ?? 'neet-ai-platform';
    const maxMb = this.config.get<number>('storage.maxUploadSizeMb') ?? 20;
    this.maxSizeBytes = maxMb * 1024 * 1024;
  }

  async uploadFile(buffer: Buffer, originalName: string, mimeType: string, options?: UploadFileOptions) {
    // 1. Validate size
    if (buffer.length > this.maxSizeBytes) {
      throw new BadRequestException(`File size exceeds maximum limit of ${this.maxSizeBytes / (1024 * 1024)}MB`);
    }

    // 2. Validate MIME type
    const allowedMimeTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'];
    if (!allowedMimeTypes.includes(mimeType)) {
      throw new BadRequestException(`Invalid file type '${mimeType}'. Allowed types: PDF, PNG, JPG, WebP.`);
    }

    const bucket = options?.bucket || this.defaultBucket;
    const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const folder = options?.folder ? `${options.folder}/` : '';
    const key = `${folder}${Date.now()}_${sanitizedName}`;

    if (!this.supabaseUrl || !this.serviceRoleKey) {
      this.logger.warn('Supabase storage credentials missing. Returning local mock storage path.');
      return {
        key,
        bucket,
        storagePath: `mock/${bucket}/${key}`,
        publicUrl: `http://localhost:3001/mock-storage/${key}`,
      };
    }

    try {
      const uploadUrl = `${this.supabaseUrl}/storage/v1/object/${bucket}/${key}`;
      await axios.post(uploadUrl, buffer, {
        headers: {
          Authorization: `Bearer ${this.serviceRoleKey}`,
          apikey: this.serviceRoleKey,
          'Content-Type': mimeType,
        },
      });

      return {
        key,
        bucket,
        storagePath: `${bucket}/${key}`,
        publicUrl: `${this.supabaseUrl}/storage/v1/object/public/${bucket}/${key}`,
      };
    } catch (err: any) {
      this.logger.error(`Storage upload error: ${err?.response?.data?.message || err.message}`);
      throw new BadRequestException('Failed to upload file to storage');
    }
  }

  async getSignedUrl(key: string, bucket?: string, expiresInSeconds = 3600) {
    const targetBucket = bucket || this.defaultBucket;
    if (!this.supabaseUrl || !this.serviceRoleKey) {
      return { signedUrl: `http://localhost:3001/mock-storage/${key}?token=mock` };
    }

    try {
      const res = await axios.post(
        `${this.supabaseUrl}/storage/v1/object/sign/${targetBucket}/${key}`,
        { expiresIn: expiresInSeconds },
        {
          headers: {
            Authorization: `Bearer ${this.serviceRoleKey}`,
            apikey: this.serviceRoleKey,
            'Content-Type': 'application/json',
          },
        }
      );
      return {
        signedUrl: `${this.supabaseUrl}/storage/v1${res.data.signedURL}`,
      };
    } catch {
      return { signedUrl: `${this.supabaseUrl}/storage/v1/object/public/${targetBucket}/${key}` };
    }
  }
}