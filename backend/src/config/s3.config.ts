import { registerAs } from '@nestjs/config';

export default registerAs('s3', () => ({
  region: process.env.AWS_REGION ?? 'ap-south-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
  bucket: process.env.AWS_S3_BUCKET ?? '',
  // Falls back to the standard virtual-hosted-style S3 URL when a CDN/custom domain isn't set.
  publicBaseUrl:
    process.env.AWS_S3_PUBLIC_BASE_URL ||
    `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION ?? 'ap-south-1'}.amazonaws.com`,
}));
