import { ApiProperty } from '@nestjs/swagger';
import { AddressType } from '@prisma/client';

export class AddressEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  customerId: string;

  @ApiProperty({ enum: AddressType })
  type: AddressType;

  @ApiProperty()
  fullName: string;

  @ApiProperty()
  mobile: string;

  @ApiProperty()
  addressLine1: string;

  @ApiProperty({ nullable: true })
  addressLine2: string | null;

  @ApiProperty({ nullable: true })
  landmark: string | null;

  @ApiProperty()
  city: string;

  @ApiProperty()
  state: string;

  @ApiProperty()
  country: string;

  @ApiProperty()
  pincode: string;

  @ApiProperty({ nullable: true })
  latitude: number | null;

  @ApiProperty({ nullable: true })
  longitude: number | null;

  @ApiProperty()
  isDefault: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
