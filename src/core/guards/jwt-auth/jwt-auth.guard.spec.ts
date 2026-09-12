jest.mock('@nestjs/jwt', () => ({
  JwtService: class {
    verifyAsync = jest.fn()
  },
}))

import { JwtService } from '@nestjs/jwt'
import { JwtAuthGuard } from './jwt-auth.guard'
import { Reflector } from '@nestjs/core'
import { ExecutionContext } from '@nestjs/common'

describe('JwtAuthGuard', () => {
  let jwtService: JwtService
  let reflector: Reflector
  let guard: JwtAuthGuard

  beforeEach(() => {
    jwtService = new JwtService()
    reflector = new Reflector()

    guard = new JwtAuthGuard(reflector, jwtService)
  })

  it('should be defined', () => {
    expect(new JwtAuthGuard(reflector, jwtService)).toBeDefined()
  })

  describe('canActivate', () => {
    it('should return true for public route', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true)

      const context = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as unknown as ExecutionContext

      await expect(guard.canActivate(context)).resolves.toBe(true)
    })

    it('should throw UnauthorizedException when access token is missing', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false)

      const request = {
        cookies: {},
      }

      const context = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(request),
        }),
      } as unknown as ExecutionContext

      await expect(guard.canActivate(context)).rejects.toThrow(
        'Authentication required',
      )
    })

    it('should return true and set user for valid token', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false)

      const request = {
        cookies: {
          access_token: 'valid-token',
        },
        user: {},
      }

      const context = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(request),
        }),
      } as unknown as ExecutionContext

      jest
        .spyOn(jwtService, 'verifyAsync')
        .mockResolvedValue({ sub: 'user-123' })

      await expect(guard.canActivate(context)).resolves.toBe(true)

      expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid-token')
      expect(request.user).toEqual({
        id: 'user-123',
      })
    })

    it('should throw error for invalid or expired token', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false)

      const request = {
        cookies: {
          access_token: 'invalid-token',
        },
      }

      const context = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(request),
        }),
      } as unknown as ExecutionContext

      jest
        .spyOn(jwtService, 'verifyAsync')
        .mockRejectedValue(new Error('Token expired'))

      await expect(guard.canActivate(context)).rejects.toThrow(
        'Invalid or expired token',
      )

      expect(jwtService.verifyAsync).toHaveBeenCalledWith('invalid-token')
    })
  })
})
