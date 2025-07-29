import { Controller, Post, Body, Get, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { AttributeService } from './attribute.service';
import { CreateAttributeDto } from './dto/create-attribute.dto';
import { CreateAttributeValueDto } from './dto/create-attribute-value.dto';
import { UpdateAttributeDto } from './dto/update-attribute.dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';
import {
  CreateAttributeSwagger,
  GetAllAttributesSwagger,
  GetAttributeSwagger,
  UpdateAttributeSwagger,
  EnableAttributeSwagger,
  DisableAttributeSwagger,
  DeleteAttributeSwagger,
  AddAttributeValueSwagger
} from './attribute.swagger';

@ApiTags('attribute')
@Controller('attribute')
export class AttributeController {
  constructor(private readonly attributeService: AttributeService) {}

  @CreateAttributeSwagger()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Post()
  async create(@Body() createAttributeDto: CreateAttributeDto) {
    return this.attributeService.create(createAttributeDto);
  }

  @GetAllAttributesSwagger()
  @Get()
  async findAll(@Query() paginationDto: PaginationDto) {
    return this.attributeService.findAll(paginationDto);
  }

  @GetAttributeSwagger()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.attributeService.findOne(id);
  }

  @UpdateAttributeSwagger()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Patch(':id')
  async update(@Param('id') id: number, @Body() updateAttributeDto: UpdateAttributeDto) {
    return this.attributeService.update(id, updateAttributeDto);
  }

  @EnableAttributeSwagger()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Patch('enable/:id')
  async enable(@Param('id') id: number) {
    return this.attributeService.enable(id);
  }

  @DisableAttributeSwagger()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Patch('disable/:id')
  async disable(@Param('id') id: number) {
    return this.attributeService.disable(id);
  }

  @DeleteAttributeSwagger()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Delete(':id')
  async remove(@Param('id') id: number) {
    await this.attributeService.remove(id);
    return { message: 'Attribute removed successfully' };
  }

  @AddAttributeValueSwagger()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Post('value')
  async addAttributeValue(@Body() createAttributeValueDto: CreateAttributeValueDto) {
    return this.attributeService.addAttributeValue(createAttributeValueDto);
  }
}