import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  TableInheritance,
  UpdateDateColumn,
} from 'typeorm';
import { BookingMethodType } from './booking-method-type.enum';
import { Venue } from './venue.entity';

@Entity({ name: 'venue_booking_instructions' })
@TableInheritance({ column: { type: 'enum', enum: BookingMethodType, name: 'type' } })
export class VenueBookingInstructions {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({ name: 'venue_id', type: 'int', nullable: false })
  venueId: number;

  @OneToOne(() => Venue, (venue) => venue.bookingInstructions, {
    nullable: false,
    eager: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'venue_id' })
  venue: Venue;

  @Column({ type: 'enum', enum: BookingMethodType, name: 'type' })
  type: BookingMethodType;

  @Column({ type: 'text', name: 'body_template', nullable: true })
  bodyTemplate: string | null;

  @Column({ type: 'text', name: 'general_notes', nullable: true })
  generalNotes: string | null;

  @Column({ type: 'text', name: 'notes', nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_on' })
  createdOn: Date;

  @UpdateDateColumn({ name: 'updated_on' })
  updatedOn: Date;
}
