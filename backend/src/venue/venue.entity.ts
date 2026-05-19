import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { GeographicLocation } from '../common/geographic-location.entity';
import { VenueSocialLink } from './venue-social-link.entity';
import { VenueSize } from './venue-size.enum';
import { VenueBookingInstructions } from './venue-booking-instructions.entity';

@Entity({ name: 'venue' })
export class Venue {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 512, name: 'name', nullable: true })
  name: string | null;

  @Column({ name: 'location_id', type: 'int', nullable: false })
  locationId: number;

  @OneToOne(() => GeographicLocation, {
    nullable: false,
    cascade: false,
    eager: true,
  })
  @JoinColumn({ name: 'location_id' })
  location: GeographicLocation;

  @Column({ type: 'varchar', length: 2048, name: 'website', nullable: true })
  website: string | null;

  @OneToMany(() => VenueSocialLink, (link) => link.venue, { eager: false })
  socials: VenueSocialLink[];

  @Column({
    type: 'varchar',
    length: 512,
    name: 'booking_contact',
    nullable: true,
  })
  bookingContact: string | null;

  @Column({
    type: 'enum',
    enum: VenueSize,
    name: 'size',
  })
  size: VenueSize;

  @Column({ type: 'text', array: true, nullable: false, default: '{}' })
  musicTypes: string[];

  @OneToOne(() => VenueBookingInstructions, (instructions) => instructions.venue, { eager: false })
  bookingInstructions: VenueBookingInstructions | null;

  @CreateDateColumn({ name: 'created_on' })
  createdOn: Date;

  @UpdateDateColumn({ name: 'updated_on' })
  updatedOn: Date;
}
