import { Injectable } from '@nestjs/common'
import { StorageService } from './storage.service'
import path from 'path'
import fs from 'fs'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class LocalStorageService extends StorageService {
  constructor(private configService: ConfigService) {
    super()
  }

  private readonly uploadDir = path.join(process.cwd(), 'uploads')

  /**
   * @param file Upload the file to the server
   * @param filePath relative file path
   * @returns relative path for storage
   */
  async upload(file: Buffer, filePath: string): Promise<string> {
    const fullPath = path.join(this.uploadDir, filePath)

    await fs.promises.mkdir(path.dirname(fullPath), {
      recursive: true,
    })

    await fs.promises.writeFile(fullPath, file)

    return filePath
  }

  /**
   * Delete the file from the server
   * @param path relative path for storage
   */
  async delete(filePath: string): Promise<void> {
    const fullPath = path.join(process.cwd(), filePath)
    await fs.promises.rm(fullPath, {
      force: true,
    })
  }

  /**
   * Get the URL of the file
   * @param path relative path for storage
   * @returns absolute path
   */
  async getUrl(filePath: string): Promise<string> {
    return (
      this.configService.get<string>('BASE_URL') +
      `/uploads/${filePath}` +
      `?v=${Date.now()}`
    )
  }
}
