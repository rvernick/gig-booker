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
import { HelpRequest } from './help-request';

enum HelpOfferState {
  SCHEDULED = 'Scheduled',
  REJECTED = 'Rejected',
  STARTED = 'Started',
  DONE = 'Done',
}

@Entity()
export class HelpOffer {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ name: 'user_id', nullable: false, default: 1 })
  userId: number;

  @ManyToOne(() => User, { nullable: false, eager: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => HelpRequest, { nullable: false, eager: true })
  @JoinColumn({ name: 'run_offer_id' })
  helpRequest: HelpRequest;

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
    enum: HelpOfferState,
    default: HelpOfferState.SCHEDULED,
  })
  state: HelpOfferState;

  @CreateDateColumn({ name: 'created_on' })
  createdOn: Date;

  @UpdateDateColumn({ name: 'updated_on' })
  updatedOn: Date;

  @DeleteDateColumn({ name: 'deleted_on' })
  deletedOn: Date;
}
