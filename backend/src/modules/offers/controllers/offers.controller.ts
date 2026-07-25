import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRoleType } from '@prisma/client';
import { OffersService } from '../services/offers.service';
import { CreateOfferDto } from '../dto/create-offer.dto';
import { UpdateOfferDto } from '../dto/update-offer.dto';
import { QueryOfferDto } from '../dto/query-offer.dto';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Public } from '../../../common/decorators/public.decorator';

@ApiTags('Offer')
@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List offers (storefront + admin)' })
  async findAll(@Query() query: QueryOfferDto) {
    const data = await this.offersService.findAll(query);
    return { message: 'Offers fetched successfully', data };
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get an offer by id' })
  async findOne(@Param('id') id: string) {
    const data = await this.offersService.findOne(id);
    return { message: 'Offer fetched successfully', data };
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRoleType.ADMIN, UserRoleType.SUPER_ADMIN)
  @Post()
  @ApiOperation({ summary: 'Create an offer (admin)' })
  async create(@Body() dto: CreateOfferDto) {
    const data = await this.offersService.create(dto);
    return { message: 'Offer created successfully', data };
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRoleType.ADMIN, UserRoleType.SUPER_ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Update an offer (admin)' })
  async update(@Param('id') id: string, @Body() dto: UpdateOfferDto) {
    const data = await this.offersService.update(id, dto);
    return { message: 'Offer updated successfully', data };
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRoleType.ADMIN, UserRoleType.SUPER_ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete an offer (admin)' })
  async remove(@Param('id') id: string) {
    await this.offersService.remove(id);
    return { message: 'Offer deleted successfully', data: null };
  }
}
