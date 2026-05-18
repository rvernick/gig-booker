/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  Column,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Household {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(() => User, (user) => user.household, {
    eager: false,
    cascade: true,
  })
  users: User[];

  @Column({
    type: 'varchar',
    nullable: true,
    name: 'entering_instructions',
  })
  enteringInstructions: string | null;

  @DeleteDateColumn({
    name: 'deleted_on',
  })
  deletedOn: boolean;

  @CreateDateColumn({
    name: 'created_on',
  })
  createdOn: Date;

  @UpdateDateColumn({
    name: 'updated_on',
  })
  updatedOn: Date;
}
