import { ChildEntity, Column } from 'typeorm';
import { BookingMethodType } from './booking-method-type.enum';
import { VenueBookingInstructions } from './venue-booking-instructions.entity';

@ChildEntity(BookingMethodType.SNAIL_MAIL)
export class VenueBookingBySnailMail extends VenueBookingInstructions {
  @Column({ type: 'varchar', length: 255, name: 'contact_name', nullable: true })
  contactName: string | null;

  @Column({ type: 'varchar', length: 512, name: 'street_address', nullable: false })
  streetAddress: string;

  @Column({ type: 'varchar', length: 255, name: 'city', nullable: false })
  city: string;

  @Column({ type: 'varchar', length: 100, name: 'state', nullable: true })
  state: string | null;

  @Column({ type: 'varchar', length: 20, name: 'postal_code', nullable: true })
  postalCode: string | null;

  @Column({ type: 'varchar', length: 100, name: 'country', nullable: false, default: 'US' })
  country: string;
}
