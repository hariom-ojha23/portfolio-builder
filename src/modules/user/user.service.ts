import { Injectable } from '@nestjs/common'
import { User } from './entity/user.entity'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { SnowflakeService } from '../../core/snowflake/snowflake.service'
import { CreateUserDto } from './dto/create-user.dto'

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

  async findById(id: string): Promise<User | null> {
    return this.userRepo.findOneBy({ id })
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
}
