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
  UseInterceptors,
  UploadedFile,
  ParseBoolPipe
} from '@nestjs/common';
import { ApiTags, ApiConsumes } from '@nestjs/swagger';
import { BrandService } from './brand.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploadService } from '../common/services/file-upload.service';
import {
  CreateBrandSwagger,
  GetAllBrandsSwagger,
  GetOneBrandSwagger,
  UpdateBrandSwagger,
  DeleteBrandSwagger,
} from './brand.swagger';

@ApiTags('brand')
@Controller('brand')
export class BrandController {
  constructor(
    private readonly brandService: BrandService,
    private readonly fileUploadService: FileUploadService
  ) {}

  @CreateBrandSwagger()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('logo', {
    limits: {
      fileSize: 2 * 1024 * 1024, // 2MB
    }
  }))
  async create(
    @Body() createBrandDto: CreateBrandDto,
    @UploadedFile() logo: Express.Multer.File
  ) {
    // Process the uploaded logo if provided
    const logoUrl = logo 
      ? this.fileUploadService.getImageUrl('brands', logo.filename)
      : null;

    return this.brandService.create({
      ...createBrandDto,
      logoUrl
    });
  }

  @GetAllBrandsSwagger()
  @Get()
  async findAll(@Query() paginationDto: PaginationDto) {
    return this.brandService.findAll(paginationDto);
  }

  @GetOneBrandSwagger()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.brandService.findOne(+id);
  }

  @UpdateBrandSwagger()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Patch(':id')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('logo', {
    limits: {
      fileSize: 2 * 1024 * 1024, // 2MB
    }
  }))
  async update(
    @Param('id') id: string, 
    @Body() updateBrandDto: UpdateBrandDto,
    @UploadedFile() logo: Express.Multer.File
  ) {
    // Process the uploaded logo if provided
    const logoUrl = logo 
      ? this.fileUploadService.getImageUrl('brands', logo.filename)
      : undefined;

    // Handle remove logo flag if set
    let removeLogo = false;
    if (updateBrandDto.removeLogo) {
      if (typeof updateBrandDto.removeLogo === 'string') {
        removeLogo = updateBrandDto.removeLogo === 'true';
      } else {
        removeLogo = !!updateBrandDto.removeLogo;
      }
      delete updateBrandDto.removeLogo; // Clean up before passing to service
    }

    return this.brandService.update(+id, {
      ...updateBrandDto,
      logoUrl,
      removeLogo
    });
  }

  @DeleteBrandSwagger()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.brandService.remove(+id);
  }
}