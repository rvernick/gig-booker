/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '../auth/auth.guard';
import { Band } from './band.entity';
import { BandService } from './band.service';
import { fiveMB } from '../utils/utils';

@Controller('band')
export class BandController {
  constructor(private readonly bandService: BandService) {}

  @UseGuards(AuthGuard)
  @Get('by-user')
  bandsForUser(@Query('username') username: string): Promise<Band[]> {
    return this.bandService.bandsForUser(username);
  }

  @UseGuards(AuthGuard)
  @Get('by-id')
  bandById(@Query('username') username: string, @Query('id') id: number): Promise<Band> {
    return this.bandService.bandByIdForUser(username, Number(id));
  }

  @UseGuards(AuthGuard)
  @Post('update')
  updateBand(@Body() body: { username: string; id: number; name: string }): Promise<Band> {
    return this.bandService.updateBandForUser(body.username, Number(body.id), body.name);
  }

  @UseGuards(AuthGuard)
  @Post('create')
  createBand(@Body() body: { username: string; name: string }): Promise<Band> {
    return this.bandService.createBandForUser(body.username, body.name);
  }

  @UseGuards(AuthGuard)
  @Post('upsert')
  upsertBand(@Body() body: { username: string; id?: number; name: string }): Promise<Band> {
    return this.bandService.upsertBandForUser(body.username, Number(body.id ?? 0), body.name);
  }

  @UseGuards(AuthGuard)
  @Get('members')
  members(@Query('username') username: string, @Query('bandId') bandId: number) {
    return this.bandService.membersForBand(username, Number(bandId));
  }

  @UseGuards(AuthGuard)
  @Post('add-member')
  addMember(@Body() body: { username: string; bandId: number; memberUsername: string }) {
    return this.bandService.addMemberToBand(body.username, Number(body.bandId), body.memberUsername);
  }

  @UseGuards(AuthGuard)
  @Post('remove-member')
  removeMember(@Body() body: { username: string; bandId: number; memberUsername: string }) {
    return this.bandService.removeMemberFromBand(body.username, Number(body.bandId), body.memberUsername);
  }

  @UseGuards(AuthGuard)
  @Post('upload-photo')
  @UseInterceptors(FileInterceptor('file'))
  uploadBandPhoto(
    @UploadedFile() file: Express.Multer.File,
    @Body('username') username: string,
    @Body('bandId') bandId: string,
  ): Promise<Band> {
    if (!file) {
      throw new BadRequestException('File required');
    }
    if (file.size > fiveMB) {
      throw new BadRequestException('File size exceeds 5MB limit');
    }
    return this.bandService.updateBandPhoto(username, Number(bandId), file);
  }
}
