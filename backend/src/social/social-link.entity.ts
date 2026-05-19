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
import { User } from '../auth/user.entity';
import { SocialSite } from './social-site.enum';

@Entity({ name: 'social_link' })
export class SocialLink {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ name: 'user_id', type: 'int', nullable: false })
  userId: number;

  @ManyToOne(() => User, (user) => user.socialLinks, {
    nullable: false,
    eager: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

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
