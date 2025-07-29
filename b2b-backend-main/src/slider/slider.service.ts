import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSliderDto } from './dto/create-slider.dto';
import { UpdateSliderDto } from './dto/update-slider.dto';

@Injectable()
export class SliderService {
  constructor(private readonly prisma: PrismaService) {}

  // Create a new slider image
  async create(createSliderDto: CreateSliderDto, imageUrl: string) {
    // Parse extraData if it's a string
    let extraData;
    if (createSliderDto.extraData) {
      try {
        extraData = JSON.parse(createSliderDto.extraData);
      } catch (error) {
        extraData = {};
      }
    }

    // Convert string values to their proper types
    const displayOrder = createSliderDto.displayOrder ? 
      parseInt(createSliderDto.displayOrder) : 1;
    const isActive = createSliderDto.isActive !== undefined ? 
      createSliderDto.isActive === 'true' : true;

    return this.prisma.slider.create({
      data: {
        imageUrl,
        displayOrder,
        link: createSliderDto.link,
        extraData,
        isActive
      }
    });
  }

  // Find all slider images
  async findAll() {
    return this.prisma.slider.findMany({
      orderBy: {
        displayOrder: 'asc'
      }
    });
  }

  // Find active slider images only
  async findActive() {
    return this.prisma.slider.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        displayOrder: 'asc'
      }
    });
  }

  // Find one slider image by id
  async findOne(id: number) {
    const slider = await this.prisma.slider.findUnique({
      where: { id }
    });

    if (!slider) {
      throw new NotFoundException(`Slider with ID ${id} not found`);
    }

    return slider;
  }

  // Update a slider image
  async update(id: number, updateSliderDto: UpdateSliderDto, imageUrl?: string) {
    // Check if slider exists
    await this.findOne(id);

    // Prepare update data
    const updateData: any = {};

    // Only add imageUrl if provided
    if (imageUrl) {
      updateData.imageUrl = imageUrl;
    }

    // Parse extraData if it's a string
    if (updateSliderDto.extraData) {
      try {
        updateData.extraData = JSON.parse(updateSliderDto.extraData);
      } catch (error) {
        // If parsing fails, don't update extraData
      }
    }

    // Convert string values to their proper types
    if (updateSliderDto.displayOrder) {
      updateData.displayOrder = parseInt(updateSliderDto.displayOrder);
    }

    if (updateSliderDto.link !== undefined) {
      updateData.link = updateSliderDto.link;
    }

    if (updateSliderDto.isActive !== undefined) {
      updateData.isActive = updateSliderDto.isActive === 'true';
    }

    return this.prisma.slider.update({
      where: { id },
      data: updateData
    });
  }

  // Remove a slider image
  async remove(id: number) {
    // Check if slider exists
    await this.findOne(id);

    return this.prisma.slider.delete({
      where: { id }
    });
  }
}