import { Injectable } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';
import { extname, join } from 'path';
import { v4 as uuid } from 'uuid';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

@Injectable()
export class FileUploadService {
  getMulterOptions(destination: string): MulterOptions {
    return {
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
      storage: this.getStorage(destination),
    };
  }

  private getStorage(destination: string) {
    return {
      destination: (req, file, cb) => {
        const uploadPath = join(process.cwd(), 'uploads', destination);
        
        // Create directory if it doesn't exist
        if (!existsSync(uploadPath)) {
          mkdirSync(uploadPath, { recursive: true });
        }
        
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        // Create unique filename
        const uniqueSuffix = `${Date.now()}-${uuid()}`;
        const extension = extname(file.originalname);
        const filename = `${file.fieldname}-${uniqueSuffix}${extension}`;
        cb(null, filename);
      }
    };
  }

  getImageUrl(destination: string, filename: string): string {
    // Return URL path to the uploaded file
    return `/uploads/${destination}/${filename}`;
  }
}