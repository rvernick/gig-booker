import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from '../auth/user.entity';
import { Venue } from './venue.entity';

@Entity({ name: 'user_favorite_venue' })
@Unique(['userId', 'venueId'])
export class UserFavoriteVenue {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ name: 'user_id', type: 'int', nullable: false })
  userId: number;

  @ManyToOne(() => User, { nullable: false, eager: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'venue_id', type: 'int', nullable: false })
  venueId: number;

  @ManyToOne(() => Venue, { nullable: false, eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'venue_id' })
  venue: Venue;

  @CreateDateColumn({ name: 'created_on' })
  createdOn: Date;
}
