import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { Gig } from './gig.entity';
import { GigService } from './gig.service';

@Controller('gig')
export class GigController {
  constructor(private readonly gigService: GigService) {}

  @UseGuards(AuthGuard)
  @Get('upcoming')
  upcomingGigs(@Query('username') username: string): Promise<Gig[]> {
    return this.gigService.upcomingGigsForUser(username);
  }

  @UseGuards(AuthGuard)
  @Post('create')
  createGig(
    @Body() body: { username: string; bandId: number; venueId: number; date: string; startTime: string },
  ): Promise<Gig> {
    return this.gigService.createGig(
      body.username,
      Number(body.bandId),
      Number(body.venueId),
      body.date,
      body.startTime,
    );
  }

  @UseGuards(AuthGuard)
  @Post('update')
  updateGig(
    @Body() body: { username: string; id: number; bandId: number; venueId: number; date: string; startTime: string },
  ): Promise<Gig> {
    return this.gigService.updateGig(
      body.username,
      Number(body.id),
      Number(body.bandId),
      Number(body.venueId),
      body.date,
      body.startTime,
    );
  }

  @UseGuards(AuthGuard)
  @Post('delete')
  deleteGig(@Body() body: { username: string; id: number }): Promise<void> {
    return this.gigService.deleteGig(body.username, Number(body.id));
  }
}
