import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRoleType } from '@prisma/client';
import { ReviewsService } from '../services/reviews.service';
import { CreateReviewDto } from '../dto/create-review.dto';
import { UpdateReviewStatusDto } from '../dto/update-review-status.dto';
import { QueryReviewDto } from '../dto/query-review.dto';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Public } from '../../../common/decorators/public.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../auth/types/authenticated-user.type';
import { CustomersService } from '../../customers/services/customers.service';

@ApiTags('Review')
@Controller('reviews')
export class ReviewsController {
  constructor(
    private readonly reviewsService: ReviewsService,
    private readonly customersService: CustomersService,
  ) {}

  private async customerId(user: AuthenticatedUser): Promise<string> {
    const customer = await this.customersService.findByUserId(user.id);
    return customer.id;
  }

  @Public()
  @Get('product/:productId')
  @ApiOperation({ summary: 'List approved reviews for a product (storefront)' })
  async findAllForProduct(@Param('productId') productId: string, @Query() query: QueryReviewDto) {
    const data = await this.reviewsService.findAllForProduct(productId, query);
    return { message: 'Reviews fetched successfully', data };
  }

  @Public()
  @Get('product/:productId/summary')
  @ApiOperation({ summary: 'Get average rating and review count for a product' })
  async getSummary(@Param('productId') productId: string) {
    const data = await this.reviewsService.getProductRatingSummary(productId);
    return { message: 'Rating summary fetched successfully', data };
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRoleType.CUSTOMER)
  @Post()
  @ApiOperation({ summary: 'Submit (or update) a review for a product you have ordered' })
  async create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateReviewDto) {
    const data = await this.reviewsService.create(await this.customerId(user), dto);
    return { message: 'Review submitted successfully, pending approval', data };
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRoleType.CUSTOMER)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete your own review' })
  async remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    await this.reviewsService.remove(await this.customerId(user), id);
    return { message: 'Review deleted successfully', data: null };
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRoleType.ADMIN, UserRoleType.SUPER_ADMIN)
  @Get()
  @ApiOperation({ summary: 'List all reviews across all statuses (admin moderation queue)' })
  async findAllAdmin(@Query() query: QueryReviewDto) {
    const data = await this.reviewsService.findAllAdmin(query);
    return { message: 'Reviews fetched successfully', data };
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRoleType.ADMIN, UserRoleType.SUPER_ADMIN)
  @Patch(':id/status')
  @ApiOperation({ summary: 'Approve or reject a review (admin)' })
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateReviewStatusDto) {
    const data = await this.reviewsService.updateStatus(id, dto);
    return { message: 'Review status updated successfully', data };
  }
}
