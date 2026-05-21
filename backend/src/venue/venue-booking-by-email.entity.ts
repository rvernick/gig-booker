import { ChildEntity, Column } from 'typeorm';
import { BookingMethodType } from './booking-method-type.enum';
import { VenueBookingInstructions } from './venue-booking-instructions.entity';

@ChildEntity(BookingMethodType.EMAIL)
export class VenueBookingByEmail extends VenueBookingInstructions {
  @Column({ type: 'varchar', length: 512, name: 'email_address', nullable: false })
  emailAddress: string;

  @Column({ type: 'varchar', length: 255, name: 'contact_name', nullable: true })
  contactName: string | null;

  @Column({ type: 'varchar', length: 512, name: 'subject_template', nullable: true })
  subjectTemplate: string | null;
}
