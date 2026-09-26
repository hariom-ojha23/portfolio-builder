import { FileTypeValidator, MaxFileSizeValidator, ParseFilePipe } from "@nestjs/common"

export interface FileValidationOptions {
    maxSize: number
    fileType: RegExp
}

export const createFileValidator = (options: FileValidationOptions) => {
    console.log(options)
    return new ParseFilePipe({
        validators: [
            new MaxFileSizeValidator({
                maxSize: options.maxSize
            }),
            new FileTypeValidator({
                fileType: options.fileType
            })
        ]
    })
}