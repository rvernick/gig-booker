import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { RecurringGig } from './recurring-gig.entity';
import { RecurringGigService } from './recurring-gig.service';
import { FrequencyType } from './frequency-type.enum';
import { DayOfWeek } from './day-of-week.enum';
import { WeekOrdinal } from './week-ordinal.enum';
import { GigTimeOfDay } from './gig-time-of-day.enum';

@Controller('recurring-gig')
export class RecurringGigController {
  constructor(private readonly recurringGigService: RecurringGigService) {}

  @UseGuards(AuthGuard)
  @Get('for-user')
  forUser(@Query('username') username: string): Promise<RecurringGig[]> {
    return this.recurringGigService.recurringGigsForUser(username);
  }

  @UseGuards(AuthGuard)
  @Post('create')
  create(
    @Body()
    body: {
      username: string;
      bandId: number;
      venueId: number;
      frequencyType: FrequencyType;
      dayOfWeek: DayOfWeek;
      weekOrdinal?: WeekOrdinal | null;
      timeOfDay?: GigTimeOfDay;
    },
  ): Promise<RecurringGig> {
    return this.recurringGigService.createRecurringGig(
      body.username,
      Number(body.bandId),
      Number(body.venueId),
      body.frequencyType,
      body.dayOfWeek,
      body.weekOrdinal ?? null,
      body.timeOfDay ?? GigTimeOfDay.NIGHT,
    );
  }

  @UseGuards(AuthGuard)
  @Post('update')
  update(
    @Body()
    body: {
      username: string;
      id: number;
      bandId: number;
      venueId: number;
      frequencyType: FrequencyType;
      dayOfWeek: DayOfWeek;
      weekOrdinal?: WeekOrdinal | null;
      timeOfDay?: GigTimeOfDay;
    },
  ): Promise<RecurringGig> {
    return this.recurringGigService.updateRecurringGig(
      body.username,
      Number(body.id),
      Number(body.bandId),
      Number(body.venueId),
      body.frequencyType,
      body.dayOfWeek,
      body.weekOrdinal ?? null,
      body.timeOfDay ?? GigTimeOfDay.NIGHT,
    );
  }

  @UseGuards(AuthGuard)
  @Post('delete')
  delete(@Body() body: { username: string; id: number }): Promise<void> {
    return this.recurringGigService.deleteRecurringGig(body.username, Number(body.id));
  }
}
