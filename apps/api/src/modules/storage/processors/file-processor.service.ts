export abstract class FileProcessorService {
    abstract process(buffer: Buffer): Promise<Buffer>
}