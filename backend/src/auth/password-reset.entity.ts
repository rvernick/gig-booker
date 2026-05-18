import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { devLog } from '../utils/utils';

export const createToken = (user: User): string => {
  if (user == null) return '';
  const now = new Date();
  const starter = user.username + now.getTime();
  devLog(starter);
  const result = bcrypt.hashSync(starter, 4);
  return result.replace(/[^a-zA-Z0-9 ]/g, '');
};

@Entity()
export class PasswordReset {
  constructor(aUser: User, aToken: string, anExpiration: Date) {
    this.user = aUser;
    this.token = aToken;
    this.expiresOn = anExpiration;
  }

  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  token: string;

  @Column({ name: 'user_id', default: 1 })
  userId: number;

  @ManyToOne(() => User, { nullable: false, cascade: false, eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  expiresOn: Date;

  @DeleteDateColumn()
  deletedOn: boolean;

  @CreateDateColumn()
  createdOn: Date;

  @UpdateDateColumn()
  updatedOn: Date;
}
