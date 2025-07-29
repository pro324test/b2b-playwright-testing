import { IsArray, IsNumber, IsIn, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ManageVendorsInGroupDto {
  @ApiProperty({ 
    example: 'add',
    enum: ['add', 'remove', 'set'],
    description: 'Operation type: add (add vendors), remove (remove vendors), set (replace all)'
  })
  @IsNotEmpty()
  @IsIn(['add', 'remove', 'set'])
  operation: string;

  @ApiProperty({ 
    type: [Number], 
    example: [1, 2, 3],
    description: 'IDs of vendors to add, remove, or set as the complete list'
  })
  @IsArray()
  @IsNumber({}, { each: true })
  vendorIds: number[];
}