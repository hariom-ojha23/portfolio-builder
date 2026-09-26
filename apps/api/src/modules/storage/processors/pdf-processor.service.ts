import { Injectable } from "@nestjs/common";
import sharp from "sharp";
import { FileProcessorService } from "./file-processor.service";

@Injectable()
export class PdfProcessorService implements FileProcessorService {
    async process(buffer: Buffer): Promise<Buffer> {
        /**
         * @todo
         *  
         * implement pdf optimise logic
         * 
         */
        return buffer
    }
}