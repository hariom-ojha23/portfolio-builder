import { Injectable, NotFoundException } from '@nestjs/common'
import { User } from './entity/user.entity'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { SnowflakeService } from '../../core/snowflake/snowflake.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { UserProfile } from '../../core/interfaces/user-profile.interface'

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly snowflakeService: SnowflakeService,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOneBy({ email })
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.userRepo.findOne({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        passwordHash: true,
      },
    })
  }

  async findById(userId: string): Promise<User | null> {
    return this.userRepo.findOneBy({ id: userId })
  }

  async getUserProfile(userId: string): Promise<UserProfile> {
    const user = await this.findById(userId)

    if (!user) {
      throw new NotFoundException('User not found')
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      isActive: user.isActive,
    }
  }

  async createUser(dto: CreateUserDto): Promise<User> {
    const user = this.userRepo.create({
      id: this.snowflakeService.generate().toString(),
      name: dto.name,
      email: dto.email,
      passwordHash: dto.passwordHash,
    })

    return this.userRepo.save(user)
  }

  async updateUserProfile(
    userId: string,
    dto: UpdateUserDto,
  ): Promise<UserProfile> {
    const user = await this.findById(userId)
    if (!user) {
      throw new NotFoundException('User not found')
    }

    Object.assign(user, dto)

    await this.userRepo.save(user)

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      isActive: user.isActive,
    }
  }
}
