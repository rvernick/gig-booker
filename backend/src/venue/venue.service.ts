/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Venue } from './venue.entity';
import { GeographicLocation } from '../common/geographic-location.entity';
import { VenueBookingInstructions } from './venue-booking-instructions.entity';
import { VenueBookingByPhone } from './venue-booking-by-phone.entity';
import { VenueBookingByEmail } from './venue-booking-by-email.entity';
import { VenueBookingByWebForm } from './venue-booking-by-web-form.entity';
import { VenueBookingBySnailMail } from './venue-booking-by-snail-mail.entity';
import { BookingMethodType } from './booking-method-type.enum';
import { UserFavoriteVenue } from './user-favorite-venue.entity';
import { User } from '../auth/user.entity';

export type BookingInstructionsUpsertArgs = {
  venueId: number;
  type: BookingMethodType;
  generalNotes?: string | null;
  notes?: string | null;
  bodyTemplate?: string | null;
  phoneNumber?: string | null;
  contactName?: string | null;
  bestTimeToCall?: string | null;
  emailAddress?: string | null;
  subjectTemplate?: string | null;
  url?: string | null;
  streetAddress?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
};

@Injectable()
export class VenueService {
  constructor(
    @InjectRepository(Venue) private readonly venueRepo: Repository<Venue>,
    @InjectRepository(GeographicLocation) private readonly locationRepo: Repository<GeographicLocation>,
    @InjectRepository(VenueBookingInstructions) private readonly bookingRepo: Repository<VenueBookingInstructions>,
    @InjectRepository(UserFavoriteVenue) private readonly favoriteRepo: Repository<UserFavoriteVenue>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async all(): Promise<Venue[]> {
    return this.venueRepo.find({ order: { updatedOn: 'DESC' } });
  }

  async byId(id: number): Promise<Venue> {
    const venue = await this.venueRepo.findOne({ where: { id } });
    if (!venue) throw new NotFoundException('Venue not found');
    return venue;
  }

  async create(args: {
    name: string | null;
    location: any;
    website: string | null;
    bookingContact: string | null;
    size: any;
    musicTypes: string[];
  }): Promise<Venue> {
    const location = await this.upsertLocation(args.location);
    if (!location) throw new NotFoundException('Location required');
    const venue = this.venueRepo.create({
      name: args.name ?? null,
      locationId: location.id,
      location,
      website: args.website ?? null,
      bookingContact: args.bookingContact ?? null,
      size: args.size,
      musicTypes: args.musicTypes ?? [],
    });
    return this.venueRepo.save(venue);
  }

  async update(args: {
    id: number;
    name: string | null;
    location?: any | null;
    website: string | null;
    bookingContact: string | null;
    size: any;
    musicTypes: string[];
  }): Promise<Venue> {
    const venue = await this.byId(args.id);
    venue.name = args.name ?? null;
    if (args.location) {
      const location = await this.upsertLocation(args.location);
      if (location) {
        venue.locationId = location.id;
        venue.location = location;
      }
    }
    venue.website = args.website ?? null;
    venue.bookingContact = args.bookingContact ?? null;
    venue.size = args.size;
    venue.musicTypes = args.musicTypes ?? [];
    return this.venueRepo.save(venue);
  }

  async upsert(args: {
    id: number;
    name: string | null;
    location?: any | null;
    website: string | null;
    bookingContact: string | null;
    size: any;
    musicTypes: string[];
  }): Promise<Venue> {
    if (args.id && args.id > 0) {
      return this.update({
        id: args.id,
        name: args.name ?? null,
        location: args.location,
        website: args.website ?? null,
        bookingContact: args.bookingContact ?? null,
        size: args.size,
        musicTypes: args.musicTypes ?? [],
      });
    }
    return this.create({
      name: args.name ?? null,
      location: args.location,
      website: args.website ?? null,
      bookingContact: args.bookingContact ?? null,
      size: args.size,
      musicTypes: args.musicTypes ?? [],
    });
  }

  async getBookingInstructions(venueId: number): Promise<VenueBookingInstructions | null> {
    return this.bookingRepo.findOne({ where: { venueId } });
  }

  async upsertBookingInstructions(args: BookingInstructionsUpsertArgs): Promise<VenueBookingInstructions> {
    const existing = await this.bookingRepo.findOne({ where: { venueId: args.venueId } });
    if (existing && existing.type !== args.type) {
      await this.bookingRepo.delete(existing.id);
    }
    const record = existing && existing.type === args.type ? existing : this.buildTypedInstructions(args.type);
    record.venueId = args.venueId;
    record.generalNotes = args.generalNotes ?? null;
    record.notes = args.notes ?? null;
    record.bodyTemplate = args.bodyTemplate ?? null;
    this.applyTypeFields(record, args);
    return this.bookingRepo.save(record);
  }

  async getFavorites(username: string): Promise<Venue[]> {
    const user = await this.userRepo.findOne({ where: { username } });
    if (!user) throw new NotFoundException('User not found');
    const favorites = await this.favoriteRepo.find({ where: { userId: user.id } });
    return favorites.map((f) => f.venue);
  }

  async isFavorite(username: string, venueId: number): Promise<boolean> {
    const user = await this.userRepo.findOne({ where: { username } });
    if (!user) return false;
    const count = await this.favoriteRepo.count({ where: { userId: user.id, venueId } });
    return count > 0;
  }

  async addFavorite(username: string, venueId: number): Promise<void> {
    const user = await this.userRepo.findOne({ where: { username } });
    if (!user) throw new NotFoundException('User not found');
    await this.venueRepo.findOneOrFail({ where: { id: venueId } });
    const existing = await this.favoriteRepo.findOne({ where: { userId: user.id, venueId } });
    if (existing) return;
    const favorite = this.favoriteRepo.create({ userId: user.id, venueId });
    await this.favoriteRepo.save(favorite);
  }

  async removeFavorite(username: string, venueId: number): Promise<void> {
    const user = await this.userRepo.findOne({ where: { username } });
    if (!user) throw new NotFoundException('User not found');
    await this.favoriteRepo.delete({ userId: user.id, venueId });
  }

  private buildTypedInstructions(type: BookingMethodType): VenueBookingInstructions {
    switch (type) {
      case BookingMethodType.PHONE:
        return new VenueBookingByPhone();
      case BookingMethodType.EMAIL:
        return new VenueBookingByEmail();
      case BookingMethodType.WEB_FORM:
        return new VenueBookingByWebForm();
      case BookingMethodType.SNAIL_MAIL:
        return new VenueBookingBySnailMail();
    }
  }

  private applyTypeFields(record: VenueBookingInstructions, args: BookingInstructionsUpsertArgs): void {
    if (record instanceof VenueBookingByPhone) {
      record.phoneNumber = args.phoneNumber ?? '';
      record.contactName = args.contactName ?? null;
      record.bestTimeToCall = args.bestTimeToCall ?? null;
    } else if (record instanceof VenueBookingByEmail) {
      record.emailAddress = args.emailAddress ?? '';
      record.contactName = args.contactName ?? null;
      record.subjectTemplate = args.subjectTemplate ?? null;
    } else if (record instanceof VenueBookingByWebForm) {
      record.url = args.url ?? '';
    } else if (record instanceof VenueBookingBySnailMail) {
      record.contactName = args.contactName ?? null;
      record.streetAddress = args.streetAddress ?? '';
      record.city = args.city ?? '';
      record.state = args.state ?? null;
      record.postalCode = args.postalCode ?? null;
      record.country = args.country ?? 'US';
    }
  }

  private async upsertLocation(locationInfo: any): Promise<GeographicLocation | null> {
    if (!locationInfo) return null;
    if (locationInfo.id && locationInfo.id > 0) {
      return this.locationRepo.findOneBy({ id: locationInfo.id });
    }
    const location = this.locationRepo.create();
    location.displayName = locationInfo.displayName;
    location.formattedAddress = locationInfo.formattedAddress;
    location.placeId = locationInfo.placeId;
    location.types = locationInfo.types;
    location.coordinates = locationInfo.coordinates;
    return this.locationRepo.save(location);
  }
}
