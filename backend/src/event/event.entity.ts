import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { EventType } from './event-type.enum';
import { User } from '../auth/user.entity';

@Entity()
export class CoSEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: EventType,
  })
  type: EventType;

  @ManyToOne(() => User, { nullable: true, eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User | null;

  @Column({ nullable: false, type: Boolean, default: false })
  processed: boolean;

  @CreateDateColumn({ name: 'created_on' })
  createdOn: Date;
}
