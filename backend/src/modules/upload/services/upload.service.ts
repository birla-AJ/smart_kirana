import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import { PresignUploadDto } from '../dto/presign-upload.dto';
import { PresignedUploadEntity, UploadedFileEntity } from '../entities/upload.entity';

const PRESIGN_EXPIRY_SECONDS = 300;

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly publicBaseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.bucket = this.configService.get<string>('s3.bucket') ?? '';
    this.publicBaseUrl = this.configService.get<string>('s3.publicBaseUrl') ?? '';
    this.s3 = new S3Client({
      region: this.configService.get<string>('s3.region'),
      credentials: {
        accessKeyId: this.configService.get<string>('s3.accessKeyId') ?? '',
        secretAccessKey: this.configService.get<string>('s3.secretAccessKey') ?? '',
      },
    });
  }

  private buildKey(folder: string, fileName: string): string {
    const ext = fileName.includes('.') ? fileName.slice(fileName.lastIndexOf('.')) : '';
    return `${folder}/${Date.now()}-${randomUUID()}${ext}`;
  }

  /**
   * Returns a short-lived presigned PUT URL so the client (web/mobile)
   * uploads the file bytes directly to S3, without the API server ever
   * having to hold the file in memory. Preferred path for product
   * images, banners, etc. from the admin panel.
   */
  async getPresignedUploadUrl(dto: PresignUploadDto): Promise<PresignedUploadEntity> {
    const key = this.buildKey(dto.folder, dto.fileName);

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: dto.contentType,
    });

    const uploadUrl = await getSignedUrl(this.s3, command, { expiresIn: PRESIGN_EXPIRY_SECONDS });

    return {
      uploadUrl,
      fileUrl: `${this.publicBaseUrl}/${key}`,
      key,
      expiresInSeconds: PRESIGN_EXPIRY_SECONDS,
    };
  }

  /**
   * Direct server-side upload path for smaller files (e.g. an admin
   * uploading a single image through a plain HTML form) where a
   * presigned-URL round trip isn't worth the extra client complexity.
   */
  async uploadBuffer(
    folder: string,
    fileName: string,
    contentType: string,
    buffer: Buffer,
  ): Promise<UploadedFileEntity> {
    const key = this.buildKey(folder, fileName);

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      }),
    );

    return { url: `${this.publicBaseUrl}/${key}`, key };
  }
}
