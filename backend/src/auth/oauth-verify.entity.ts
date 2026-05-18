import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
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
export class OAuthVerify {
  constructor() {}

  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    nullable: false,
    default: '000000',
  })
  code: string;

  @ManyToOne(() => User, { nullable: true, cascade: false, eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'varchar',
    nullable: false,
    default: 'strava',
  })
  target: string;

  @Column({ name: 'expires_on' })
  expiresOn: Date;

  @CreateDateColumn({ name: 'created_on' })
  createdOn: Date;

  // this is created by a call  Should we have a flag to say verified to allow the user to log in?
}
