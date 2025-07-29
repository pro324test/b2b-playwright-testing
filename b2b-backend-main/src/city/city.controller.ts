import { 
    Controller, 
    Get, 
    Post, 
    Body, 
    Patch, 
    Param, 
    Delete, 
    UseGuards, 
    Query,
    ParseIntPipe
  } from '@nestjs/common';
  import { CityService } from './city.service';
  import { CreateCityDto } from './dto/create-city.dto';
  import { UpdateCityDto } from './dto/update-city.dto';
  import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
  import { RolesGuard } from '../common/guards/roles.guard';
  import { Roles } from '../common/decorators/roles.decorator';
  import { ApiTags } from '@nestjs/swagger';
  import { PaginationDto } from '../common/dto/pagination.dto';
  import {
    CreateCitySwagger,
    GetAllCitiesSwagger,
    GetCitySwagger,
    UpdateCitySwagger,
    EnableCitySwagger,
    DisableCitySwagger,
    DeleteCitySwagger
  } from './city.swagger';
  
  @ApiTags('city')
  @Controller('city')
  export class CityController {
    constructor(private readonly cityService: CityService) {}
  
    @CreateCitySwagger()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'superadmin')
    @Post()
    async create(@Body() createCityDto: CreateCityDto) {
      return this.cityService.create(createCityDto);
    }
  
    @GetAllCitiesSwagger()
    @Get()
    async findAll(@Query() paginationDto: PaginationDto) {
      return this.cityService.findAll(paginationDto);
    }
  
    @GetCitySwagger()
    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
      return this.cityService.findOne(id);
    }
  
    @UpdateCitySwagger()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'superadmin')
    @Patch(':id')
    async update(
      @Param('id', ParseIntPipe) id: number, 
      @Body() updateCityDto: UpdateCityDto
    ) {
      return this.cityService.update(id, updateCityDto);
    }
  
    @EnableCitySwagger()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'superadmin')
    @Patch(':id/enable')
    async enable(@Param('id', ParseIntPipe) id: number) {
      await this.cityService.enable(id);
      return { message: 'City enabled successfully' };
    }
  
    @DisableCitySwagger()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'superadmin')
    @Patch(':id/disable')
    async disable(@Param('id', ParseIntPipe) id: number) {
      await this.cityService.disable(id);
      return { message: 'City disabled successfully' };
    }
  
    @DeleteCitySwagger()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'superadmin')
    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number) {
      await this.cityService.remove(id);
      return { message: 'City deleted successfully' };
    }
  }