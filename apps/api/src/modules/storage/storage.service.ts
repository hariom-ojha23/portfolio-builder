export abstract class StorageService {
    abstract upload(file: Buffer, path: string): Promise<string>
    abstract delete(path: string): Promise<void>
    abstract getUrl(path: string): Promise<string>
}