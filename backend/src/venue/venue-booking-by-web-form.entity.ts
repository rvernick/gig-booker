import { ChildEntity, Column } from 'typeorm';
import { BookingMethodType } from './booking-method-type.enum';
import { VenueBookingInstructions } from './venue-booking-instructions.entity';

@ChildEntity(BookingMethodType.WEB_FORM)
export class VenueBookingByWebForm extends VenueBookingInstructions {
  @Column({ type: 'varchar', length: 2048, name: 'url', nullable: false })
  url: string;
}
