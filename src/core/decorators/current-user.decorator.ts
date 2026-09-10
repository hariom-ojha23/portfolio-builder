import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { AuthenticatedRequest } from '../interfaces/authenticated-request.interface'

export const CurrentUserId = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const request: AuthenticatedRequest = ctx.switchToHttp().getRequest()
  return request.user.id
})
