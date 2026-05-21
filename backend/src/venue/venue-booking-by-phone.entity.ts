import { ChildEntity, Column } from 'typeorm';
import { BookingMethodType } from './booking-method-type.enum';
import { VenueBookingInstructions } from './venue-booking-instructions.entity';

@ChildEntity(BookingMethodType.PHONE)
export class VenueBookingByPhone extends VenueBookingInstructions {
  @Column({ type: 'varchar', length: 50, name: 'phone_number', nullable: false })
  phoneNumber: string;

  @Column({ type: 'varchar', length: 255, name: 'contact_name', nullable: true })
  contactName: string | null;

  @Column({ type: 'varchar', length: 255, name: 'best_time_to_call', nullable: true })
  bestTimeToCall: string | null;
}
