import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { Venue } from './venue.entity';
import { VenueService } from './venue.service';
import { VenueBookingInstructions } from './venue-booking-instructions.entity';
import { BookingMethodType } from './booking-method-type.enum';

type LocationDto = {
  id?: number;
  displayName: string;
  formattedAddress: string;
  placeId: string;
  types: string[];
  coordinates: { type: string; coordinates: number[] };
};

type VenueCreateDto = {
  username: string;
  name: string | null;
  location: LocationDto;
  website: string | null;
  bookingContact: string | null;
  size: string;
  musicTypes: string[];
};

type VenueUpdateDto = {
  username: string;
  id: number;
  name: string | null;
  location?: LocationDto | null;
  website: string | null;
  bookingContact: string | null;
  size: string;
  musicTypes: string[];
};

type VenueUpsertDto = {
  username: string;
  id?: number;
  name: string | null;
  location?: LocationDto | null;
  website: string | null;
  bookingContact: string | null;
  size: string;
  musicTypes: string[];
};

type BookingInstructionsUpsertDto = {
  username: string;
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

@Controller('venue')
export class VenueController {
  constructor(private readonly venueService: VenueService) {}

  @UseGuards(AuthGuard)
  @Get('all')
  all(@Query('username') username: string): Promise<Venue[]> {
    return this.venueService.all();
  }

  @UseGuards(AuthGuard)
  @Get('by-id')
  byId(@Query('id') id: number, @Query('username') username: string): Promise<Venue> {
    return this.venueService.byId(Number(id));
  }

  @UseGuards(AuthGuard)
  @Post('create')
  create(
    @Body()
    body: VenueCreateDto,
  ): Promise<Venue> {
    return this.venueService.create({
      name: body.name ?? null,
      location: body.location,
      website: body.website,
      bookingContact: body.bookingContact,
      size: body.size,
      musicTypes: body.musicTypes,
    });
  }

  @UseGuards(AuthGuard)
  @Post('update')
  update(
    @Body()
    body: VenueUpdateDto,
  ): Promise<Venue> {
    return this.venueService.update({
      id: Number(body.id),
      name: body.name ?? null,
      location: body.location,
      website: body.website,
      bookingContact: body.bookingContact,
      size: body.size,
      musicTypes: body.musicTypes,
    });
  }

  @UseGuards(AuthGuard)
  @Post('upsert')
  upsert(
    @Body()
    body: VenueUpsertDto,
  ): Promise<Venue> {
    return this.venueService.upsert({
      id: Number(body.id ?? 0),
      name: body.name ?? null,
      location: body.location ?? null,
      website: body.website ?? null,
      bookingContact: body.bookingContact ?? null,
      size: body.size,
      musicTypes: body.musicTypes ?? [],
    });
  }

  @UseGuards(AuthGuard)
  @Get('booking-instructions')
  getBookingInstructions(
    @Query('venueId') venueId: number,
    @Query('username') _username: string,
  ): Promise<VenueBookingInstructions | null> {
    return this.venueService.getBookingInstructions(Number(venueId));
  }

  @UseGuards(AuthGuard)
  @Post('booking-instructions/upsert')
  upsertBookingInstructions(@Body() body: BookingInstructionsUpsertDto): Promise<VenueBookingInstructions> {
    return this.venueService.upsertBookingInstructions({
      venueId: Number(body.venueId),
      type: body.type,
      generalNotes: body.generalNotes ?? null,
      notes: body.notes ?? null,
      bodyTemplate: body.bodyTemplate ?? null,
      phoneNumber: body.phoneNumber ?? null,
      contactName: body.contactName ?? null,
      bestTimeToCall: body.bestTimeToCall ?? null,
      emailAddress: body.emailAddress ?? null,
      subjectTemplate: body.subjectTemplate ?? null,
      url: body.url ?? null,
      streetAddress: body.streetAddress ?? null,
      city: body.city ?? null,
      state: body.state ?? null,
      postalCode: body.postalCode ?? null,
      country: body.country ?? null,
    });
  }

  @UseGuards(AuthGuard)
  @Get('favorites')
  getFavorites(@Query('username') username: string): Promise<Venue[]> {
    return this.venueService.getFavorites(username);
  }

  @UseGuards(AuthGuard)
  @Get('is-favorite')
  isFavorite(@Query('username') username: string, @Query('venueId') venueId: number): Promise<boolean> {
    return this.venueService.isFavorite(username, Number(venueId));
  }

  @UseGuards(AuthGuard)
  @Post('favorite/add')
  addFavorite(@Body('username') username: string, @Body('venueId') venueId: number): Promise<void> {
    return this.venueService.addFavorite(username, Number(venueId));
  }

  @UseGuards(AuthGuard)
  @Post('favorite/remove')
  removeFavorite(@Body('username') username: string, @Body('venueId') venueId: number): Promise<void> {
    return this.venueService.removeFavorite(username, Number(venueId));
  }
}
