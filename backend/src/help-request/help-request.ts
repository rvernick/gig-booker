import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../auth/user.entity';
import { TimeOfDay } from '../common/time-of-day.enum';
import { HelpRequestType } from './help-request-type';

enum HelpRequestState {
  CREATED = 'Created',
  CLAIMED = 'Claimed',
  MISSED = 'Missed',
  DONE = 'Done',
}

@Entity()
export class HelpRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ name: 'user_id', nullable: false, default: 1 })
  userId: number;

  @ManyToOne(() => User, { nullable: false, eager: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'date', name: 'start_date', nullable: false })
  startDate: Date;

  @Column({
    type: 'enum',
    enum: TimeOfDay,
    default: TimeOfDay.MID_DAY,
    name: 'time_of_day',
  })
  timeOfDay: TimeOfDay;

  @Column({
    type: 'enum',
    enum: HelpRequestType,
    default: HelpRequestType.PACKAGE,
    name: 'help_request_type',
    nullable: false,
  })
  type: HelpRequestType;

  @Column({
    type: 'enum',
    enum: HelpRequestState,
    default: HelpRequestState.CREATED,
  })
  state: HelpRequestState;

  @Column({ type: 'integer', name: 'runner_pay_cents', default: 0 })
  runnerPayInCents: number;

  @CreateDateColumn({ name: 'created_on' })
  createdOn: Date;

  @UpdateDateColumn({ name: 'updated_on' })
  updatedOn: Date;

  @DeleteDateColumn({
    name: 'deleted_on',
    nullable: true,
  })
  deletedOn: Date | null;
}
