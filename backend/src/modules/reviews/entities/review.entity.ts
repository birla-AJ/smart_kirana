import { ApiProperty } from '@nestjs/swagger';
import { ReviewStatus } from '@prisma/client';

export class ReviewEntity {
  @ApiProperty() id: string;
  @ApiProperty() customerId: string;
  @ApiProperty() customerName: string;
  @ApiProperty() productId: string;
  @ApiProperty() rating: number;
  @ApiProperty({ nullable: true }) title: string | null;
  @ApiProperty({ nullable: true }) comment: string | null;
  @ApiProperty({ enum: ReviewStatus }) status: ReviewStatus;
  @ApiProperty() createdAt: Date;
}

export class ProductRatingSummaryEntity {
  @ApiProperty() productId: string;
  @ApiProperty() averageRating: number;
  @ApiProperty() totalReviews: number;
}
