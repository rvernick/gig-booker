import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Band } from './band.entity';
import { BandMember } from './band-member.entity';
import { User } from '../auth/user.entity';
import { S3MediaService } from '../media/aws-media.service';
import { deleteBikePhoto } from '../utils/aws';

@Injectable()
export class BandService {
  constructor(
    @InjectRepository(Band)
    private readonly bandRepo: Repository<Band>,
    @InjectRepository(BandMember)
    private readonly bandMemberRepo: Repository<BandMember>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly mediaService: S3MediaService,
  ) {}

  async bandsForUser(username: string): Promise<Band[]> {
    const memberships = await this.bandMemberRepo
      .createQueryBuilder('bm')
      .innerJoin('bm.user', 'user')
      .innerJoinAndSelect('bm.band', 'band')
      .where('user.username = :username', { username })
      .getMany();

    const seen = new Set<number>();
    const bands: Band[] = [];
    for (const m of memberships) {
      if (m.band && !seen.has(m.band.id)) {
        seen.add(m.band.id);
        bands.push(m.band);
      }
    }
    return bands;
  }

  async bandByIdForUser(username: string, id: number): Promise<Band> {
    const membershipCount = await this.bandMemberRepo
      .createQueryBuilder('bm')
      .innerJoin('bm.user', 'user')
      .where('bm.bandId = :id', { id })
      .andWhere('user.username = :username', { username })
      .getCount();

    if (membershipCount <= 0) {
      throw new ForbiddenException('User is not a member of this band');
    }

    const band = await this.bandRepo.findOne({ where: { id } });
    if (!band) {
      throw new NotFoundException('Band not found');
    }
    return band;
  }

  private async membershipForBand(username: string, bandId: number): Promise<BandMember> {
    const member = await this.bandMemberRepo
      .createQueryBuilder('bm')
      .innerJoinAndSelect('bm.user', 'user')
      .where('bm.bandId = :bandId', { bandId })
      .andWhere('user.username = :username', { username })
      .getOne();

    if (!member) {
      throw new ForbiddenException('User is not a member of this band');
    }
    return member;
  }

  private async ensureAdmin(username: string, bandId: number): Promise<void> {
    const member = await this.membershipForBand(username, bandId);
    const perms = member.permissions ?? [];
    if (!perms.includes('admin')) {
      throw new ForbiddenException('User is not an admin of this band');
    }
  }

  async membersForBand(
    username: string,
    bandId: number,
  ): Promise<{ userId: number; username: string; firstName: string; lastName: string; permissions: string[] }[]> {
    // Must be a member to see roster
    await this.membershipForBand(username, bandId);

    const members = await this.bandMemberRepo
      .createQueryBuilder('bm')
      .innerJoinAndSelect('bm.user', 'user')
      .where('bm.bandId = :bandId', { bandId })
      .orderBy('user.username', 'ASC')
      .getMany();

    return members.map((m) => ({
      userId: m.userId,
      username: m.user?.username ?? '',
      firstName: m.user?.firstName ?? '',
      lastName: m.user?.lastName ?? '',
      permissions: m.permissions ?? [],
    }));
  }

  async addMemberToBand(username: string, bandId: number, memberUsername: string): Promise<void> {
    await this.ensureAdmin(username, bandId);
    const targetUsername = (memberUsername ?? '').trim().toLowerCase();
    if (targetUsername.length === 0) {
      throw new BadRequestException('memberUsername required');
    }

    const user = await this.userRepo.findOne({ where: { username: targetUsername } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.bandMemberRepo.save(
      this.bandMemberRepo.create({
        bandId,
        userId: user.id,
        permissions: ['member'],
      }),
    );
  }

  async removeMemberFromBand(username: string, bandId: number, memberUsername: string): Promise<void> {
    await this.ensureAdmin(username, bandId);
    const targetUsername = (memberUsername ?? '').trim().toLowerCase();
    if (targetUsername.length === 0) {
      throw new BadRequestException('memberUsername required');
    }

    const user = await this.userRepo.findOne({ where: { username: targetUsername } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.bandMemberRepo.delete({ bandId, userId: user.id });
  }

  async updateBandForUser(username: string, id: number, name: string): Promise<Band> {
    const band = await this.bandByIdForUser(username, id);
    if (!name || name.trim().length === 0) {
      return band;
    }
    band.name = name.trim();
    return this.bandRepo.save(band);
  }

  async createBandForUser(username: string, name: string): Promise<Band> {
    const trimmedName = (name ?? '').trim();
    if (trimmedName.length === 0) {
      throw new BadRequestException('Band name is required');
    }
    const user = await this.userRepo.findOne({ where: { username: username.toLowerCase() } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const band = await this.bandRepo.save(
      this.bandRepo.create({
        name: trimmedName,
        photoId: null,
      }),
    );

    await this.bandMemberRepo.save(
      this.bandMemberRepo.create({
        bandId: band.id,
        userId: user.id,
        permissions: ['admin'],
      }),
    );

    return band;
  }

  async upsertBandForUser(username: string, id: number, name: string): Promise<Band> {
    if (id && id > 0) {
      return this.updateBandForUser(username, id, name);
    }
    return this.createBandForUser(username, name);
  }

  async updateBandPhoto(username: string, bandId: number, file: Express.Multer.File): Promise<Band> {
    if (!file?.buffer || file.size <= 0) {
      throw new BadRequestException('File required');
    }

    await this.ensureAdmin(username, bandId);

    const user = await this.userRepo.findOne({ where: { username: username.trim().toLowerCase() } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const band = await this.bandByIdForUser(username, bandId);
    const oldPhoto = band.photo;

    const newMedia = await this.mediaService.createPhoto(file, user.id);
    if (!newMedia) {
      throw new BadRequestException('Photo upload failed');
    }

    band.photoId = newMedia.id;
    band.photo = newMedia;
    await this.bandRepo.save(band);

    if (oldPhoto?.bucket && oldPhoto?.key) {
      await deleteBikePhoto(oldPhoto.bucket, oldPhoto.key);
    }

    const refreshed = await this.bandRepo.findOne({ where: { id: bandId } });
    if (!refreshed) {
      throw new NotFoundException('Band not found');
    }
    return refreshed;
  }
}
