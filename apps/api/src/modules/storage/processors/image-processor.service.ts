import { Injectable } from "@nestjs/common";
import { FileProcessorService } from "./file-processor.service";

import sharp from 'sharp'

@Injectable()
export class ImageProcessorService extends FileProcessorService {
    async process(buffer: Buffer): Promise<Buffer> {
        return sharp(buffer)
            .resize(1200, 1200, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .webp({ quality: 80 })
            .toBuffer();
    }
}