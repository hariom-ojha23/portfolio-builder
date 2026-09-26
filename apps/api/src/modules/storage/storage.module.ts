import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { LocalStorageService } from './local-storage.service';
import { FileProcessorService } from './processors/file-processor.service';
import { ImageProcessorService } from './processors/image-processor.service';

@Module({
    providers: [
        {
            provide: StorageService,
            useClass: LocalStorageService
        },
        {
            provide: FileProcessorService,
            useClass: ImageProcessorService
        }
    ],
    exports: [StorageService, FileProcessorService]
})
export class StorageModule { }