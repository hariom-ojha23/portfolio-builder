import { SnowflakeService } from './snowflake.service'

describe('SnowflakeService', () => {
  let service: SnowflakeService

  beforeEach(() => {
    process.env.SNOWFLAKE_WORKER_ID = '1'
    service = new SnowflakeService()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should generate a bigint ID', () => {
    const id = service.generate()
    expect(typeof id).toBe('bigint')
  })

  it('should generate unique IDs', () => {
    const ids = new Set<bigint>()

    for (let i = 0; i < 10_000; i++) {
      ids.add(service.generate())
    }

    expect(ids.size).toBe(10_000)
  })

  it('should generate increasing IDs', () => {
    const id1 = service.generate()
    const id2 = service.generate()
    const id3 = service.generate()

    expect(id2).toBeGreaterThan(id1)
    expect(id3).toBeGreaterThan(id2)
  })
})
