import { JwtService } from '@nestjs/jwt'
import { JwtAuthGuard } from './jwt-auth.guard'
import { Reflector } from '@nestjs/core'

describe('JwtAuthGuard', () => {
  let jwtService: JwtService
  let reflector: Reflector

  beforeEach(() => {
    ;((jwtService = new JwtService()), (reflector = new Reflector()))
  })

  it('should be defined', () => {
    expect(new JwtAuthGuard(reflector, jwtService)).toBeDefined()
  })
})
