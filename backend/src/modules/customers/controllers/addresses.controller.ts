import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRoleType } from '@prisma/client';
import { AddressesService } from '../services/addresses.service';
import { CreateAddressDto } from '../dto/create-address.dto';
import { UpdateAddressDto } from '../dto/update-address.dto';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../auth/types/authenticated-user.type';

@ApiTags('Customer Address')
@ApiBearerAuth('access-token')
@Roles(UserRoleType.CUSTOMER)
@Controller('customers/me/addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Get()
  @ApiOperation({ summary: "List the logged-in customer's saved addresses" })
  async findAll(@CurrentUser() user: AuthenticatedUser) {
    const data = await this.addressesService.findAll(user.id);
    return { message: 'Addresses fetched successfully', data };
  }

  @Get(':addressId')
  @ApiOperation({ summary: 'Get a single saved address' })
  async findOne(@CurrentUser() user: AuthenticatedUser, @Param('addressId') addressId: string) {
    const data = await this.addressesService.findOne(user.id, addressId);
    return { message: 'Address fetched successfully', data };
  }

  @Post()
  @ApiOperation({ summary: 'Add a new address' })
  async create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateAddressDto) {
    const data = await this.addressesService.create(user.id, dto);
    return { message: 'Address added successfully', data };
  }

  @Patch(':addressId')
  @ApiOperation({ summary: 'Update a saved address' })
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('addressId') addressId: string,
    @Body() dto: UpdateAddressDto,
  ) {
    const data = await this.addressesService.update(user.id, addressId, dto);
    return { message: 'Address updated successfully', data };
  }

  @Patch(':addressId/set-default')
  @ApiOperation({ summary: 'Mark an address as the default delivery address' })
  async setDefault(@CurrentUser() user: AuthenticatedUser, @Param('addressId') addressId: string) {
    const data = await this.addressesService.setDefault(user.id, addressId);
    return { message: 'Default address updated successfully', data };
  }

  @Delete(':addressId')
  @ApiOperation({ summary: 'Delete a saved address' })
  async remove(@CurrentUser() user: AuthenticatedUser, @Param('addressId') addressId: string) {
    await this.addressesService.remove(user.id, addressId);
    return { message: 'Address deleted successfully', data: null };
  }
}
