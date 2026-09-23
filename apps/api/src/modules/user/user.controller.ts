import { Body, Controller, Get, Patch } from '@nestjs/common'
import { UserService } from './user.service'
import { CurrentUserId } from '../../core/decorators/current-user.decorator'
import { UpdateUserDto } from './dto/update-user.dto'

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  async getUserProfile(@CurrentUserId() userId: string) {
    return this.userService.getUserProfile(userId)
  }

  @Patch('profile')
  async updateUserProfile(
    @CurrentUserId() userId: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.userService.updateUserProfile(userId, dto)
  }
}
