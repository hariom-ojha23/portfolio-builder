import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm'
import { User } from '../../user/entity/user.entity'
import type { PortfolioConfig } from '../../../core/interfaces/portfolio-config.interface'

@Entity('portfolios')
export class Portfolio {
  @PrimaryColumn({ type: 'varchar', length: 25 })
  id!: string

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User

  @Column({ type: 'varchar', length: 25, unique: true })
  userId!: string

  @Column({ type: 'jsonb' })
  data!: PortfolioConfig

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  templateId!: string | null

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date
}
