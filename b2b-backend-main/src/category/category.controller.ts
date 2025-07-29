import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ApiTags } from '@nestjs/swagger';
import { PaginationDto } from '../common/dto/pagination.dto';
import {
  CreateCategorySwagger,
  UpdateCategorySwagger,
  DeleteCategorySwagger,
  GetAllCategoriesSwagger,
  EnableCategorySwagger,
  DisableCategorySwagger,
  GetRootCategoriesSwagger,
  GetSubcategoriesSwagger,
  GetCategoryWithChildrenSwagger,
} from './category.swagger';

@ApiTags('category')
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @CreateCategorySwagger()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  @GetAllCategoriesSwagger()
  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.categoryService.findAll(paginationDto);
  }

  @UpdateCategorySwagger()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoryService.update(+id, updateCategoryDto);
  }

  @DeleteCategorySwagger()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoryService.remove(+id);
  }

  @EnableCategorySwagger()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Patch('enable/:id')
  enable(@Param('id') id: string) {
    return this.categoryService.enable(+id);
  }

  @DisableCategorySwagger()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Patch('disable/:id')
  disable(@Param('id') id: string) {
    return this.categoryService.disable(+id);
  }

  @GetRootCategoriesSwagger()
  @Get('root')
  getRootCategories(@Query() paginationDto: PaginationDto) {
    return this.categoryService.getRootCategories(paginationDto);
  }

  @GetSubcategoriesSwagger()
  @Get(':id/subcategories')
  getSubcategories(
    @Param('id') id: string,
    @Query() paginationDto: PaginationDto
  ) {
    return this.categoryService.getSubcategories(+id, paginationDto);
  }

  @GetCategoryWithChildrenSwagger()
  @Get(':id/with-children')
  async getCategoryWithChildren(@Param('id') id: string) {
    return this.categoryService.getCategoryWithChildren(+id);
  }
}