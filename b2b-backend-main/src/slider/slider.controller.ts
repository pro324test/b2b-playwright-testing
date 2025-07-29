import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    UploadedFile,
    UseInterceptors,
    BadRequestException,
    ParseIntPipe,
  } from '@nestjs/common';
  import { FileInterceptor } from '@nestjs/platform-express';
  import { ApiTags, ApiConsumes } from '@nestjs/swagger';
  import { SliderService } from './slider.service';
  import { CreateSliderDto } from './dto/create-slider.dto';
  import { UpdateSliderDto } from './dto/update-slider.dto';
  import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
  import { RolesGuard } from '../common/guards/roles.guard';
  import { Roles } from '../common/decorators/roles.decorator';
  import { FileUploadService } from '../common/services/file-upload.service';
  import {
    CreateSliderSwagger, 
    GetAllSlidersSwagger,
    GetActiveSlidersSwagger,
    GetSliderSwagger,
    UpdateSliderSwagger,
    DeleteSliderSwagger
  } from './slider.swagger';
  
  @ApiTags('sliders')
  @Controller('sliders')
  export class SliderController {
    constructor(
      private readonly sliderService: SliderService,
      private readonly fileUploadService: FileUploadService,
    ) {}
  
    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'superadmin')
    @CreateSliderSwagger()
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('image', {
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      }
    }))
    async create(
      @Body() createSliderDto: CreateSliderDto,
      @UploadedFile() file: Express.Multer.File,
    ) {
      if (!file) {
        throw new BadRequestException('Slider image is required');
      }
  
      // Generate image URL
      const imageUrl = this.fileUploadService.getImageUrl('sliders', file.filename);
      
      return this.sliderService.create(createSliderDto, imageUrl);
    }
  
    @Get()
    @GetAllSlidersSwagger()
    findAll() {
      return this.sliderService.findAll();
    }
  
    @Get('active')
    @GetActiveSlidersSwagger()
    findActive() {
      return this.sliderService.findActive();
    }
  
    @Get(':id')
    @GetSliderSwagger()
    findOne(@Param('id', ParseIntPipe) id: number) {
      return this.sliderService.findOne(id);
    }
  
    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'superadmin')
    @UpdateSliderSwagger()
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('image', {
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      }
    }))
    update(
      @Param('id', ParseIntPipe) id: number,
      @Body() updateSliderDto: UpdateSliderDto,
      @UploadedFile() file?: Express.Multer.File,
    ) {
      // Generate image URL if file is provided
      const imageUrl = file ? 
        this.fileUploadService.getImageUrl('sliders', file.filename) : 
        undefined;
      
      return this.sliderService.update(id, updateSliderDto, imageUrl);
    }
  
    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'superadmin')
    @DeleteSliderSwagger()
    remove(@Param('id', ParseIntPipe) id: number) {
      return this.sliderService.remove(id);
    }
  }