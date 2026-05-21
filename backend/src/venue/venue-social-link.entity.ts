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
import { Venue } from './venue.entity';

@Entity({ name: 'venue_social_link' })
export class VenueSocialLink {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ name: 'venue_id', type: 'int', nullable: false })
  venueId: number;

  @ManyToOne(() => Venue, (venue) => venue.socials, {
    nullable: false,
    eager: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'venue_id' })
  venue: Venue;

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
