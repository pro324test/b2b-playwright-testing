import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContentTypeDto } from './dto/create-content-type.dto';
import { UpdateContentTypeDto } from './dto/update-content-type.dto';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { ContentFilterDto, ContentPublishStatus } from './dto/content-filter.dto';
import { FileUploadService } from '../common/services/file-upload.service';

@Injectable()
export class ContentService {
  constructor(
    private prisma: PrismaService,
    private fileUploadService: FileUploadService
  ) {}

  /**
   * Content Type Operations
   */
  async createContentType(createContentTypeDto: CreateContentTypeDto) {
    try {
      return await this.prisma.contentType.create({
        data: createContentTypeDto,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException(`Content type with name '${createContentTypeDto.name}' already exists`);
      }
      throw error;
    }
  }

  async findAllContentTypes() {
    return await this.prisma.contentType.findMany({
      include: {
        _count: {
          select: { contents: true }
        }
      }
    });
  }

  async findOneContentType(id: number) {
    const contentType = await this.prisma.contentType.findUnique({
      where: { id },
      include: {
        _count: {
          select: { contents: true }
        }
      }
    });

    if (!contentType) {
      throw new NotFoundException(`Content type with ID ${id} not found`);
    }

    return contentType;
  }

  async updateContentType(id: number, updateContentTypeDto: UpdateContentTypeDto) {
    await this.findOneContentType(id);

    try {
      return await this.prisma.contentType.update({
        where: { id },
        data: updateContentTypeDto,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException(`Content type with name '${updateContentTypeDto.name}' already exists`);
      }
      throw error;
    }
  }

  async removeContentType(id: number) {
    const contentType = await this.findOneContentType(id);

    // Check if content type has associated content
    if (contentType._count.contents > 0) {
      throw new BadRequestException(`Cannot delete content type that has ${contentType._count.contents} associated content items`);
    }

    return this.prisma.contentType.delete({
      where: { id },
    });
  }

  /**
   * Content Operations
   */
  async createContent(createContentDto: CreateContentDto, createdById: number) {
    // Check if content type exists
    const contentType = await this.prisma.contentType.findUnique({
      where: { id: createContentDto.typeId }
    });

    if (!contentType) {
      throw new NotFoundException(`Content type with ID ${createContentDto.typeId} not found`);
    }

    // Process extra data if it's a string
    let extraData;
    if (createContentDto.extraData && typeof createContentDto.extraData === 'string') {
      try {
        extraData = JSON.parse(createContentDto.extraData);
      } catch (e) {
        throw new BadRequestException('Invalid extraData JSON format');
      }
    } else {
      extraData = createContentDto.extraData;
    }

    try {
      // Extract images and imagesMeta for separate handling
      const { images, imagesMeta, ...contentData } = createContentDto as any;

      // Create content first
      const content = await this.prisma.content.create({
        data: {
          ...contentData,
          extraData,
          createdById,
          publishedAt: contentData.isPublished ? new Date() : null,
        },
      });

      // Add images if any
      if (images && images.length > 0) {
        await this.prisma.contentImage.createMany({
          data: images.map((image: any, index: number) => ({
            imageUrl: image.imageUrl,
            contentId: content.id,
            displayOrder: image.displayOrder ?? index,
          })),
        });
      }

      // Return the created content with all relations
      return this.prisma.content.findUnique({
        where: { id: content.id },
        include: {
          type: true,
          images: {
            orderBy: { displayOrder: 'asc' }
          }
        }
      });
    } catch (error) {
      throw error;
    }
  }

  async findAllContent(filterDto: ContentFilterDto) {
    const { 
      page = 1, 
      limit = 10, 
      publishStatus = ContentPublishStatus.ALL, 
      typeId,
      sortBy = 'createdAt',
      sortDirection = 'desc'
    } = filterDto;

    const skip = (page - 1) * limit;

    // Build where conditions
    const where: any = {};

    if (publishStatus === ContentPublishStatus.PUBLISHED) {
      where.isPublished = true;
    } else if (publishStatus === ContentPublishStatus.UNPUBLISHED) {
      where.isPublished = false;
    }

    if (typeId) {
      where.typeId = typeId;
    }

    // Validate sortBy field to prevent SQL injection
    const validSortFields = ['id', 'title', 'createdAt', 'updatedAt', 'publishedAt'];
    const actualSortBy = validSortFields.includes(sortBy) ? sortBy : 'createdAt';

    // Execute query with pagination
    const [contents, total] = await Promise.all([
      this.prisma.content.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [actualSortBy]: sortDirection.toLowerCase() },
        include: {
          type: true,
          images: {
            orderBy: { displayOrder: 'asc' }
          }
        }
      }),
      this.prisma.content.count({ where })
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);

    return {
      data: contents,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    };
  }

  async findOneContent(id: number) {
    const content = await this.prisma.content.findUnique({
      where: { id },
      include: {
        type: true,
        images: {
          orderBy: { displayOrder: 'asc' }
        }
      }
    });

    if (!content) {
      throw new NotFoundException(`Content with ID ${id} not found`);
    }

    return content;
  }

  async updateContent(id: number, updateContentDto: UpdateContentDto) {
    // Check if content exists
    await this.findOneContent(id);

    // Check if content type exists if it's being updated
    if (updateContentDto.typeId) {
      const contentType = await this.prisma.contentType.findUnique({
        where: { id: updateContentDto.typeId }
      });

      if (!contentType) {
        throw new NotFoundException(`Content type with ID ${updateContentDto.typeId} not found`);
      }
    }

    // Process extra data if it's a string
    let extraData;
    if (updateContentDto.extraData && typeof updateContentDto.extraData === 'string') {
      try {
        extraData = JSON.parse(updateContentDto.extraData);
      } catch (e) {
        throw new BadRequestException('Invalid extraData JSON format');
      }
    } else if (updateContentDto.extraData !== undefined) {
      extraData = updateContentDto.extraData;
    }

    // Type assertion to safely extract images and deleteImageIds
    const updateContentData = updateContentDto as any;
    // Extract both images, imagesMeta and deleteImageIds
    const { images, imagesMeta, deleteImageIds, ...contentData } = updateContentData;

    // Handle isPublished conversion from string to boolean
    if (contentData.isPublished !== undefined && typeof contentData.isPublished === 'string') {
      contentData.isPublished = contentData.isPublished === 'true';
    }

    // Set publish date if content is being published and wasn't before
    let publishedAt: Date | null | undefined = undefined;
    
    if (contentData.isPublished !== undefined) {
      const currentContent = await this.prisma.content.findUnique({
        where: { id },
        select: { isPublished: true, publishedAt: true }
      });

      if (currentContent && contentData.isPublished && !currentContent.isPublished) {
        publishedAt = new Date();
      } else if (contentData.isPublished === false) {
        publishedAt = null;
      }
    }

    try {
      // Prepare the image updates data (similar to product module)
      const imageUpdates = {};
      
      // Only include deleteMany if deleteImageIds is provided and not empty
      if (deleteImageIds && deleteImageIds.length > 0) {
        imageUpdates['deleteMany'] = {
          id: { in: deleteImageIds },
          contentId: id // ensure we only delete images for this content
        };
      }
      
      // Only include create if new images are uploaded
      if (images && images.length > 0) {
        imageUpdates['create'] = images.map((image: any, index: number) => ({
          imageUrl: image.imageUrl,
          displayOrder: image.displayOrder ?? index,
        }));
      }

      // Prepare the content update data
      const updateData: any = {
        ...contentData,
        extraData: extraData !== undefined ? extraData : undefined,
        publishedAt,
      };
      
      // Only include images updates if we have any
      if (Object.keys(imageUpdates).length > 0) {
        updateData.images = imageUpdates;
      }

      // Update content with all relations in a single operation
      const updatedContent = await this.prisma.content.update({
        where: { id },
        data: updateData,
        include: {
          type: true,
          images: {
            orderBy: { displayOrder: 'asc' }
          }
        }
      });

      return updatedContent;
    } catch (error) {
      throw error;
    }
  }

  async removeContent(id: number) {
    // Check if content exists
    const content = await this.findOneContent(id);

    // Delete the content (cascade will delete the images)
    return this.prisma.content.delete({
      where: { id }
    });
  }

  async publishContent(id: number) {
    // Check if content exists
    await this.findOneContent(id);

    return this.prisma.content.update({
      where: { id },
      data: {
        isPublished: true,
        publishedAt: new Date()
      },
      include: {
        type: true,
        images: {
          orderBy: { displayOrder: 'asc' }
        }
      }
    });
  }

  async unpublishContent(id: number) {
    // Check if content exists
    await this.findOneContent(id);

    return this.prisma.content.update({
      where: { id },
      data: {
        isPublished: false,
        publishedAt: null
      },
      include: {
        type: true,
        images: {
          orderBy: { displayOrder: 'asc' }
        }
      }
    });
  }
}