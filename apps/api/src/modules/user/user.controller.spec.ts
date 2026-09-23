jest.mock('@nestjs/typeorm', () => ({ InjectRepository: () => () => {} }))

import { UserController } from './user.controller'
import { UserService } from './user.service'

describe('UserController', () => {
  let controller: UserController
  let service: jest.Mocked<UserService>

  beforeEach(async () => {
    service = {} as unknown as jest.Mocked<UserService>
    controller = new UserController(service)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
