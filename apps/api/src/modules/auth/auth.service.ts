import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { RegisterDto } from './dto/register.dto'
import { UserService } from '../user/user.service'
import * as argon2 from 'argon2'
import { LoginDto } from './dto/login.dto'
import { JwtService } from '@nestjs/jwt'
import { User } from '../user/entity/user.entity'

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase()

    const userExist = await this.userService.findByEmail(email)
    if (userExist) {
      throw new ConflictException('Email is already registered')
    }

    const passwordHash = await argon2.hash(dto.password)

    const user = await this.userService.createUser({
      name: dto.name.trim(),
      email,
      passwordHash,
    })

    const accessToken = await this.generateAccessToken(user.id)

    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl
      },
    }
  }

  async login(dto: LoginDto) {
    const user = await this.userService.findByEmailWithPassword(dto.email)
    if (!user) {
      throw new UnauthorizedException('Invalid email or password')
    }

    const passwordValid = await argon2.verify(user.passwordHash, dto.password)

    if (!passwordValid) {
      throw new UnauthorizedException('Invalid email or password')
    }

    const accessToken = await this.generateAccessToken(user.id)

    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl
      },
    }
  }

  private generateAccessToken(userId: string): Promise<string> {
    return this.jwtService.signAsync({
      sub: userId,
    })
  }

  async getCurrentUser(userId: string): Promise<User | null> {
    const user = await this.userService.findById(userId)
    return user
  }
}
