import { Body, Controller, Get, Post, Res } from '@nestjs/common'
import { AuthService } from './auth.service'
import { RegisterDto } from './dto/register.dto'
import { NODE_ENV } from '../../core/enums/node-env.enum'
import { LoginDto } from './dto/login.dto'
import type { Response } from 'express'
import { Public } from '../../core/decorators/public.decorator'
import { CurrentUserId } from '../../core/decorators/current-user.decorator'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private readonly accessTokenCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === NODE_ENV.PRODUCTION,
    sameSite: 'lax' as const,
    path: '/',
  }

  private setAccessTokenCookie(response: Response, accessToken: string) {
    response.cookie('access_token', accessToken, {
      ...this.accessTokenCookieOptions,
      maxAge: 15 * 60 * 1000, // 15min
    })
  }

  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.register(dto)
    this.setAccessTokenCookie(res, result.accessToken)

    return {
      user: result.user,
    }
  }

  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(dto)
    this.setAccessTokenCookie(res, result.accessToken)

    return {
      user: result.user,
    }
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token', this.accessTokenCookieOptions)

    return { message: 'Logged out successfully' }
  }

  @Get('me')
  async getMe(@CurrentUserId() userId: string) {
    const user = await this.authService.getCurrentUser(userId)
    return { user }
  }
}
