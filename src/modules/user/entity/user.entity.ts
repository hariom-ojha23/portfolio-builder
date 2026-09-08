import { Entity, PrimaryColumn } from "typeorm";


@Entity()
export class User {
  @PrimaryColumn({ type: 'bigint' })
  id!: number

  
}