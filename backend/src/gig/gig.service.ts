import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Gig } from './gig.entity';
import { BandMember } from '../band/band-member.entity';
import { User } from '../auth/user.entity';
import { devLog } from '../utils/utils';
import { Band } from '../band/band.entity';
import { Venue } from '../venue/venue.entity';

@Injectable()
export class GigService {
  constructor(
    @InjectRepository(Gig)
    private readonly gigRepo: Repository<Gig>,
    @InjectRepository(Band)
    private readonly bandRepo: Repository<Band>,
    @InjectRepository(Venue)
    private readonly venueRepo: Repository<Venue>,
    @InjectRepository(BandMember)
    private readonly bandMemberRepo: Repository<BandMember>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async upcomingGigsForUser(username: string): Promise<Gig[]> {
    const memberships = await this.bandMemberRepo
      .createQueryBuilder('bm')
      .innerJoin('bm.user', 'user')
      .where('user.username = :username', { username })
      .select('bm.bandId')
      .getMany();

    if (memberships.length === 0) {
      return [];
    }

    const bandIds = memberships.map((m) => m.bandId);
    const today = new Date().toISOString().split('T')[0];

    return this.gigRepo
      .createQueryBuilder('gig')
      .innerJoinAndSelect('gig.band', 'band')
      .innerJoinAndSelect('gig.venue', 'venue')
      .innerJoinAndSelect('venue.location', 'location')
      .where('gig.band_id IN (:...bandIds)', { bandIds })
      .andWhere('gig.date >= :today', { today })
      .andWhere('gig.deleted_on IS NULL')
      .orderBy('gig.date', 'ASC')
      .addOrderBy('gig.start_time', 'ASC')
      .getMany();
  }

  async updateGig(
    username: string,
    id: number,
    bandId: number,
    venueId: number,
    date: string,
    startTime: string,
  ): Promise<Gig> {
    const gig = await this.gigRepo.findOne({ where: { id } });
    if (!gig) throw new NotFoundException('Gig not found');

    const membership = await this.bandMemberRepo
      .createQueryBuilder('bm')
      .innerJoin('bm.user', 'user')
      .where('bm.bandId = :bandId', { bandId: gig.bandId })
      .andWhere('user.username = :username', { username })
      .getOne();

    if (!membership) throw new ForbiddenException('User is not a member of this band');

    if (!date || !startTime) {
      throw new BadRequestException('date and startTime are required');
    }

    const band = await this.bandRepo.findOne({ where: { id: bandId } });
    if (!band) throw new NotFoundException('Band not found ' + bandId);
    const venue = await this.venueRepo.findOne({ where: { id: venueId } });
    if (!venue) throw new NotFoundException('Band not found ' + venueId);

    devLog('Updating gig from: ', gig);
    devLog('bandId to: ', bandId);
    devLog('venueId to: ', venueId);
    devLog('date to: ', date);
    devLog('startTime to: ', startTime);
    gig.band = band;
    gig.venue = venue;
    gig.date = date;
    gig.startTime = startTime;

    const saved = await this.gigRepo.save(gig);

    const full = await this.gigRepo.findOne({ where: { id: saved.id } });
    if (!full) throw new NotFoundException('Gig not found after save');
    return full;
  }

  async deleteGig(username: string, id: number): Promise<void> {
    const gig = await this.gigRepo.findOne({ where: { id } });
    if (!gig) {
      throw new NotFoundException('Gig not found');
    }

    const membership = await this.bandMemberRepo
      .createQueryBuilder('bm')
      .innerJoin('bm.user', 'user')
      .where('bm.bandId = :bandId', { bandId: gig.bandId })
      .andWhere('user.username = :username', { username })
      .getOne();

    if (!membership) {
      throw new ForbiddenException('User is not a member of this band');
    }

    await this.gigRepo.softDelete(id);
  }

  async createGig(username: string, bandId: number, venueId: number, date: string, startTime: string): Promise<Gig> {
    const user = await this.userRepo.findOne({ where: { username: username.toLowerCase() } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const membership = await this.bandMemberRepo
      .createQueryBuilder('bm')
      .innerJoin('bm.user', 'user')
      .where('bm.bandId = :bandId', { bandId })
      .andWhere('user.username = :username', { username })
      .getOne();

    if (!membership) {
      throw new BadRequestException('User is not a member of this band');
    }

    if (!date || !startTime) {
      throw new BadRequestException('date and startTime are required');
    }

    const gig = this.gigRepo.create({ bandId, venueId, date, startTime });
    const saved = await this.gigRepo.save(gig);

    const full = await this.gigRepo.findOne({ where: { id: saved.id } });
    if (!full) throw new NotFoundException('Gig not found after save');
    return full;
  }
}
