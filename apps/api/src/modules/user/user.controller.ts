import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'
import { UserService } from './user.service'
import { CurrentUserId } from '../../core/decorators/current-user.decorator'
import { UpdateUserDto } from './dto/update-user.dto'
import { FileInterceptor } from '@nestjs/platform-express'
import { createFileValidator } from '../storage/validators/file-validaton'

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  async getUserProfile(@CurrentUserId() userId: string) {
    return this.userService.getUserProfile(userId)
  }

  @Post('avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @CurrentUserId() userId: string,
    @UploadedFile(
      createFileValidator({
        maxSize: 2 * 1024 * 1024,
        fileType: /^image\/(jpeg|png|webp)$/,
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.userService.uploadAvatar(userId, file)
  }

  @Patch('profile')
  async updateUserProfile(
    @CurrentUserId() userId: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.userService.updateUserProfile(userId, dto)
  }
}
