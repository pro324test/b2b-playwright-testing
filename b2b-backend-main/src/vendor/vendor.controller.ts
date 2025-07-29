import { Controller, Post, Body, UseGuards, Req, Patch, Param, Get, Delete, ParseIntPipe, Query, UseInterceptors, UploadedFiles, BadRequestException } from '@nestjs/common';
import { VendorService } from './vendor.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RequestVendorDto } from './dto/request-vendor.dto';
import { RespondVendorRequestDto } from './dto/respond-vendor-request.dto';
import { ApiTags, ApiConsumes } from '@nestjs/swagger';
import { CreateVendorGroupDto } from './dto/create-vendor-group.dto';
import { UpdateVendorGroupDto } from './dto/update-vendor-group.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { UpdateVendorRequestDto } from './dto/update-vendor-request.dto';
import { ManageVendorsInGroupDto } from './dto/manage-vendors-in-group.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CheckVendorRequestResponseDto } from './dto/check-vendor-request.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { FileUploadService } from '../common/services/file-upload.service';
import {
  RequestVendorSwagger,
  RespondVendorRequestSwagger,
  GetAllVendorRequestsSwagger,
  EnableVendorSwagger,
  DisableVendorSwagger,
  GetAllVendorsSwagger,
  GetVendorSwagger,
  DeleteVendorSwagger,
  CreateVendorGroupSwagger,
  UpdateVendorGroupSwagger,
  GetVendorGroupSwagger,
  GetAllVendorGroupsSwagger,
  DeleteVendorGroupSwagger,
  UpdateVendorSwagger,
  UpdateVendorRequestSwagger,
  ManageVendorsInGroupSwagger,
  CheckVendorRequestSwagger,
  RequestVendorWithDocumentsSwagger,
  UpdateVendorProfileSwagger,
} from './vendor.swagger';

@ApiTags('vendor')
@Controller('vendor')
export class VendorController {
  constructor(
    private readonly vendorService: VendorService,
    private readonly fileUploadService: FileUploadService
  ) {}

  @RequestVendorSwagger()
  @UseGuards(JwtAuthGuard)
  @Post('request')
  async requestVendor(@Req() req, @Body() requestVendorDto: RequestVendorDto) {
    await this.vendorService.requestVendor(
      req.user.userId, 
      requestVendorDto.message,
      requestVendorDto.requestedGroupId ? parseInt(requestVendorDto.requestedGroupId, 10) : undefined
    );
    return { message: 'Vendor request submitted' };
  }

  @Post('request-with-documents')
  @UseGuards(JwtAuthGuard)
  @RequestVendorWithDocumentsSwagger()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'practicePermitDoc', maxCount: 1 },
      { name: 'licenseDoc', maxCount: 1 },
    ])
  )
  async requestVendorWithDocuments(
    @Req() req,
    @Body() requestVendorDto: RequestVendorDto,
    @UploadedFiles()
    files: {
      practicePermitDoc?: Express.Multer.File[],
      licenseDoc?: Express.Multer.File[]
    }
  ) {
    // Validate files
    if (!files.practicePermitDoc?.[0] || !files.licenseDoc?.[0]) {
      throw new BadRequestException('Both practice permit and license documents are required');
    }
    
    // Generate file URLs using the existing file upload service
    const practicePermitDocUrl = this.fileUploadService.getImageUrl(
      'vendor-documents', 
      files.practicePermitDoc[0].filename
    );
    
    const licenseDocUrl = this.fileUploadService.getImageUrl(
      'vendor-documents', 
      files.licenseDoc[0].filename
    );
    
    // Parse requestedGroupId if provided
    let requestedGroupId: number | undefined = undefined;
    if (requestVendorDto.requestedGroupId) {
      requestedGroupId = parseInt(requestVendorDto.requestedGroupId, 10);
      if (isNaN(requestedGroupId)) {
        throw new BadRequestException('requestedGroupId must be a valid number');
      }
    }
    
    return this.vendorService.createVendorRequest(
      req.user.userId,
      requestVendorDto,
      practicePermitDocUrl,
      licenseDocUrl,
      requestedGroupId
    );
  }

  @RespondVendorRequestSwagger()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin', 'admin')
  @Patch('respond/:id')
  async respondVendorRequest(@Param('id', ParseIntPipe) id: number, @Body() respondVendorRequestDto: RespondVendorRequestDto) {
    await this.vendorService.respondVendorRequest(id, respondVendorRequestDto.status);
    return { message: `Vendor request ${respondVendorRequestDto.status}` };
  }

  // New endpoint: Update vendor request
  @UpdateVendorRequestSwagger()
  @UseGuards(JwtAuthGuard)
  @Patch('request/:id')
  async updateVendorRequest(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateVendorRequestDto: UpdateVendorRequestDto,
    @Req() req
  ) {
    return this.vendorService.updateVendorRequest(id, updateVendorRequestDto, req.user.userId);
  }

  @GetAllVendorRequestsSwagger()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin', 'admin')
  @Get('requests')
  async getAllVendorRequests(@Query() paginationDto: PaginationDto) {
    return this.vendorService.getAllVendorRequests(paginationDto);
  }

  @EnableVendorSwagger()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin', 'admin')
  @Patch('enable/:id')
  async enableVendor(@Param('id', ParseIntPipe) id: number) {
    await this.vendorService.enableVendor(id);
    return { message: 'Vendor enabled successfully' };
  }

  @DisableVendorSwagger()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin', 'admin')
  @Patch('disable/:id')
  async disableVendor(@Param('id', ParseIntPipe) id: number) {
    await this.vendorService.disableVendor(id);
    return { message: 'Vendor disabled successfully' };
  }

  @GetAllVendorsSwagger()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Get('all')
  async findAllVendors(@Query() paginationDto: PaginationDto) {
    return this.vendorService.findAllVendors(paginationDto);
  }

  // New endpoint: Get single vendor
  @GetVendorSwagger()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Get(':id')
  async findOneVendor(@Param('id', ParseIntPipe) id: number) {
    return this.vendorService.findOneVendor(id);
  }

  // New endpoint: Update vendor
  @UpdateVendorSwagger()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Patch(':id')
  async updateVendor(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateVendorDto: UpdateVendorDto
  ) {
    return this.vendorService.updateVendor(id, updateVendorDto);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('vendor')
  @UpdateVendorProfileSwagger()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'practicePermitDoc', maxCount: 1 },
      { name: 'licenseDoc', maxCount: 1 },
    ])
  )
  async updateVendorProfile(
    @Req() req,
    @Body() updateVendorDto: UpdateVendorDto,
    @UploadedFiles()
    files?: {
      practicePermitDoc?: Express.Multer.File[],
      licenseDoc?: Express.Multer.File[]
    }
  ) {
    const updateData: any = { ...updateVendorDto };
    
    if (files) {
      if (files.practicePermitDoc && files.practicePermitDoc[0]) {
        updateData.practicePermitDoc = this.fileUploadService.getImageUrl(
          'vendor-documents', 
          files.practicePermitDoc[0].filename
        );
      }
      
      if (files.licenseDoc && files.licenseDoc[0]) {
        updateData.licenseDoc = this.fileUploadService.getImageUrl(
          'vendor-documents', 
          files.licenseDoc[0].filename
        );
      }
    }
    
    return this.vendorService.updateVendorProfile(req.user.userId, updateData);
  }

  // New endpoint: Delete vendor
  @DeleteVendorSwagger()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  @Delete(':id')
  async deleteVendor(@Param('id', ParseIntPipe) id: number) {
    await this.vendorService.deleteVendor(id);
    return { message: 'Vendor deleted successfully' };
  }

  @CreateVendorGroupSwagger()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Post('group')
  createVendorGroup(@Body() createVendorGroupDto: CreateVendorGroupDto) {
    return this.vendorService.createVendorGroup(createVendorGroupDto);
  }

  @UpdateVendorGroupSwagger()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Patch('group/:id')
  updateVendorGroup(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateVendorGroupDto: UpdateVendorGroupDto
  ) {
    return this.vendorService.updateVendorGroup(id, updateVendorGroupDto);
  }

  // New endpoint: Get single vendor group
  @GetVendorGroupSwagger()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Get('group/:id')
  async findOneVendorGroup(@Param('id', ParseIntPipe) id: number) {
    return this.vendorService.findOneVendorGroup(id);
  }

  // New endpoint: Delete vendor group
  @DeleteVendorGroupSwagger()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Delete('group/:id')
  async deleteVendorGroup(@Param('id', ParseIntPipe) id: number) {
    await this.vendorService.deleteVendorGroup(id);
    return { message: 'Vendor group deleted successfully' };
  }

  @GetAllVendorGroupsSwagger()
  //@UseGuards(JwtAuthGuard, RolesGuard)
  //@Roles('admin', 'superadmin')
  @Get('groups/all')
  getAllVendorGroups(@Query() paginationDto: PaginationDto) {
    return this.vendorService.getAllVendorGroups(paginationDto);
  }

  // New endpoint: Manage vendors in group
  @ManageVendorsInGroupSwagger()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Patch('group/:id/vendors')
  manageVendorsInGroup(
    @Param('id', ParseIntPipe) id: number,
    @Body() manageVendorsDto: ManageVendorsInGroupDto
  ) {
    return this.vendorService.manageVendorsInGroup(id, manageVendorsDto);
  }

  @Get('request/check')
  @UseGuards(JwtAuthGuard)
  @CheckVendorRequestSwagger()
  async checkVendorRequest(@Req() req): Promise<CheckVendorRequestResponseDto> {
    return this.vendorService.checkVendorRequest(req.user.userId);
  }
}