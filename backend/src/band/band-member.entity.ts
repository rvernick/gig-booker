import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../auth/user.entity';
import { Band } from './band.entity';

@Entity({ name: 'band_member' })
@Index(['bandId', 'userId'], { unique: true })
export class BandMember {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'band_id', type: 'int', nullable: false })
  bandId: number;

  @ManyToOne(() => Band, (band) => band.members, {
    nullable: false,
    eager: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'band_id' })
  band: Band;

  @Column({ name: 'user_id', type: 'int', nullable: false })
  userId: number;

  @ManyToOne(() => User, (user) => user.bandMemberships, {
    nullable: false,
    eager: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'text', array: true, nullable: false, default: '{}' })
  permissions: string[];

  @CreateDateColumn({ name: 'created_on' })
  createdOn: Date;

  @UpdateDateColumn({ name: 'updated_on' })
  updatedOn: Date;
}
