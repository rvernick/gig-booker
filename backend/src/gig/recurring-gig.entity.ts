import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Band } from '../band/band.entity';
import { Venue } from '../venue/venue.entity';
import { FrequencyType } from './frequency-type.enum';
import { DayOfWeek } from './day-of-week.enum';
import { WeekOrdinal } from './week-ordinal.enum';
import { GigTimeOfDay } from './gig-time-of-day.enum';

@Entity({ name: 'recurring_gig' })
export class RecurringGig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'band_id', type: 'int', nullable: false })
  bandId: number;

  @ManyToOne(() => Band, { nullable: false, eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'band_id' })
  band: Band;

  @Column({ name: 'venue_id', type: 'int', nullable: false })
  venueId: number;

  @ManyToOne(() => Venue, { nullable: false, eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'venue_id' })
  venue: Venue;

  @Column({ type: 'enum', enum: FrequencyType, name: 'frequency_type' })
  frequencyType: FrequencyType;

  @Column({ type: 'enum', enum: DayOfWeek, name: 'day_of_week' })
  dayOfWeek: DayOfWeek;

  // Only set for monthly frequency: which occurrence of dayOfWeek in the month
  @Column({ type: 'enum', enum: WeekOrdinal, name: 'week_ordinal', nullable: true })
  weekOrdinal: WeekOrdinal | null;

  @Column({
    type: 'enum',
    enum: GigTimeOfDay,
    name: 'time_of_day',
    default: GigTimeOfDay.NIGHT,
  })
  timeOfDay: GigTimeOfDay;

  @DeleteDateColumn({
    name: 'deleted_on',
    nullable: true,
  })
  deletedOn: Date | null;

  @CreateDateColumn({ name: 'created_on' })
  createdOn: Date;

  @UpdateDateColumn({ name: 'updated_on' })
  updatedOn: Date;
}
