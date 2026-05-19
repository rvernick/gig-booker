import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { S3Media } from '../media/aws-media.entity';
import { BandMember } from './band-member.entity';
import { BandSocialLink } from './band-social-link.entity';

@Entity({ name: 'band' })
export class Band {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: false })
  name: string;

  @Column({ name: 'photo_id', type: 'int', nullable: true })
  photoId: number | null;

  @OneToOne(() => S3Media, {
    nullable: true,
    cascade: true,
    eager: true,
    orphanedRowAction: 'delete',
  })
  @JoinColumn({ name: 'photo_id' })
  photo: S3Media | null;

  @OneToMany(() => BandMember, (member) => member.band, { eager: false })
  members: BandMember[];

  @OneToMany(() => BandSocialLink, (link) => link.band, { eager: false })
  socialLinks: BandSocialLink[];

  @DeleteDateColumn({
    name: 'deleted_on',
    nullable: true,
  })
  deletedOn: Date | null;

  @CreateDateColumn({ name: 'created_on' })
  createdOn: Date;

  @UpdateDateColumn({ name: 'updated_on' })
  updatedOn: Date;
}
