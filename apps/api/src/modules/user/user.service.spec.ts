jest.mock('@nestjs/typeorm', () => ({ InjectRepository: () => () => {} }))

import { UserService } from './user.service'
import { SnowflakeService } from '../../core/snowflake/snowflake.service'
import { Repository } from 'typeorm'
import { User } from './entity/user.entity'

describe('UserService', () => {
  let service: UserService
  let snowflakeService: jest.Mocked<SnowflakeService>
  let userRepo: jest.Mocked<Repository<User>>

  beforeEach(() => {
    userRepo = {} as unknown as jest.Mocked<Repository<User>>
    snowflakeService = {
      generate: jest.fn(),
    } as unknown as jest.Mocked<SnowflakeService>

    service = new UserService(userRepo, snowflakeService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
