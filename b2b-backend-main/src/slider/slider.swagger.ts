import { applyDecorators } from '@nestjs/common';
import { 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiParam,
  ApiConsumes,
  ApiBody
} from '@nestjs/swagger';

export const CreateSliderSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Admin Only] Create a slider image',
      description: 'Upload a new slider image with optional metadata'
    }),
    ApiBearerAuth(),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          image: {
            type: 'string',
            format: 'binary',
            description: 'Slider image file'
          },
          displayOrder: {
            type: 'string',
            example: '1',
            description: 'Display order of the image'
          },
          link: {
            type: 'string',
            example: 'https://example.com/promo',
            description: 'Link when the image is clicked'
          },
          extraData: {
            type: 'string',
            example: '{"buttonText":"Shop Now","textColor":"#FFFFFF"}',
            description: 'Additional JSON configuration data'
          },
          isActive: {
            type: 'string',
            example: 'true',
            description: 'Whether this slider image is active'
          }
        },
        required: ['image']
      }
    }),
    ApiResponse({ status: 201, description: 'Slider image created successfully' }),
    ApiResponse({ status: 400, description: 'Bad request - Image is required' }),
    ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  );
};

export const GetAllSlidersSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: 'Get all slider images',
      description: 'Retrieve all slider images sorted by display order'
    }),
    ApiResponse({ status: 200, description: 'List of all slider images' })
  );
};

export const GetActiveSlidersSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: 'Get active slider images',
      description: 'Retrieve only active slider images sorted by display order'
    }),
    ApiResponse({ status: 200, description: 'List of active slider images' })
  );
};

export const GetSliderSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: 'Get a specific slider image',
      description: 'Retrieve details for a specific slider image'
    }),
    ApiParam({
      name: 'id',
      description: 'Slider ID',
      type: 'number'
    }),
    ApiResponse({ status: 200, description: 'Slider image details' }),
    ApiResponse({ status: 404, description: 'Slider image not found' })
  );
};

export const UpdateSliderSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Admin Only] Update a slider image',
      description: 'Update a slider image and its metadata'
    }),
    ApiBearerAuth(),
    ApiConsumes('multipart/form-data'),
    ApiParam({
      name: 'id',
      description: 'Slider ID',
      type: 'number'
    }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          image: {
            type: 'string',
            format: 'binary',
            description: 'New slider image file (optional)'
          },
          displayOrder: {
            type: 'string',
            example: '2',
            description: 'Display order of the image'
          },
          link: {
            type: 'string',
            example: 'https://example.com/updated-promo',
            description: 'Link when the image is clicked'
          },
          extraData: {
            type: 'string',
            example: '{"buttonText":"Buy Now","textColor":"#000000"}',
            description: 'Additional JSON configuration data'
          },
          isActive: {
            type: 'string',
            example: 'false',
            description: 'Whether this slider image is active'
          }
        }
      }
    }),
    ApiResponse({ status: 200, description: 'Slider image updated successfully' }),
    ApiResponse({ status: 403, description: 'Forbidden - Admin access required' }),
    ApiResponse({ status: 404, description: 'Slider image not found' })
  );
};

export const DeleteSliderSwagger = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: '[Admin Only] Delete a slider image',
      description: 'Delete a slider image from the system'
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'id',
      description: 'Slider ID',
      type: 'number'
    }),
    ApiResponse({ status: 200, description: 'Slider image deleted successfully' }),
    ApiResponse({ status: 403, description: 'Forbidden - Admin access required' }),
    ApiResponse({ status: 404, description: 'Slider image not found' })
  );
};