import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { JwtService } from '@nestjs/jwt'
import { IS_PUBLIC_KEY } from '../../decorators/public.decorator'
import { AuthenticatedRequest } from '../../interfaces/authenticated-request.interface'

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (isPublic) return true

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>()

    const token = request.cookies?.access_token

    if (!token) {
      throw new UnauthorizedException('Authentication required')
    }

    try {
      const payload = await this.jwtService.verifyAsync(token)
      request.user = { id: payload.sub }

      return true
    } catch (error) {
      throw new Error('Invalid or expired token')
    }
  }
}
