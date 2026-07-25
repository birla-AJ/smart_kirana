import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRoleType } from '@prisma/client';
import { UploadService } from '../services/upload.service';
import { PresignUploadDto } from '../dto/presign-upload.dto';
import { Roles } from '../../../common/decorators/roles.decorator';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

@ApiTags('Upload')
@ApiBearerAuth('access-token')
@Roles(UserRoleType.ADMIN, UserRoleType.SUPER_ADMIN)
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('presign')
  @ApiOperation({ summary: 'Get a presigned S3 URL to upload a file directly from the client' })
  async presign(@Body() dto: PresignUploadDto) {
    const data = await this.uploadService.getPresignedUploadUrl(dto);
    return { message: 'Presigned URL generated successfully', data };
  }

  @Post('image')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload an image directly through the API (admin convenience path)' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file was uploaded');
    if (file.size > MAX_FILE_SIZE_BYTES) throw new BadRequestException('File exceeds the 5MB limit');
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(`Unsupported file type: ${file.mimetype}`);
    }

    const data = await this.uploadService.uploadBuffer('products', file.originalname, file.mimetype, file.buffer);
    return { message: 'Image uploaded successfully', data };
  }
}
