import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Req,
    Query,
    ParseIntPipe,
    UseInterceptors,
    UploadedFiles,
    BadRequestException,
  } from '@nestjs/common';
  import { ApiTags, ApiConsumes } from '@nestjs/swagger';
  import { ContentService } from './content.service';
  import { CreateContentTypeDto } from './dto/create-content-type.dto';
  import { UpdateContentTypeDto } from './dto/update-content-type.dto';
  import { CreateContentDto } from './dto/create-content.dto';
  import { UpdateContentDto } from './dto/update-content.dto';
  import { ContentFilterDto, ContentPublishStatus } from './dto/content-filter.dto';
  import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
  import { RolesGuard } from '../common/guards/roles.guard';
  import { Roles } from '../common/decorators/roles.decorator';
  import { FilesInterceptor } from '@nestjs/platform-express';
  import { FileUploadService } from '../common/services/file-upload.service';
  import {
    CreateContentTypeSwagger,
    GetAllContentTypesSwagger,
    GetContentTypeSwagger,
    UpdateContentTypeSwagger,
    DeleteContentTypeSwagger,
    CreateContentSwagger,
    GetAllContentSwagger,
    GetContentSwagger,
    UpdateContentSwagger,
    DeleteContentSwagger,
    PublishContentSwagger,
    UnpublishContentSwagger,
    GetPublishedContentByTypeSwagger,
  } from './content.swagger';
  
  @ApiTags('content')
  @Controller('content')
  export class ContentController {
    constructor(
      private readonly contentService: ContentService,
      private readonly fileUploadService: FileUploadService,
    ) {}
  
    /**
     * Content Type Endpoints
     */
    @Post('type')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'superadmin')
    @CreateContentTypeSwagger()
    createContentType(@Body() createContentTypeDto: CreateContentTypeDto) {
      return this.contentService.createContentType(createContentTypeDto);
    }
  
    @Get('type')
    @GetAllContentTypesSwagger()
    findAllContentTypes() {
      return this.contentService.findAllContentTypes();
    }
  
    @Get('type/:id')
    @GetContentTypeSwagger()
    findOneContentType(@Param('id', ParseIntPipe) id: number) {
      return this.contentService.findOneContentType(id);
    }
  
    @Patch('type/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'superadmin')
    @UpdateContentTypeSwagger()
    updateContentType(
      @Param('id', ParseIntPipe) id: number,
      @Body() updateContentTypeDto: UpdateContentTypeDto,
    ) {
      return this.contentService.updateContentType(id, updateContentTypeDto);
    }
  
    @Delete('type/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'superadmin')
    @DeleteContentTypeSwagger()
    removeContentType(@Param('id', ParseIntPipe) id: number) {
      return this.contentService.removeContentType(id);
    }
  
    /**
     * Content Item Endpoints
     */
    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'superadmin')
    @CreateContentSwagger()
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FilesInterceptor('images', 10, {
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      }
    }))
    async createContent(
      @Body() createContentDto: CreateContentDto,
      @UploadedFiles() files: Express.Multer.File[],
      @Req() req
    ) {
      try {
        // Convert isPublished from string to boolean if it's a string
        if (createContentDto.isPublished !== undefined && typeof createContentDto.isPublished === 'string') {
          createContentDto.isPublished = createContentDto.isPublished === 'true';
        }
        
        // Process the uploaded images
        const images = files?.map((file, index) => {
          const displayOrder = createContentDto.imagesMeta ? 
            JSON.parse(createContentDto.imagesMeta)[index]?.displayOrder || index : index;
          
          return {
            imageUrl: this.fileUploadService.getImageUrl('content', file.filename),
            displayOrder: displayOrder
          };
        }) || [];
  
        // Prepare content data for service
        const contentData = {
          ...createContentDto,
          images
        };
        
        return this.contentService.createContent(contentData, req.user.userId);
      } catch (error) {
        if (error.message.includes('JSON')) {
          throw new BadRequestException('Invalid imagesMeta JSON format');
        }
        throw error;
      }
    }
  
    @Get()
    @GetAllContentSwagger()
    findAllContent(@Query() filterDto: ContentFilterDto) {
      return this.contentService.findAllContent(filterDto);
    }
  
    @Get(':id')
    @GetContentSwagger()
    findOneContent(@Param('id', ParseIntPipe) id: number) {
      return this.contentService.findOneContent(id);
    }
  
    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'superadmin')
    @UpdateContentSwagger()
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FilesInterceptor('images', 10, {
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      }
    }))
    async updateContent(
      @Param('id', ParseIntPipe) id: number,
      @Body() updateContentDto: UpdateContentDto,
      @UploadedFiles() files: Express.Multer.File[],
    ) {
      try {
        // Process the uploaded images if any
        const images = files?.length > 0 ? files.map((file, index) => {
          const displayOrder = updateContentDto.imagesMeta ? 
            JSON.parse(updateContentDto.imagesMeta)[index]?.displayOrder || index : index;
          
          return {
            imageUrl: this.fileUploadService.getImageUrl('content', file.filename),
            displayOrder: displayOrder
          };
        }) : undefined;
  
        // Parse deleteImageIds if provided as string
        let deleteImageIds: any = updateContentDto.deleteImageIds || [];
        
        // Handle different formats - string JSON array, actual array, or stringified number array
        if (typeof deleteImageIds === 'string') {
          try {
            // Try to parse as JSON
            deleteImageIds = JSON.parse(deleteImageIds);
          } catch (e) {
            // If not valid JSON, try comma separated values
            if (deleteImageIds.includes(',')) {
              deleteImageIds = (deleteImageIds as string).split(',').map(id => parseInt(id.trim(), 10));
            } else {
              // Single value
              const id = parseInt(deleteImageIds as string, 10);
              deleteImageIds = isNaN(id) ? [] : [id];
            }
          }
        }
        
        // Ensure all IDs are numbers and we end up with a number array
        const finalDeleteImageIds = Array.isArray(deleteImageIds) 
          ? deleteImageIds.map(id => typeof id === 'string' ? parseInt(id, 10) : id)
              .filter(id => !isNaN(id))
          : [];
  
        // Prepare update data
        const contentData = {
          ...updateContentDto,
          images,
          deleteImageIds: finalDeleteImageIds
        };
  
        return this.contentService.updateContent(id, contentData);
      } catch (error) {
        if (error.message.includes('JSON')) {
          throw new BadRequestException('Invalid JSON format in request body');
        }
        throw error;
      }
    }
  
    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'superadmin')
    @DeleteContentSwagger()
    removeContent(@Param('id', ParseIntPipe) id: number) {
      return this.contentService.removeContent(id);
    }
  
    @Patch(':id/publish')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'superadmin')
    @PublishContentSwagger()
    publishContent(@Param('id', ParseIntPipe) id: number) {
      return this.contentService.publishContent(id);
    }
  
    @Patch(':id/unpublish')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'superadmin')
    @UnpublishContentSwagger()
    unpublishContent(@Param('id', ParseIntPipe) id: number) {
      return this.contentService.unpublishContent(id);
    }
  
    @Get('published/type/:typeId')
    @GetPublishedContentByTypeSwagger()
    getPublishedContentByType(@Param('typeId', ParseIntPipe) typeId: number) {
      // Create a filter with published status only and the specified type
      const filter = new ContentFilterDto();
      filter.publishStatus = ContentPublishStatus.PUBLISHED;
      filter.typeId = typeId;
      
      return this.contentService.findAllContent(filter);
    }
  }