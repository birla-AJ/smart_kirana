import { ApiProperty } from '@nestjs/swagger';

export class PresignedUploadEntity {
  @ApiProperty({ description: 'PUT this file directly to this URL from the client' })
  uploadUrl: string;

  @ApiProperty({ description: 'Public URL to store/use once the upload completes' })
  fileUrl: string;

  @ApiProperty()
  key: string;

  @ApiProperty({ example: 300 })
  expiresInSeconds: number;
}

export class UploadedFileEntity {
  @ApiProperty()
  url: string;

  @ApiProperty()
  key: string;
}
