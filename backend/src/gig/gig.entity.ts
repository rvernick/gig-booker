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

@Entity({ name: 'gig' })
export class Gig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date', nullable: false })
  date: string;

  @Column({ type: 'varchar', length: 10, name: 'start_time', nullable: false })
  startTime: string;

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
