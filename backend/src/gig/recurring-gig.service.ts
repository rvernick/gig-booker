import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecurringGig } from './recurring-gig.entity';
import { BandMember } from '../band/band-member.entity';
import { User } from '../auth/user.entity';
import { FrequencyType } from './frequency-type.enum';
import { DayOfWeek } from './day-of-week.enum';
import { WeekOrdinal } from './week-ordinal.enum';
import { GigTimeOfDay } from './gig-time-of-day.enum';
import { Band } from '../band/band.entity';
import { Venue } from '../venue/venue.entity';
import { devLog } from '../utils/utils';

@Injectable()
export class RecurringGigService {
  constructor(
    @InjectRepository(RecurringGig)
    private readonly recurringGigRepo: Repository<RecurringGig>,
    @InjectRepository(Band)
    private readonly bandRepo: Repository<Band>,
    @InjectRepository(Venue)
    private readonly venueRepo: Repository<Venue>,
    @InjectRepository(BandMember)
    private readonly bandMemberRepo: Repository<BandMember>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async recurringGigsForUser(username: string): Promise<RecurringGig[]> {
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

    return this.recurringGigRepo
      .createQueryBuilder('rg')
      .innerJoinAndSelect('rg.band', 'band')
      .innerJoinAndSelect('rg.venue', 'venue')
      .innerJoinAndSelect('venue.location', 'location')
      .where('rg.band_id IN (:...bandIds)', { bandIds })
      .andWhere('rg.deleted_on IS NULL')
      .orderBy('rg.frequency_type', 'ASC')
      .addOrderBy('rg.day_of_week', 'ASC')
      .getMany();
  }

  async createRecurringGig(
    username: string,
    bandId: number,
    venueId: number,
    frequencyType: FrequencyType,
    dayOfWeek: DayOfWeek,
    weekOrdinal: WeekOrdinal | null,
    timeOfDay: GigTimeOfDay,
  ): Promise<RecurringGig> {
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
      throw new ForbiddenException('User is not a member of this band');
    }

    if (frequencyType === FrequencyType.MONTHLY && !weekOrdinal) {
      throw new BadRequestException('weekOrdinal is required for monthly frequency');
    }

    const recurring = this.recurringGigRepo.create({
      bandId,
      venueId,
      frequencyType,
      dayOfWeek,
      weekOrdinal: frequencyType === FrequencyType.MONTHLY ? weekOrdinal : null,
      timeOfDay: timeOfDay ?? GigTimeOfDay.NIGHT,
    });

    const saved = await this.recurringGigRepo.save(recurring);

    const full = await this.recurringGigRepo.findOne({ where: { id: saved.id } });
    if (!full) throw new NotFoundException('RecurringGig not found after save');
    return full;
  }

  async updateRecurringGig(
    username: string,
    id: number,
    bandId: number,
    venueId: number,
    frequencyType: FrequencyType,
    dayOfWeek: DayOfWeek,
    weekOrdinal: WeekOrdinal | null,
    timeOfDay: GigTimeOfDay,
  ): Promise<RecurringGig> {
    const rg = await this.recurringGigRepo.findOne({ where: { id } });
    if (!rg) throw new NotFoundException('RecurringGig not found');

    const membership = await this.bandMemberRepo
      .createQueryBuilder('bm')
      .innerJoin('bm.user', 'user')
      .where('bm.bandId = :bandId', { bandId: rg.bandId })
      .andWhere('user.username = :username', { username })
      .getOne();

    if (!membership) throw new ForbiddenException('User is not a member of this band');

    if (frequencyType === FrequencyType.MONTHLY && !weekOrdinal) {
      throw new BadRequestException('weekOrdinal is required for monthly frequency');
    }
    const band = await this.bandRepo.findOne({ where: { id: bandId } });
    if (!band) throw new NotFoundException('Band not found ' + bandId);
    const venue = await this.venueRepo.findOne({ where: { id: venueId } });
    if (!venue) throw new NotFoundException('Band not found ' + venueId);

    devLog('Updating gig from: ', rg);
    devLog('bandId to: ', bandId);
    devLog('venueId to: ', venueId);

    rg.band = band;
    rg.venue = venue;
    rg.frequencyType = frequencyType;
    rg.dayOfWeek = dayOfWeek;
    rg.weekOrdinal = frequencyType === FrequencyType.MONTHLY ? weekOrdinal : null;
    rg.timeOfDay = timeOfDay ?? GigTimeOfDay.NIGHT;

    const saved = await this.recurringGigRepo.save(rg);

    const full = await this.recurringGigRepo.findOne({ where: { id: saved.id } });
    if (!full) throw new NotFoundException('RecurringGig not found after save');
    return full;
  }

  async deleteRecurringGig(username: string, id: number): Promise<void> {
    const rg = await this.recurringGigRepo.findOne({ where: { id } });
    if (!rg) throw new NotFoundException('RecurringGig not found');

    const membership = await this.bandMemberRepo
      .createQueryBuilder('bm')
      .innerJoin('bm.user', 'user')
      .where('bm.bandId = :bandId', { bandId: rg.bandId })
      .andWhere('user.username = :username', { username })
      .getOne();

    if (!membership) throw new ForbiddenException('User is not a member of this band');

    await this.recurringGigRepo.softDelete(id);
  }
}
