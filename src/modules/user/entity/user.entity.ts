import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm'
import { Portfolio } from '../../portfolio/entity/portfolio.entity'

@Entity('users')
export class User {
  @PrimaryColumn({ type: 'varchar', length: 25 })
  id!: string

  @Column({ type: 'varchar', length: 100 })
  name!: string

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string

  @Column({ type: 'text', select: false })
  passwordHash!: string

  @Column({ type: 'boolean', default: true })
  isActive!: boolean

  @Column({ type: 'text', nullable: true })
  avatarUrl?: string

  @OneToMany(() => Portfolio, (portfolio) => portfolio.user)
  portfolios!: Portfolio[]

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date
}
