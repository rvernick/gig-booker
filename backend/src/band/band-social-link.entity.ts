import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SocialSite } from '../social/social-site.enum';
import { Band } from './band.entity';

@Entity({ name: 'band_social_link' })
export class BandSocialLink {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ name: 'band_id', type: 'int', nullable: false })
  bandId: number;

  @ManyToOne(() => Band, (band) => band.socialLinks, {
    nullable: false,
    eager: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'band_id' })
  band: Band;

  @Column({
    type: 'enum',
    enum: SocialSite,
    name: 'site',
  })
  site: SocialSite;

  @Column({ type: 'varchar', length: 2048, name: 'url', nullable: false })
  url: string;

  @CreateDateColumn({ name: 'created_on' })
  createdOn: Date;

  @UpdateDateColumn({ name: 'updated_on' })
  updatedOn: Date;
}
